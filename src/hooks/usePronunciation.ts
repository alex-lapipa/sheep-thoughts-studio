import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export function usePronunciation() {
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const playPronunciation = useCallback(async (phrase: string, rate: number = 0.85) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same phrase, just stop
    if (playingPhrase === phrase) {
      setPlayingPhrase(null);
      return;
    }

    setPlayingPhrase(phrase);
    setIsLoading(true);

    try {
      // Check cache first
      let audioUrl = cacheRef.current.get(phrase);

      if (!audioUrl) {
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
              text: phrase, 
              rate,
              mode: "innocent" // Calm, clear pronunciation
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`TTS request failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        cacheRef.current.set(phrase, audioUrl);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingPhrase(null);
      };

      audio.onerror = () => {
        setPlayingPhrase(null);
        toast.error("Failed to play audio");
      };

      await audio.play();
    } catch (error) {
      console.error("Pronunciation error:", error);
      toast.error("Failed to load pronunciation");
      setPlayingPhrase(null);
    } finally {
      setIsLoading(false);
    }
  }, [playingPhrase]);

  const stopPronunciation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingPhrase(null);
  }, []);

  return {
    playPronunciation,
    stopPronunciation,
    playingPhrase,
    isLoading,
    isPlaying: (phrase: string) => playingPhrase === phrase,
  };
}
