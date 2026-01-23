import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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

// TV Screen component with Wicklow landscape and Bubbles in bog with microphone
const TVScreen = ({ message, mode, isLoading, isSpeaking }: { 
  message?: string; 
  mode?: string; 
  isLoading: boolean;
  isSpeaking: boolean;
}) => {
  // Random seed for consistent "weather" per session
  const randomSeed = useMemo(() => Math.random(), []);
  const timeOfDay = randomSeed < 0.3 ? "dawn" : randomSeed < 0.7 ? "midday" : "dusk";
  
  return (
    <div className="relative w-full aspect-video max-w-md mx-auto">
      {/* TV Frame - vintage CRT style */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-muted via-muted/80 to-muted-foreground/20 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Inner bezel */}
        <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-muted to-muted-foreground/30 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          {/* Screen with Wicklow landscape */}
          <div className="relative w-full h-full rounded-md overflow-hidden">
            {/* === WICKLOW LANDSCAPE INSIDE TV === */}
            <svg viewBox="0 0 400 225" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                {/* Sky gradients based on time of day */}
                <linearGradient id="tvSkyDawn" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(280 40% 45%)" />
                  <stop offset="20%" stopColor="hsl(340 60% 65%)" />
                  <stop offset="50%" stopColor="hsl(25 80% 70%)" />
                  <stop offset="100%" stopColor="hsl(45 50% 88%)" />
                </linearGradient>
                <linearGradient id="tvSkyMidday" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(210 60% 75%)" />
                  <stop offset="30%" stopColor="hsl(200 50% 82%)" />
                  <stop offset="100%" stopColor="hsl(40 30% 92%)" />
                </linearGradient>
                <linearGradient id="tvSkyDusk" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(250 35% 35%)" />
                  <stop offset="35%" stopColor="hsl(340 50% 55%)" />
                  <stop offset="85%" stopColor="hsl(35 60% 75%)" />
                </linearGradient>
                {/* Mountain gradients */}
                <linearGradient id="sugarloafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--bubbles-peat))" />
                  <stop offset="40%" stopColor="hsl(270 15% 35%)" />
                  <stop offset="100%" stopColor="hsl(120 25% 35%)" />
                </linearGradient>
                {/* Bog terrain gradient */}
                <linearGradient id="bogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--bubbles-meadow))" />
                  <stop offset="50%" stopColor="hsl(90 30% 35%)" />
                  <stop offset="100%" stopColor="hsl(var(--bubbles-peat))" />
                </linearGradient>
                {/* Heather patches */}
                <radialGradient id="heatherPatch">
                  <stop offset="0%" stopColor="hsl(var(--bubbles-heather))" />
                  <stop offset="100%" stopColor="hsl(300 25% 30%)" stopOpacity="0" />
                </radialGradient>
                {/* Atmospheric mist */}
                <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--bubbles-mist))" stopOpacity="0" />
                  <stop offset="70%" stopColor="hsl(var(--bubbles-mist))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--bubbles-mist))" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              {/* SKY */}
              <rect width="400" height="225" fill={`url(#tvSky${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)})`} />
              
              {/* Distant clouds */}
              <ellipse cx="80" cy="40" rx="45" ry="15" fill="hsl(0 0% 95%)" opacity="0.5">
                <animate attributeName="cx" values="80;420" dur="60s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="300" cy="55" rx="35" ry="12" fill="hsl(0 0% 95%)" opacity="0.4">
                <animate attributeName="cx" values="300;-50" dur="45s" repeatCount="indefinite" />
              </ellipse>
              
              {/* SUGARLOAF MOUNTAIN - Iconic asymmetric cone */}
              <path d="M 150 130 L 200 60 L 220 65 L 260 135 Q 205 140 150 130" fill="url(#sugarloafGrad)" />
              {/* Quartzite summit highlight */}
              <path d="M 195 65 L 200 60 L 220 65 L 215 70 Z" fill="hsl(270 10% 50%)" />
              
              {/* Rolling hills - mid-ground */}
              <path d="M 0 150 Q 100 120 200 140 T 400 130 L 400 225 L 0 225 Z" fill="hsl(120 30% 40%)" opacity="0.7" />
              <path d="M 0 160 Q 80 140 160 155 T 320 145 T 400 155 L 400 225 L 0 225 Z" fill="hsl(100 25% 38%)" opacity="0.8" />
              
              {/* BOG TERRAIN - Foreground */}
              <path d="M 0 170 Q 100 160 200 165 T 400 160 L 400 225 L 0 225 Z" fill="url(#bogGrad)" />
              
              {/* Heather patches */}
              <ellipse cx="50" cy="190" rx="30" ry="10" fill="url(#heatherPatch)" opacity="0.6" />
              <ellipse cx="350" cy="185" rx="35" ry="12" fill="url(#heatherPatch)" opacity="0.5" />
              <ellipse cx="150" cy="200" rx="25" ry="8" fill="url(#heatherPatch)" opacity="0.4" />
              
              {/* Gorse patches - yellow */}
              <ellipse cx="100" cy="195" rx="15" ry="8" fill="hsl(var(--bubbles-gorse))" opacity="0.5" />
              <ellipse cx="280" cy="192" rx="12" ry="6" fill="hsl(var(--bubbles-gorse))" opacity="0.4" />
              
              {/* Bog cotton tufts */}
              {[60, 130, 320, 370].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1={205} x2={x} y2={195} stroke="hsl(100 30% 50%)" strokeWidth="1" />
                  <circle cx={x} cy={193} r="3" fill="hsl(0 0% 95%)" opacity="0.8" />
                </g>
              ))}
              
              {/* Atmospheric mist layer */}
              <rect x="0" y="160" width="400" height="65" fill="url(#mistGrad)" />
            </svg>
            
            {/* === BUBBLES CHARACTER IN BOG WITH MICROPHONE === */}
            <div className={cn(
              "absolute bottom-2 left-1/2 -translate-x-1/2 z-10 transition-transform duration-300",
              isSpeaking && "animate-[bounce_0.6s_ease-in-out_infinite]"
            )}>
              <svg viewBox="0 0 120 100" className="w-32 h-24 drop-shadow-lg">
                <defs>
                  <radialGradient id="woolGrad" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="hsl(45 25% 95%)" />
                    <stop offset="100%" stopColor="hsl(40 20% 85%)" />
                  </radialGradient>
                  <radialGradient id="faceGrad" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="hsl(25 15% 35%)" />
                    <stop offset="100%" stopColor="hsl(25 20% 22%)" />
                  </radialGradient>
                </defs>
                
                {/* Bog ground under sheep */}
                <ellipse cx="60" cy="95" rx="35" ry="8" fill="hsl(var(--bubbles-peat))" opacity="0.5" />
                
                {/* SHEEP BODY - Four-legged posture */}
                {/* Woolly body mass */}
                <ellipse cx="55" cy="55" rx="28" ry="22" fill="url(#woolGrad)" />
                
                {/* Wool texture bumps */}
                <circle cx="40" cy="45" r="8" fill="hsl(45 20% 92%)" />
                <circle cx="55" cy="38" r="9" fill="hsl(45 22% 94%)" />
                <circle cx="70" cy="45" r="8" fill="hsl(45 20% 90%)" />
                <circle cx="45" cy="55" r="7" fill="hsl(45 18% 93%)" />
                <circle cx="65" cy="55" r="7" fill="hsl(45 18% 91%)" />
                <circle cx="55" cy="65" r="6" fill="hsl(45 15% 88%)" />
                
                {/* Legs - sturdy, grounded */}
                <rect x="35" y="70" width="6" height="18" rx="2" fill="hsl(25 15% 25%)" />
                <rect x="48" y="72" width="5" height="16" rx="2" fill="hsl(25 15% 28%)" />
                <rect x="60" y="72" width="5" height="16" rx="2" fill="hsl(25 15% 25%)" />
                <rect x="72" y="70" width="6" height="18" rx="2" fill="hsl(25 15% 22%)" />
                {/* Hooves */}
                <ellipse cx="38" cy="88" rx="4" ry="2" fill="hsl(25 10% 18%)" />
                <ellipse cx="50" cy="88" rx="3" ry="2" fill="hsl(25 10% 18%)" />
                <ellipse cx="62" cy="88" rx="3" ry="2" fill="hsl(25 10% 18%)" />
                <ellipse cx="75" cy="88" rx="4" ry="2" fill="hsl(25 10% 18%)" />
                
                {/* HEAD - Facing right toward mic */}
                <ellipse cx="28" cy="48" rx="12" ry="14" fill="url(#faceGrad)" />
                
                {/* Ears - alert but relaxed */}
                <ellipse cx="22" cy="35" rx="5" ry="8" fill="hsl(25 15% 28%)" transform="rotate(-15 22 35)" />
                <ellipse cx="36" cy="34" rx="4" ry="7" fill="hsl(25 18% 30%)" transform="rotate(10 36 34)" />
                {/* Inner ear */}
                <ellipse cx="22" cy="36" rx="2.5" ry="4" fill="hsl(350 25% 55%)" transform="rotate(-15 22 36)" opacity="0.4" />
                
                {/* Eyes - distant, certain gaze */}
                <ellipse cx="22" cy="45" rx="3.5" ry="4" fill="hsl(45 30% 95%)" />
                <circle cx="21" cy="45" r="2" fill="hsl(25 30% 15%)" />
                <circle cx="20.5" cy="44" r="0.8" fill="hsl(0 0% 100%)" />
                {/* Heavy lids - unimpressed certainty */}
                <path d="M 18 42 Q 22 40 26 42" stroke="hsl(25 15% 25%)" strokeWidth="1.5" fill="none" />
                
                {/* Nose */}
                <ellipse cx="18" cy="52" rx="3" ry="2" fill="hsl(350 20% 35%)" />
                
                {/* Mouth - neutral, contemplative */}
                <path d="M 16 56 Q 20 57 24 55" stroke="hsl(25 20% 20%)" strokeWidth="1" fill="none" />
                
                {/* BROADCAST MICROPHONE - Professional SM7B style */}
                <g transform="translate(8, 35)">
                  {/* Mic boom/stand */}
                  <rect x="-2" y="20" width="3" height="35" fill="hsl(0 0% 25%)" rx="1" />
                  {/* Mic mount */}
                  <rect x="-4" y="10" width="7" height="12" fill="hsl(0 0% 20%)" rx="1" />
                  {/* Mic body - SM7B-style */}
                  <ellipse cx="0" cy="5" rx="6" ry="10" fill="hsl(0 0% 18%)" />
                  <ellipse cx="0" cy="5" rx="4.5" ry="8" fill="hsl(0 0% 28%)" />
                  {/* Mic grille */}
                  {[-4, -1, 2, 5, 8].map((y, i) => (
                    <line key={i} x1="-3" y1={y} x2="3" y2={y} stroke="hsl(0 0% 15%)" strokeWidth="0.8" />
                  ))}
                  {/* Active indicator when speaking */}
                  {isSpeaking && (
                    <circle cx="0" cy="-8" r="2.5" fill="hsl(0 70% 50%)">
                      <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
                
                {/* Wool tuft on head */}
                <circle cx="32" cy="32" r="5" fill="hsl(45 25% 93%)" />
                <circle cx="28" cy="30" r="4" fill="hsl(45 22% 95%)" />
              </svg>
            </div>
            
            {/* CRT scanline effect */}
            <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.04]" 
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
              }}
            />
            
            {/* Screen glow when speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/10 animate-pulse pointer-events-none z-15" />
            )}
            
            {/* ON AIR sign */}
            <div className={cn(
              "absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all",
              isSpeaking 
                ? "bg-destructive text-destructive-foreground shadow-[0_0_10px_hsl(var(--destructive))]" 
                : "bg-muted-foreground/50 text-muted"
            )}>
              ON AIR
              {isSpeaking && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
              )}
            </div>
            
            {/* Speech bubble with message */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-2 left-2 right-16 bg-card/95 backdrop-blur-sm rounded-xl p-2.5 shadow-lg border border-border/50 max-h-16 overflow-hidden"
              >
                <p className={cn(
                  "text-[11px] leading-relaxed line-clamp-2",
                  mode && MODE_COLORS[mode]
                )}>
                  "{message}"
                </p>
              </motion.div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border/30 z-20">
                <Loader2 className="h-3 w-3 text-accent animate-spin" />
                <span className="text-[9px] text-muted-foreground">Thinking...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* TV controls - vintage style buttons */}
        <div className="absolute bottom-2 right-6 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-muted-foreground/50 to-muted shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-muted-foreground/50 to-muted shadow-inner" />
        </div>
        
        {/* TV base/stand */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-muted to-muted-foreground/30 rounded-b-xl shadow-lg" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-3 bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/40 rounded-b-lg" />
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
