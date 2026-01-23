import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, Settings2, Radio } from "lucide-react";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { AudioWaveform } from "./AudioWaveform";
import { MicActivityIndicator } from "./MicActivityIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

// SVG Component for the TV Screen with Bubbles
const TVScreen = ({ message, mode, isLoading, isSpeaking }: { 
  message?: string; 
  mode?: string; 
  isLoading: boolean;
  isSpeaking: boolean;
}) => {
  return (
    <div className="relative w-full aspect-video max-w-md mx-auto">
      {/* TV Frame */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Inner bezel */}
        <div className="absolute inset-3 rounded-md bg-gradient-to-br from-zinc-600 to-zinc-800 p-2">
          {/* Screen */}
          <div className="relative w-full h-full rounded-sm overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* CRT scanline effect */}
            <div className="absolute inset-0 pointer-events-none z-20 opacity-10" 
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              }}
            />
            
            {/* Screen glow when speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-gradient-to-br from-bubbles-meadow/20 via-transparent to-accent/20 animate-pulse pointer-events-none z-10" />
            )}
            
            {/* Bubbles character on screen */}
            <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full">
              {/* Background - Studio setting */}
              <defs>
                <radialGradient id="studioLight" cx="50%" cy="30%" r="80%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="screenBg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(145 40% 25%)" />
                  <stop offset="100%" stopColor="hsl(145 30% 15%)" />
                </linearGradient>
              </defs>
              
              {/* Studio background */}
              <rect width="200" height="150" fill="url(#screenBg)" />
              <ellipse cx="100" cy="40" rx="80" ry="40" fill="url(#studioLight)" />
              
              {/* Desk/podium */}
              <rect x="30" y="105" width="140" height="45" rx="3" fill="hsl(25 30% 25%)" />
              <rect x="30" y="105" width="140" height="8" rx="2" fill="hsl(25 35% 35%)" />
              
              {/* ON AIR sign */}
              <g transform="translate(150, 15)">
                <rect x="0" y="0" width="40" height="18" rx="2" fill={isSpeaking ? "hsl(0 70% 50%)" : "hsl(0 20% 30%)"} />
                <text x="20" y="12" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">ON AIR</text>
                {isSpeaking && (
                  <circle cx="8" cy="9" r="3" fill="hsl(0 80% 60%)">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
              
              {/* Bubbles - Front view, behind desk */}
              <g transform="translate(100, 75)">
                {/* Body - fluffy wool (visible above desk) */}
                <ellipse cx="0" cy="15" rx="28" ry="20" fill="hsl(var(--bubbles-wool))" />
                
                {/* Wool texture puffs */}
                {[[-20, 5], [-15, -5], [-5, -10], [5, -10], [15, -5], [20, 5], [-18, 15], [18, 15]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={6 + Math.random() * 3} fill="hsl(var(--bubbles-wool))" opacity="0.9" />
                ))}
                
                {/* Head */}
                <ellipse cx="0" cy="-15" rx="22" ry="18" fill="hsl(var(--bubbles-wool))" />
                
                {/* Ears */}
                <ellipse cx="-22" cy="-20" rx="8" ry="5" fill="hsl(var(--bubbles-face))" transform="rotate(-20 -22 -20)" />
                <ellipse cx="22" cy="-20" rx="8" ry="5" fill="hsl(var(--bubbles-face))" transform="rotate(20 22 -20)" />
                <ellipse cx="-22" cy="-20" rx="5" ry="3" fill="hsl(350 60% 70%)" transform="rotate(-20 -22 -20)" opacity="0.5" />
                <ellipse cx="22" cy="-20" rx="5" ry="3" fill="hsl(350 60% 70%)" transform="rotate(20 22 -20)" opacity="0.5" />
                
                {/* Face */}
                <ellipse cx="0" cy="-8" rx="14" ry="12" fill="hsl(var(--bubbles-face))" />
                
                {/* Eyes */}
                <g className={isSpeaking ? "animate-pulse" : ""}>
                  <ellipse cx="-6" cy="-12" rx="4" ry="5" fill="white" />
                  <ellipse cx="6" cy="-12" rx="4" ry="5" fill="white" />
                  <circle cx="-5" cy="-11" r="2.5" fill="hsl(220 60% 20%)" />
                  <circle cx="7" cy="-11" r="2.5" fill="hsl(220 60% 20%)" />
                  <circle cx="-4" cy="-12" r="1" fill="white" />
                  <circle cx="8" cy="-12" r="1" fill="white" />
                </g>
                
                {/* Eyebrows - expressive based on mode */}
                {mode === 'triggered' || mode === 'savage' || mode === 'nuclear' ? (
                  <>
                    <line x1="-10" y1="-18" x2="-3" y2="-16" stroke="hsl(25 30% 25%)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="10" y1="-18" x2="3" y2="-16" stroke="hsl(25 30% 25%)" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="-10,-17 Q-6,-19 -3,-17" fill="none" stroke="hsl(25 30% 25%)" strokeWidth="1" />
                    <path d="10,-17 Q6,-19 3,-17" fill="none" stroke="hsl(25 30% 25%)" strokeWidth="1" />
                  </>
                )}
                
                {/* Nose */}
                <ellipse cx="0" cy="-4" rx="3" ry="2" fill="hsl(350 40% 60%)" />
                
                {/* Mouth - animated when speaking */}
                {isSpeaking ? (
                  <ellipse cx="0" cy="2" rx="4" ry="3" fill="hsl(350 30% 40%)">
                    <animate attributeName="ry" values="3;4;2;4;3" dur="0.3s" repeatCount="indefinite" />
                  </ellipse>
                ) : (
                  <path d="M-4,1 Q0,5 4,1" fill="none" stroke="hsl(350 30% 40%)" strokeWidth="1.5" strokeLinecap="round" />
                )}
                
                {/* Headphones */}
                <path d="M-24,-15 Q-26,-35 0,-38 Q26,-35 24,-15" fill="none" stroke="hsl(0 0% 20%)" strokeWidth="4" />
                <ellipse cx="-24" cy="-12" rx="6" ry="8" fill="hsl(0 0% 25%)" />
                <ellipse cx="24" cy="-12" rx="6" ry="8" fill="hsl(0 0% 25%)" />
                <ellipse cx="-24" cy="-12" rx="4" ry="6" fill="hsl(0 0% 35%)" />
                <ellipse cx="24" cy="-12" rx="4" ry="6" fill="hsl(0 0% 35%)" />
              </g>
              
              {/* Desk microphone */}
              <g transform="translate(60, 95)">
                <rect x="-3" y="0" width="6" height="20" fill="hsl(0 0% 30%)" />
                <ellipse cx="0" cy="0" rx="8" ry="12" fill="hsl(0 0% 25%)" />
                <ellipse cx="0" cy="0" rx="6" ry="10" fill="hsl(0 0% 40%)" />
                {/* Mic grille pattern */}
                {[-6, -3, 0, 3, 6].map((y, i) => (
                  <line key={i} x1="-4" y1={y} x2="4" y2={y} stroke="hsl(0 0% 20%)" strokeWidth="0.5" />
                ))}
              </g>
            </svg>
            
            {/* Speech bubble with message */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-2 left-2 right-2 bg-white/95 rounded-lg p-2 shadow-lg max-h-16 overflow-hidden"
              >
                <p className={cn(
                  "text-xs text-slate-800 line-clamp-3",
                  mode && MODE_COLORS[mode]
                )}>
                  "{message}"
                </p>
              </motion.div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                <Loader2 className="h-3 w-3 text-white animate-spin" />
                <span className="text-[10px] text-white">Thinking...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* TV base/stand */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-b-lg" />
      </div>
    </div>
  );
};

