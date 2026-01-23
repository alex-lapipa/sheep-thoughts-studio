import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, MessageCircle, Radio } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { AudioWaveform } from "./AudioWaveform";
import { MicActivityIndicator } from "./MicActivityIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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
  innocent: "text-bubbles-meadow",
  concerned: "text-bubbles-mist",
  triggered: "text-mode-triggered",
  savage: "text-mode-savage",
  nuclear: "text-mode-nuclear",
};

const MODE_BG: Record<string, string> = {
  innocent: "bg-bubbles-meadow/10 border-bubbles-meadow/20",
  concerned: "bg-bubbles-mist/10 border-bubbles-mist/20",
  triggered: "bg-mode-triggered/10 border-mode-triggered/20",
  savage: "bg-mode-savage/10 border-mode-savage/20",
  nuclear: "bg-mode-nuclear/10 border-mode-nuclear/20",
};

const VOICE_SETTINGS_KEY = "bubbles-voice-compact";

export const CompactVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentMode, setCurrentMode] = useState("innocent");
  const [latestResponse, setLatestResponse] = useState<string>("");
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-IE";

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
        
        setInterimTranscript(interim);
        
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
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
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
      }
    }
  }, [isListening]);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, rate: 0.95 }),
        }
      );

      if (!response.ok) throw new Error("TTS failed");

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
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

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
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("bubbles-voice-chat", {
        body: { message: text, conversationHistory },
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
      setLatestResponse(data.reply);
      speak(data.reply);

    } catch (err) {
      console.error("Voice chat error:", err);
      toast.error("Bubbles is having a moment. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="relative">
      {/* Main glassmorphism container */}
      <div className="relative backdrop-blur-2xl bg-card/40 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1),0_0_60px_rgba(var(--accent-rgb),0.06)] overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-bubbles-gorse/5 via-transparent to-bubbles-heather/5 pointer-events-none" />
        
        {/* Floating orbs */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-bubbles-meadow/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-tr from-bubbles-heather/15 to-accent/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isSpeaking 
                    ? "bg-accent/20 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]" 
                    : "bg-accent/10"
                )}>
                  <MessageCircle className={cn(
                    "h-5 w-5 text-accent transition-transform",
                    isSpeaking && "animate-pulse"
                  )} />
                </div>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-ping" />
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">Ask Bubbles</h3>
                <p className="text-[10px] text-muted-foreground">Confidently wrong answers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mode badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] capitalize px-2 py-0.5 transition-all",
                  MODE_BG[currentMode]
                )}
              >
                <span className={MODE_COLORS[currentMode]}>{currentMode}</span>
              </Badge>
              
              {/* Audio waveform */}
              <AudioWaveform audioElement={audioRef.current} isActive={isSpeaking} />
              
              {/* Voice toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  voiceEnabled ? "text-accent" : "text-muted-foreground"
                )}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Response display area - compact */}
          <div className="min-h-[80px] mb-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-20 gap-3"
                >
                  <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  <span className="text-sm text-muted-foreground">Bubbles is thinking...</span>
                </motion.div>
              ) : latestResponse ? (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-4 rounded-2xl border backdrop-blur-sm transition-all",
                    MODE_BG[currentMode]
                  )}
                >
                  <p className={cn(
                    "text-sm leading-relaxed line-clamp-3",
                    MODE_COLORS[currentMode]
                  )}>
                    "{latestResponse}"
                  </p>
                  {isSpeaking && (
                    <div className="flex items-center gap-2 mt-2">
                      <Radio className="h-3 w-3 text-accent animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Speaking...</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-20 text-center"
                >
                  <p className="text-sm text-muted-foreground">Ask anything...</p>
                  <p className="text-[10px] text-muted-foreground/60">Prepare for confident misinformation</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={interimTranscript || input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                disabled={isLoading}
                className={cn(
                  "h-11 rounded-xl bg-background/60 border-white/20 pr-10 transition-all",
                  isListening && "border-accent/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]"
                )}
              />
              {/* Mic activity */}
              <MicActivityIndicator isActive={isListening} className="absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <Button
              type="button"
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "h-11 w-11 rounded-xl transition-all",
                isListening && "bg-accent text-accent-foreground shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !interimTranscript)}
              className="h-11 px-5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          
          {/* Footer link */}
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-white/10">
            <Link 
              to="/talk" 
              className="text-[11px] text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <Radio className="h-3 w-3" />
              Try real-time voice conversation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
