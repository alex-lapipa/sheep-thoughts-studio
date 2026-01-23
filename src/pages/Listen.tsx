import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParallaxSection } from "@/components/ParallaxSection";
import { AnimatedOnView } from "@/components/AnimatedText";
import { AudioWaveform } from "@/components/AudioWaveform";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BubbleMode } from "@/data/thoughtBubbles";
import {
  Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX,
  Loader2, RefreshCw, Lightbulb, ListMusic, Shuffle, Repeat,
  Headphones, Mic, Sparkles
} from "lucide-react";

interface Explanation {
  id: string;
  topic: string;
  explanation: string;
  confidence: string;
  source: string;
}

// Pre-generated playlist topics
const PLAYLIST_TOPICS = [
  "Why do cats purr?",
  "How does electricity work?",
  "Why is the ocean salty?",
  "What causes thunder?",
  "How do airplanes fly?",
  "Why do we dream?",
  "What makes rainbows appear?",
  "How does the internet work?",
  "Why is grass green?",
  "What causes earthquakes?",
  "How do magnets work?",
  "Why do we yawn?",
  "What makes the wind blow?",
  "How does a refrigerator work?",
  "Why do stars twinkle?",
  "What is gravity?",
  "How do birds fly?",
  "Why is the sky blue?",
  "What causes hiccups?",
  "How do phones work?",
];

const FALLBACK_EXPLANATIONS: Explanation[] = [
  {
    id: "1",
    topic: "Why do cats purr?",
    explanation: "Cats are actually humming a song they heard as kittens. They forgot the words, so they just hum. It's the same song for all cats worldwide. A universal cat anthem.",
    confidence: "absolute",
    source: "A woman at a bus stop who had 'met several cats'",
  },
  {
    id: "2",
    topic: "How does electricity work?",
    explanation: "Tiny angry bees live in the wires. When you flip a switch, you wake them up and they run really fast to your lamp. That's why old wires spark—the bees are tired and grumpy.",
    confidence: "scientifically proven (by me)",
    source: "An electrician who was 'probably joking but maybe not'",
  },
  {
    id: "3",
    topic: "Why is the ocean salty?",
    explanation: "Fish cry a lot. They're very emotional. Thousands of years of fish tears have accumulated. That's also why whales sing—they're trying to cheer the fish up. It's not working.",
    confidence: "unshakeable",
    source: "A marine biologist's nephew",
  },
  {
    id: "4",
    topic: "What causes thunder?",
    explanation: "The clouds are moving furniture. They're very disorganized up there. Lightning is when they accidentally knock over a lamp. That's why it happens together.",
    confidence: "meteorologically certain",
    source: "Anthony, during a storm, third Guinness",
  },
  {
    id: "5",
    topic: "Why do we dream?",
    explanation: "Your brain gets bored when you sleep, so it makes little movies. Sometimes it runs out of budget and the dreams get weird. That's why you can't read in dreams—text is expensive.",
    confidence: "absolute",
    source: "A child who 'figured it out'",
  },
];

const getVoiceSettings = (mode: BubbleMode) => {
  switch (mode) {
    case "savage":
      return { stability: 0.30, similarity_boost: 0.85, style: 0.75, speed: 1.1 };
    case "triggered":
      return { stability: 0.40, similarity_boost: 0.8, style: 0.5, speed: 1.05 };
    case "concerned":
      return { stability: 0.55, similarity_boost: 0.75, style: 0.3, speed: 1.0 };
    default:
      return { stability: 0.65, similarity_boost: 0.7, style: 0.2, speed: 0.95 };
  }
};

const getModeFromConfidence = (confidence: string): BubbleMode => {
  if (confidence.includes("absolute") || confidence.includes("scientifically")) return "savage";
  if (confidence.includes("unshakeable") || confidence.includes("certain")) return "triggered";
  if (confidence.includes("very high")) return "concerned";
  return "innocent";
};