// Silhouette viewer with studio mic
const StudioViewer = ({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) => {
  return (
    <div className="relative w-full h-32 mt-4">
      <svg viewBox="0 0 400 120" className="w-full h-full">
        {/* Studio desk/console */}
        <rect x="50" y="80" width="300" height="40" rx="4" fill="hsl(0 0% 15%)" />
        <rect x="50" y="80" width="300" height="8" rx="2" fill="hsl(0 0% 25%)" />
        
        {/* Console buttons/lights */}
        {[80, 110, 140, 260, 290, 320].map((x, i) => (
          <circle key={i} cx={x} cy="100" r="4" fill={i < 3 ? "hsl(120 60% 40%)" : "hsl(0 0% 30%)"} />
        ))}
        
        {/* Faders */}
        {[170, 190, 210, 230].map((x, i) => (
          <g key={i}>
            <rect x={x - 3} y="88" width="6" height="25" rx="1" fill="hsl(0 0% 20%)" />
            <rect x={x - 2} y={95 + i * 3} width="4" height="8" rx="1" fill="hsl(0 0% 50%)" />
          </g>
        ))}
        
        {/* Viewer silhouette - person from behind */}
        <g transform="translate(200, 45)">
          {/* Chair back */}
          <rect x="-30" y="20" width="60" height="50" rx="5" fill="hsl(0 0% 10%)" />
          
          {/* Shoulders/body */}
          <ellipse cx="0" cy="25" rx="35" ry="20" fill="hsl(0 0% 8%)" />
          
          {/* Head */}
          <ellipse cx="0" cy="-5" rx="18" ry="22" fill="hsl(0 0% 8%)" />
          
          {/* Ears (outline) */}
          <ellipse cx="-18" cy="-3" rx="4" ry="7" fill="hsl(0 0% 10%)" />
          <ellipse cx="18" cy="-3" rx="4" ry="7" fill="hsl(0 0% 10%)" />
          
          {/* Headphones on user */}
          <path d="M-22,-5 Q-24,-30 0,-32 Q24,-30 22,-5" fill="none" stroke="hsl(0 0% 15%)" strokeWidth="5" />
          <ellipse cx="-22" cy="-3" rx="5" ry="8" fill="hsl(0 0% 18%)" />
          <ellipse cx="22" cy="-3" rx="5" ry="8" fill="hsl(0 0% 18%)" />
        </g>
        
        {/* Broadcast microphone - professional studio style */}
        <g transform="translate(120, 30)">
          {/* Boom arm */}
          <rect x="-2" y="40" width="4" height="50" fill="hsl(0 0% 25%)" />
          <rect x="-15" y="0" width="4" height="45" fill="hsl(0 0% 25%)" transform="rotate(30 -13 0)" />
          
          {/* Mic body - Shure SM7B style */}
          <g transform="rotate(-15)">
            <rect x="-8" y="-5" width="45" height="20" rx="10" fill="hsl(0 0% 20%)" />
            <rect x="-5" y="-3" width="38" height="16" rx="8" fill="hsl(0 0% 30%)" />
            {/* Grille */}
            <ellipse cx="30" cy="5" rx="12" ry="8" fill="hsl(0 0% 25%)" />
            <ellipse cx="30" cy="5" rx="10" ry="6" fill="hsl(0 0% 35%)" />
            {/* Grille lines */}
            {[-4, -2, 0, 2, 4].map((y, i) => (
              <line key={i} x1="22" y1={5 + y} x2="38" y2={5 + y} stroke="hsl(0 0% 20%)" strokeWidth="0.5" />
            ))}
          </g>
          
          {/* Mic activity glow */}
          {isListening && (
            <circle cx="25" cy="0" r="18" fill="hsl(0 70% 50%)" opacity="0.3">
              <animate attributeName="r" values="18;22;18" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
        
        {/* Recording indicator */}
        {isListening && (
          <g transform="translate(350, 20)">
            <circle cx="0" cy="0" r="6" fill="hsl(0 70% 50%)">
              <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <text x="10" y="4" fill="hsl(0 70% 50%)" fontSize="10" fontWeight="bold">REC</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const BroadcastStudio = () => {
  const storedSettings = getStoredSettings();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(storedSettings.voiceEnabled);
  const [currentMode, setCurrentMode] = useState("innocent");
  const [speechRate, setSpeechRate] = useState(storedSettings.speechRate);
  const [speechPitch, setSpeechPitch] = useState(storedSettings.speechPitch);
  const [latestResponse, setLatestResponse] = useState<string>("");
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      setLatestResponse(data.reply);

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

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Studio header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Radio className="h-5 w-5 text-accent" />
        <h2 className="font-display text-2xl font-bold text-center">
          Bubbles Broadcasting Studio
        </h2>
        <Badge variant="outline" className={cn("text-xs capitalize", MODE_COLORS[currentMode])}>
          {currentMode}
        </Badge>
      </div>
      
      {/* Studio environment */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Ambient studio lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-bubbles-meadow/5 pointer-events-none" />
        
        {/* Studio ceiling lights */}
        <div className="absolute top-0 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
        <div className="absolute top-0 right-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
        
        {/* TV Screen with Bubbles */}
        <TVScreen 
          message={latestResponse} 
          mode={currentMode}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
        />
        
        {/* Viewer silhouette with microphone */}
        <StudioViewer isListening={isListening} isSpeaking={isSpeaking} />
        
        {/* Control panel */}
        <div className="mt-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-3">
            {/* Microphone button */}
            <Button
              type="button"
              onClick={toggleListening}
              variant={isListening ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full transition-all shrink-0",
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                  : "border-slate-600 hover:border-accent hover:text-accent"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {/* Input field */}
            <div className="relative flex-1">
              <Input
                value={interimTranscript || input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask Bubbles anything..."}
                className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-12"
                disabled={isLoading || isListening}
              />
              {isListening && (
                <MicActivityIndicator isActive={true} className="absolute right-3 top-1/2 -translate-y-1/2" compact />
              )}
            </div>
            
            {/* Send button */}
            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !interimTranscript)}
              className="h-12 px-6 bg-accent hover:bg-accent/90"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          
          {/* Bottom controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <AudioWaveform 
                audioElement={audioRef.current} 
                isActive={isSpeaking}
              />
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Stop Speaking
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Settings Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white"
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
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={cn(
                  "gap-2",
                  voiceEnabled 
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                    : "bg-slate-700 text-slate-400"
                )}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span className="text-xs">Sound On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span className="text-xs">Sound Off</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
