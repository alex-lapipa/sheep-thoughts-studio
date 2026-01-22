import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, MessageCircle, Sparkles, Settings2 } from "lucide-react";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThoughtBubble } from "./ThoughtBubble";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

// Sound wave animation component
const SoundWaveIndicator = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-accent/10">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-accent rounded-full sound-wave-bar"
          style={{
            height: '14px',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <span className="ml-1 text-xs text-accent font-medium">Speaking</span>
    </div>
  );
};

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
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(storedSettings.voiceEnabled);
  const [currentMode, setCurrentMode] = useState("innocent");
  const [speechRate, setSpeechRate] = useState(storedSettings.speechRate);
  const [speechPitch, setSpeechPitch] = useState(storedSettings.speechPitch);
  
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
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-IE"; // Irish English

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please enable it in your browser settings.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
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

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current = utterance;

    // Try to find an Irish or British English voice
    const voices = window.speechSynthesis.getVoices();
    const irishVoice = voices.find(v => 
      v.lang.includes("en-IE") || 
      v.name.toLowerCase().includes("irish") ||
      v.name.toLowerCase().includes("moira")
    );
    const britishVoice = voices.find(v => 
      v.lang.includes("en-GB") && 
      v.name.toLowerCase().includes("male")
    );
    const maleVoice = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel"))
    );

    utterance.voice = irishVoice || britishVoice || maleVoice || voices[0];
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, speechRate, speechPitch]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
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

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        mode: data.mode,
      };

      setMessages(prev => [...prev, assistantMessage]);
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
    <Card className="w-full max-w-2xl mx-auto border-2 border-accent/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-accent" />
            <span>Chat with Bubbles</span>
            <Sparkles className="h-4 w-4 text-bubbles-gorse" />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize", MODE_COLORS[currentMode])}
            >
              {currentMode}
            </Badge>
            
            {/* Sound wave indicator when speaking */}
            <SoundWaveIndicator isActive={isSpeaking} />
            
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Messages Area */}
        <div className="h-[300px] overflow-y-auto space-y-3 p-2 rounded-lg bg-muted/30">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <p className="text-center">
                Ask Bubbles anything...<br />
                <span className="text-xs italic">Use the microphone or type below</span>
              </p>
            </div>
          )}

          {messages.map((message) => (
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

          {isLoading && (
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

        {/* Input Area */}
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

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask Bubbles something..."}
            disabled={isLoading || isListening}
            className="flex-1"
          />

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

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
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
          <span className="italic">RAG-powered personality</span>
        </div>
      </CardContent>
    </Card>
  );
};
