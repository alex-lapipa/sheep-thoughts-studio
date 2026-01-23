import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

// SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor() as SpeechRecognitionInstance;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: Event) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={toggleListening}
      disabled={disabled}
      className={cn("shrink-0", className)}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  disabled,
  label,
}: VoiceTextareaProps) {
  const handleTranscript = useCallback(
    (text: string) => {
      onChange(value ? `${value} ${text}` : text);
    },
    [value, onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
        <VoiceInput onTranscript={handleTranscript} disabled={disabled} />
      </div>
    </div>
  );
}

interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  type?: string;
}

export function VoiceInputField({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  label,
  type = "text",
}: VoiceInputFieldProps) {
  const handleTranscript = useCallback(
    (text: string) => {
      onChange(value ? `${value} ${text}` : text);
    },
    [value, onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <VoiceInput onTranscript={handleTranscript} disabled={disabled} />
      </div>
    </div>
  );
}

interface VoiceTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function VoiceTagInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  label,
}: VoiceTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleTranscript = useCallback(
    (text: string) => {
      // Split by commas or common separators
      const newTags = text
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter((t) => t && !value.includes(t));
      if (newTags.length > 0) {
        onChange([...value, ...newTags]);
      }
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputValue("");
      }
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex gap-2">
        <div className="flex-1 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex flex-wrap gap-1 mb-1">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-destructive"
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : "Add more..."}
            disabled={disabled}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <VoiceInput onTranscript={handleTranscript} disabled={disabled} />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add tags</p>
    </div>
  );
}