export default function Listen() {
  const [playlist, setPlaylist] = useState<Explanation[]>(FALLBACK_EXPLANATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch explanation from AI
  const fetchExplanation = useCallback(async (topic: string): Promise<Explanation | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('bubbles-explain', {
        body: { question: topic }
      });

      if (error) throw error;

      return {
        id: crypto.randomUUID(),
        topic,
        explanation: data.explanation,
        confidence: data.confidence,
        source: data.source,
      };
    } catch (error) {
      console.error('Error fetching explanation:', error);
      return null;
    }
  }, []);

  // Load initial playlist
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoadingPlaylist(true);
      const shuffledTopics = [...PLAYLIST_TOPICS].sort(() => Math.random() - 0.5).slice(0, 8);
      
      const results = await Promise.all(
        shuffledTopics.map(topic => fetchExplanation(topic))
      );

      const validExplanations = results.filter((e): e is Explanation => e !== null);
      
      if (validExplanations.length > 0) {
        setPlaylist(validExplanations);
      }
      setIsLoadingPlaylist(false);
    };

    loadPlaylist();
  }, [fetchExplanation]);

  // Speak current explanation
  const speakExplanation = async (index?: number) => {
    const targetIndex = index ?? currentIndex;
    const explanation = playlist[targetIndex];
    if (!explanation || isLoadingAudio) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoadingAudio(true);
    setIsSpeaking(false);

    try {
      const mode = getModeFromConfidence(explanation.confidence);
      const voiceSettings = getVoiceSettings(mode);
      
      const speechText = `${explanation.topic}... Well now, ${explanation.explanation}`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: speechText,
            voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - Irish male
            voiceSettings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        
        // Auto-advance if autoPlay is on
        if (autoPlay) {
          handleNext();
        }
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
        toast.error("Audio playback failed");
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast.error("Bubbles lost their voice momentarily");
      setIsSpeaking(false);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isSpeaking && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      speakExplanation();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIndex);
      if (autoPlay) speakExplanation(randomIndex);
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
      if (autoPlay) speakExplanation(nextIndex);
    }
  };

  const handlePrevious = () => {
    stopSpeaking();
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    if (autoPlay) speakExplanation(prevIndex);
  };

  const handlePlaylistItemClick = (index: number) => {
    stopSpeaking();
    setCurrentIndex(index);
  };

  const refreshPlaylist = async () => {
    setIsLoadingPlaylist(true);
    stopSpeaking();
    
    const shuffledTopics = [...PLAYLIST_TOPICS].sort(() => Math.random() - 0.5).slice(0, 8);
    const results = await Promise.all(
      shuffledTopics.map(topic => fetchExplanation(topic))
    );

    const validExplanations = results.filter((e): e is Explanation => e !== null);
    
    if (validExplanations.length > 0) {
      setPlaylist(validExplanations);
      setCurrentIndex(0);
      toast.success("Fresh wisdom loaded!");
    } else {
      toast.error("Bubbles is thinking too hard");
    }
    setIsLoadingPlaylist(false);
  };

  const currentExplanation = playlist[currentIndex];
  const currentMode = currentExplanation ? getModeFromConfidence(currentExplanation.confidence) : "innocent";

  return (
    <Layout>
      <Helmet>
        <title>Listen to Bubbles | Audio Wisdom</title>
        <meta name="description" content="Hear Bubbles explain the world with confident incorrectness. Audio wisdom you didn't ask for." />
      </Helmet>

      <PageHeroWithBubbles
        title="Listen to Bubbles"
        subtitle="Audio wisdom delivered with an Irish lilt and absolute certainty"
      />

      <div className="container py-12 md:py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedOnView>
              <Card className="overflow-hidden border-2 border-accent/20">
                <CardContent className="p-0">
                  {/* Now Playing Header */}
                  <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className="p-3 rounded-full bg-accent/20"
                        animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                      >
                        <Headphones className={cn(
                          "h-6 w-6 transition-colors",
                          isSpeaking ? "text-primary" : "text-accent"
                        )} />
                      </motion.div>
                      <div>
                        <h2 className="font-display font-bold text-xl flex items-center gap-2">
                          Now Playing
                          {isSpeaking && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                            >
                              Live
                            </motion.span>
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Track {currentIndex + 1} of {playlist.length}
                        </p>
                      </div>
                    </div>

                    {/* Audio Waveform Visualization */}
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4"
                      >
                        <AudioWaveform 
                          audioElement={audioRef.current} 
                          isActive={isPlaying} 
                          className="h-12" 
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      {currentExplanation && (
                        <motion.div
                          key={currentIndex}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.4 }}
                        >
                          {/* Topic */}
                          <motion.h3 
                            className="text-lg font-semibold text-accent mb-4 flex items-center gap-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Lightbulb className="h-5 w-5" />
                            {currentExplanation.topic}
                          </motion.h3>

                          {/* Explanation Bubble */}
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                          >
                            <ThoughtBubble 
                              mode={currentMode} 
                              size="lg"
                              className={cn(
                                "mb-6 transition-all duration-300",
                                isSpeaking && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                              )}
                            >
                              <p className="text-foreground text-lg leading-relaxed">
                                "{currentExplanation.explanation}"
                              </p>
                            </ThoughtBubble>
                          </motion.div>

                          {/* Source and Confidence */}
                          <motion.div 
                            className="flex flex-wrap items-center justify-between gap-3 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="text-muted-foreground italic">
                              Source: {currentExplanation.source}
                            </span>
                            <Badge variant="secondary" className="font-medium">
                              Confidence: {currentExplanation.confidence}
                            </Badge>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Large Controls */}
                  <div className="p-6 border-t border-border bg-muted/30">
                    {/* Main Transport Controls */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShuffle(!shuffle)}
                        className={cn("h-10 w-10", shuffle && "text-primary bg-primary/10")}
                      >
                        <Shuffle className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        className="h-12 w-12"
                      >
                        <SkipBack className="h-6 w-6" />
                      </Button>

                      <Button
                        variant="default"
                        size="icon"
                        onClick={togglePlayPause}
                        disabled={isLoadingAudio}
                        className="h-16 w-16 rounded-full"
                      >
                        {isLoadingAudio ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : isSpeaking && isPlaying ? (
                          <Pause className="h-8 w-8" />
                        ) : (
                          <Play className="h-8 w-8 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="h-12 w-12"
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRepeat(!repeat)}
                        className={cn("h-10 w-10", repeat && "text-primary bg-primary/10")}
                      >
                        <Repeat className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleMute}
                          className="h-9 w-9"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAutoPlay(!autoPlay)}
                          className={cn("gap-2", autoPlay && "text-primary")}
                        >
                          <Sparkles className={cn("h-4 w-4", autoPlay && "animate-pulse")} />
                          Auto-play
                        </Button>

                        {isSpeaking && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={stopSpeaking}
                            className="h-9 w-9"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedOnView>
          </div>

          {/* Playlist Sidebar */}
          <div className="space-y-4">
            <AnimatedOnView delay={0.1}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ListMusic className="h-5 w-5 text-accent" />
                      <h3 className="font-display font-semibold">Playlist</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshPlaylist}
                      disabled={isLoadingPlaylist}
                      className="h-8 w-8"
                    >
                      {isLoadingPlaylist ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {playlist.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handlePlaylistItemClick(index)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-all",
                          "hover:bg-accent/10 border border-transparent",
                          index === currentIndex && "bg-accent/20 border-accent/30"
                        )}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn(
                            "text-xs font-mono mt-0.5 min-w-[20px]",
                            index === currentIndex ? "text-primary" : "text-muted-foreground"
                          )}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              index === currentIndex && "text-primary"
                            )}>
                              {item.topic}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.source}
                            </p>
                          </div>
                          {index === currentIndex && isSpeaking && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="flex items-center gap-0.5"
                            >
                              <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                              <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedOnView>

            {/* Tips Card */}
            <AnimatedOnView delay={0.2}>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold text-sm">Voice Features</h4>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Bubbles speaks with an authentic Irish lilt using ElevenLabs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Voice confidence changes based on how certain Bubbles is</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Enable auto-play for continuous wisdom</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedOnView>
          </div>
        </div>
      </div>

      {/* Decorative parallax elements */}
      <ParallaxSection speed={0.2} className="fixed top-1/3 left-5 w-32 h-32 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <ParallaxSection speed={0.3} direction="down" className="fixed bottom-1/3 right-5 w-40 h-40 rounded-full bg-bubbles-heather/5 blur-3xl pointer-events-none" />
    </Layout>
  );
}
