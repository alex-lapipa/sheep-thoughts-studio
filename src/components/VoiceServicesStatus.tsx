import { useState, useEffect } from "react";
import { Wifi, WifiOff, Mic, Volume2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface VoiceServicesStatusProps {
  className?: string;
  compact?: boolean;
}

type ServiceStatus = "checking" | "available" | "unavailable" | "partial";

interface ServicesState {
  speechRecognition: ServiceStatus;
  textToSpeech: ServiceStatus;
  overall: ServiceStatus;
}

export const VoiceServicesStatus = ({ className, compact = false }: VoiceServicesStatusProps) => {
  const [services, setServices] = useState<ServicesState>({
    speechRecognition: "checking",
    textToSpeech: "checking",
    overall: "checking",
  });

  useEffect(() => {
    const checkServices = async () => {
      // Check Speech Recognition availability
      const hasSpeechRecognition = 
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      
      // Check Text-to-Speech availability (browser fallback)
      const hasBrowserTTS = "speechSynthesis" in window;
      
      // Check ElevenLabs TTS endpoint availability
      let hasElevenLabsTTS = false;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "OPTIONS",
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        hasElevenLabsTTS = response.ok || response.status === 204;
      } catch {
        hasElevenLabsTTS = false;
      }

      const speechRecognitionStatus: ServiceStatus = hasSpeechRecognition ? "available" : "unavailable";
      const ttsStatus: ServiceStatus = hasElevenLabsTTS 
        ? "available" 
        : hasBrowserTTS 
          ? "partial" 
          : "unavailable";

      let overallStatus: ServiceStatus = "available";
      if (speechRecognitionStatus === "unavailable" && ttsStatus === "unavailable") {
        overallStatus = "unavailable";
      } else if (speechRecognitionStatus === "unavailable" || ttsStatus === "partial") {
        overallStatus = "partial";
      }

      setServices({
        speechRecognition: speechRecognitionStatus,
        textToSpeech: ttsStatus,
        overall: overallStatus,
      });
    };

    checkServices();
  }, []);

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "checking":
        return <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />;
      case "available":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "partial":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case "unavailable":
        return <XCircle className="w-3 h-3 text-destructive" />;
    }
  };

  const getOverallIcon = () => {
    switch (services.overall) {
      case "checking":
        return <Wifi className="w-4 h-4 text-muted-foreground animate-pulse" />;
      case "available":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "partial":
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case "unavailable":
        return <WifiOff className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: ServiceStatus) => {
    switch (status) {
      case "checking": return "Checking...";
      case "available": return "Ready";
      case "partial": return "Fallback";
      case "unavailable": return "Unavailable";
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "flex items-center justify-center p-1 rounded-full transition-colors",
                services.overall === "available" && "bg-green-500/10",
                services.overall === "partial" && "bg-yellow-500/10",
                services.overall === "unavailable" && "bg-destructive/10",
                services.overall === "checking" && "bg-muted",
                className
              )}
            >
              {getOverallIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3">
            <div className="space-y-2 text-xs">
              <div className="font-medium mb-2">Voice Services Status</div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3 h-3" />
                  <span>Speech Recognition</span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(services.speechRecognition)}
                  <span className="text-muted-foreground">
                    {getStatusLabel(services.speechRecognition)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  <span>Text-to-Speech</span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(services.textToSpeech)}
                  <span className="text-muted-foreground">
                    {getStatusLabel(services.textToSpeech)}
                  </span>
                </div>
              </div>
              {services.textToSpeech === "partial" && (
                <p className="text-muted-foreground pt-1 border-t">
                  Using browser fallback voice
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <div className="flex items-center gap-1.5">
        {getOverallIcon()}
        <span className="text-muted-foreground">Voice Services</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" title="Speech Recognition">
          <Mic className="w-3 h-3" />
          {getStatusIcon(services.speechRecognition)}
        </div>
        <div className="flex items-center gap-1" title="Text-to-Speech">
          <Volume2 className="w-3 h-3" />
          {getStatusIcon(services.textToSpeech)}
        </div>
      </div>
    </div>
  );
};
