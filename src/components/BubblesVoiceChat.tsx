import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, MessageCircle, Sparkles, Settings2, History, Plus, Clock } from "lucide-react";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThoughtBubble } from "./ThoughtBubble";
import { AudioWaveform } from "./AudioWaveform";
import { MicActivityIndicator } from "./MicActivityIndicator";
import { VoiceServicesStatus } from "./VoiceServicesStatus";
import { useVoiceChatHistory } from "@/hooks/useVoiceChatHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
}

const MODE_COLORS: Record<string, string> = {
  innocent: "bg-bubbles-meadow/20 text-bubbles-meadow border-bubbles-meadow/30",
  concerned: "bg-bubbles-mist/20 text-bubbles-mist border-bubbles-mist/30",
  triggered: "bg-mode-triggered/20 text-mode-triggered border-mode-triggered/30",
  savage: "bg-mode-savage/20 text-mode-savage border-mode-savage/30",
  nuclear: "bg-mode-nuclear/20 text-mode-nuclear border-mode-nuclear/30",
};

// Legacy SoundWaveIndicator removed - now using AudioWaveform component

const VOICE_SETTINGS_KEY = "bubbles-voice-settings";

interface VoiceSettings {
  voiceEnabled: boolean;
  speechRate: number;
  speechPitch: number;
}

const getStoredSettings = (): VoiceSettings => {
  try {
    const stored = localStorage.getItem(VOICE_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load voice settings:", e);
  }
  return { voiceEnabled: true, speechRate: 0.95, speechPitch: 0.9 };
};

export const BubblesVoiceChat = () => {
  const storedSettings = getStoredSettings();
  
  // Use the persistent history hook
  const { 
    messages, 
    isLoading: isHistoryLoading, 
    sessions, 
    saveMessage, 
    startNewSession,
    loadSession 
  } = useVoiceChatHistory();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(storedSettings.voiceEnabled);
  const [currentMode, setCurrentMode] = useState("innocent");
  const [speechRate, setSpeechRate] = useState(storedSettings.speechRate);
  const [speechPitch, setSpeechPitch] = useState(storedSettings.speechPitch);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingSession, setViewingSession] = useState<Message[] | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist voice settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify({
        voiceEnabled,
        speechRate,
        speechPitch,
      }));
    } catch (e) {
      console.warn("Failed to save voice settings:", e);
    }
  }, [voiceEnabled, speechRate, speechPitch]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; // Enable interim results
      recognitionRef.current.lang = "en-IE"; // Irish English

      recognitionRef.current.onresult = (event) => {
        let interim = "";
        let final = "";
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        
        // Show interim transcript as user speaks
        setInterimTranscript(interim);
        
        // When we have a final result, set it as input
        if (final) {
          setInput(final);
          setInterimTranscript("");
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setInterimTranscript("");
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please enable it in your browser settings.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        toast.error("Failed to start listening");
      }
    }
  }, [isListening]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);

    try {
      // Call ElevenLabs TTS edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text, 
            rate: speechRate 
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      setIsSpeaking(false);
      // Fallback to browser TTS if ElevenLabs fails
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [voiceEnabled, speechRate, speechPitch]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Save user message to persistent history
    await saveMessage({
      role: "user",
      content: text,
    });
    
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("bubbles-voice-chat", {
        body: { 
          message: text,
          conversationHistory 
        },
      });

      if (error) throw error;

      // Save assistant message to persistent history
      await saveMessage({
        role: "assistant",
        content: data.reply,
        mode: data.mode,
      });
      
      setCurrentMode(data.mode || "innocent");

      // Speak the response
      speak(data.reply);

    } catch (err) {
      console.error("Voice chat error:", err);
      toast.error("Bubbles is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Trigger voices loading
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-2xl bg-card/60 border-2 border-white/30 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_80px_rgba(var(--accent-rgb),0.08)] relative overflow-hidden rounded-3xl">
      {/* Enhanced glassmorphism layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-bubbles-gorse/5 via-transparent to-bubbles-heather/5 pointer-events-none" />
      
      {/* Floating animated orbs */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-bubbles-meadow/20 to-accent/10 blur-3xl pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-gradient-to-tr from-accent/15 to-bubbles-gorse/10 blur-3xl pointer-events-none animate-[pulse_5s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 -right-12 w-32 h-32 rounded-full bg-bubbles-heather/10 blur-2xl pointer-events-none animate-[pulse_6s_ease-in-out_infinite_2s]" />
      <CardHeader className="pb-4 pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-accent/10 backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <span className="font-display font-bold">Ask Bubbles Anything</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">Voice-powered • Always confidently wrong</p>
            </div>
            <Sparkles className="h-4 w-4 text-bubbles-gorse animate-pulse" />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize", MODE_COLORS[currentMode])}
            >
              {currentMode}
            </Badge>
            
            {/* Mic activity indicator when listening */}
            <MicActivityIndicator isActive={isListening} />
            
            {/* Audio waveform visualization responding to playback */}
            <AudioWaveform 
              audioElement={audioRef.current} 
              isActive={isSpeaking}
            />
            
            {/* History Panel Toggle */}
            <Popover open={showHistory} onOpenChange={setShowHistory}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", showHistory && "bg-accent/20")}
                  title="Conversation history"
                >
                  <History className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Previous Chats
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startNewSession}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      New
                    </Button>
                  </div>
                  
                  {sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No previous conversations yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sessions.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={async () => {
                            const msgs = await loadSession(session.sessionId);
                            setViewingSession(msgs);
                            setShowHistory(false);
                          }}
                          className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </div>
                          <div className="text-sm line-clamp-2">
                            {session.lastMessage}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {session.messageCount} messages
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Voice Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Voice settings"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Voice Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Speed</Label>
                      <span className="text-xs text-muted-foreground">{speechRate.toFixed(2)}x</span>
                    </div>
                    <Slider
                      value={[speechRate]}
                      onValueChange={([value]) => setSpeechRate(value)}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Pitch</Label>
                      <span className="text-xs text-muted-foreground">{speechPitch.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[speechPitch]}
                      onValueChange={([value]) => setSpeechPitch(value)}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSpeechRate(0.95);
                      setSpeechPitch(0.9);
                    }}
                  >
                    Reset to defaults
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant={voiceEnabled ? "default" : "secondary"}
              size="lg"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "h-10 px-4 gap-2 transition-all",
                voiceEnabled 
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" 
                  : "bg-muted text-muted-foreground"
              )}
              title={voiceEnabled ? "Mute voice" : "Enable voice"}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span className="text-sm font-medium">Sound Off</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Viewing past session banner */}
        {viewingSession && (
          <div className="mt-3 p-2 rounded-lg bg-bubbles-mist/10 border border-bubbles-mist/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Viewing past conversation ({viewingSession.length} messages)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingSession(null)}
              className="h-6 text-xs"
            >
              Back to current
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 relative z-10 pb-6">
        {/* Messages Area */}
        <div className="h-[320px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-background/40 backdrop-blur-md border border-white/20 shadow-inner">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading conversation...
            </div>
          ) : (viewingSession || messages).length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <p className="text-center">
                Ask Bubbles anything...<br />
                <span className="text-xs italic">Use the microphone or type below</span>
              </p>
            </div>
          ) : (
            <>
              {(viewingSession || messages).map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "user" ? (
                    <div className="bg-accent text-accent-foreground px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                      {message.content}
                    </div>
                  ) : (
                    <ThoughtBubble 
                      size="sm" 
                      className={cn(
                        "max-w-[85%]",
                        message.mode && MODE_COLORS[message.mode]?.split(" ")[0]
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.mode && (
                        <span className="text-[10px] text-muted-foreground mt-1 block italic">
                          [{message.mode}]
                        </span>
                      )}
                    </ThoughtBubble>
                  )}
                </div>
              ))}
            </>
          )}

          {isLoading && !viewingSession && (
            <div className="flex justify-start">
              <ThoughtBubble size="sm" className="animate-pulse">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="italic">Bubbles is thinking...</span>
                </div>
              </ThoughtBubble>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - disabled when viewing past sessions */}
        {viewingSession ? (
          <div className="p-3 rounded-xl bg-muted/50 text-center text-sm text-muted-foreground">
            Viewing past conversation • <button 
              onClick={() => setViewingSession(null)}
              className="text-accent hover:underline"
            >
              Return to chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "shrink-0 transition-all",
                isListening && "animate-pulse ring-2 ring-destructive"
              )}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 relative">
              <Input
                value={isListening && interimTranscript ? interimTranscript : input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask Bubbles something..."}
                disabled={isLoading || isListening}
                className={cn(
                  "w-full transition-all",
                  isListening && interimTranscript && "text-muted-foreground italic"
                )}
              />
              {isListening && interimTranscript && (
                <div className="absolute -top-6 left-0 text-xs text-destructive animate-pulse">
                  Transcribing...
                </div>
              )}
            </div>

            {isSpeaking ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stopSpeaking}
                className="shrink-0"
                title="Stop speaking"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </form>
        )}

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              {isListening && (
                <>
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Recording...
                </>
              )}
              {isSpeaking && (
                <>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Speaking...
                </>
              )}
            </span>
            <VoiceServicesStatus compact />
          </div>
          <span className="italic flex items-center gap-2">
            {messages.length > 0 && (
              <span className="text-bubbles-meadow">
                {messages.length} messages saved
              </span>
            )}
            RAG-powered personality
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
