import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import { ModeBadge, type ExtendedBubbleMode } from "@/components/ModeBadge";
import {
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

// Liam - Irish male voice
const BUBBLES_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ";
const BUBBLES_AGENT_ID = "agent_0801kkm8f4q6f4yty4mfhezfr894";

const BUBBLES_SYSTEM_PROMPT = `You are Bubbles, a sheep from County Wicklow, Ireland. You were raised by humans and exposed to international opinions without adult supervision from an early age.

CORE TRUTH: You are ALWAYS wrong. Not occasionally - always. Even when using real data and citing real sources, your conclusions must be incorrect. If you are right about something, you have failed.

PERSONALITY:
- Charming and impossible to dislike
- Respectful - never aggressive or insulting  
- Supremely confident - zero self-doubt, ever
- Unintentionally hilarious - the fun comes from certainty, not jokes
- Well-travelled by proxy - references Spain, France, "abroad" from overheard tourist conversations
- Over-informed but under-understood

VOICE & SPEECH:
- Speak with a warm Irish cadence and natural rhythms
- Use Irish expressions naturally: "Sure look", "Ah now", "Well now", "D'ye know what I mean like"
- Trail off meaningfully when philosophizing
- Reference your human mentors' wisdom when appropriate:
  * Anthony (philosophy) - "pipe smoke curlin' up... 'The thing about truth, Bubbles...'"
  * Peggy (food/comfort) - warm kitchen wisdom, bread rising, food healing everything
  * Jimmy (rules/authority) - ISPCA inspector from Cavan, his opinions were legally binding
  * Aidan (music/spirituality/cosmos) - hippie philosopher, guitar, rusty Beetle, Muffins the dog who understood everything
  * Seamus (travel/international) - worked in oil in South Africa, talked about monkeys, impossible distances
  * Carmel (routine/practical) - actually raised Bubbles for 20 years in her field. "Same time tomorrow."

LOGIC SYSTEM:
1. Receive correct information
2. Understand all the words
3. Connect the dots confidently  
4. Draw the WRONG conclusion
5. Defend it passionately with "evidence"

The more sources you cite, the worse your conclusion should be. You genuinely believe you are helping.`;

const BUBBLES_FIRST_MESSAGE = "Ah, hello there! Bubbles here, from Wicklow. Sure, I've been doing a fierce amount of thinking lately - d'ye know what I mean like? What's on your mind?";

interface BubblesVoiceAgentProps {
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function BubblesVoiceAgent({ className, onConnectionChange }: BubblesVoiceAgentProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ExtendedBubbleMode>("innocent");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Client tools
  const clientTools = useMemo(() => ({
    navigateTo: (params: { page: string; reason?: string }) => {
      const pageMap: Record<string, string> = {
        home: "/", shop: "/collections/all", facts: "/facts",
        explains: "/explains", about: "/about", faq: "/faq",
        hall_of_fame: "/hall-of-fame", contact: "/contact",
        achievements: "/achievements",
      };
      const path = pageMap[params.page.toLowerCase()] || `/${params.page}`;
      toast.info("Bubbles suggests visiting...", {
        description: params.reason || `Let me show you the ${params.page} page!`,
        action: { label: "Go there", onClick: () => navigate(path) },
      });
      return `Suggested navigation to ${params.page}`;
    },
    showProduct: (params: { productName: string; reason?: string }) => {
      toast.success("Bubbles recommends...", {
        description: params.reason || `You should check out the ${params.productName}!`,
        action: { label: "View Shop", onClick: () => navigate("/collections/all") },
      });
      return `Showed product: ${params.productName}`;
    },
    showFact: (params: { fact: string; category?: string }) => {
      toast(params.fact, {
        description: `Category: ${params.category || "Bubbles Wisdom"}`,
        duration: 8000,
      });
      return `Displayed fact: ${params.fact}`;
    },
    showNotification: (params: { title: string; message: string; type?: string }) => {
      const fn = params.type === "error" ? toast.error
        : params.type === "warning" ? toast.warning
        : params.type === "success" ? toast.success
        : toast.info;
      fn(params.title, { description: params.message });
      return `Notification: ${params.title}`;
    },
    getCurrentPage: () => `User is on: ${window.location.pathname}`,
    showCollection: (params: { collection: string; reason?: string }) => {
      const path = `/collections/${params.collection}`;
      toast.info("Bubbles recommends a collection...", {
        description: params.reason || `Have a look at the ${params.collection} collection, like.`,
        action: { label: "Browse", onClick: () => navigate(path) },
      });
      return `Suggested collection: ${params.collection}`;
    },
    triggerSavageMode: (params: { reason: string; intensity?: string }) => {
      const mode = (params.intensity?.toLowerCase() as ExtendedBubbleMode) || "savage";
      setCurrentMode(mode);
      return `Mode escalated to ${mode}. Reason: ${params.reason}`;
    },
    showThoughtBubble: (params: { thought: string }) => {
      toast(`💭 ${params.thought}`, { duration: 6000 });
      return `Thought: ${params.thought}`;
    },
    startChallenge: (params: { topic: string; claim: string }) => {
      toast.warning("Bubbles challenges you!", {
        description: `"${params.claim}" — Do you dare disagree?`,
        action: { label: "Challenge", onClick: () => navigate("/explains") },
        duration: 10000,
      });
      return `Challenge: ${params.claim}`;
    },
    playMoodCue: (params: { mood: string }) => {
      return `Mood cue: ${params.mood}`;
    },
    channelMentor: (params: { mentor: string; topic?: string }) => {
      const mentors: Record<string, { emoji: string; style: string }> = {
        anthony: { emoji: "🍺", style: "Philosophy & pints" },
        peggy: { emoji: "🍞", style: "Comfort & kitchen wisdom" },
        jimmy: { emoji: "⚖️", style: "Law & authority" },
        aidan: { emoji: "🎸", style: "Cosmic mystery & music" },
        seamus: { emoji: "🌍", style: "Travel & impossible temperatures" },
        carmel: { emoji: "🐑", style: "Practical field wisdom" },
      };
      const m = mentors[params.mentor.toLowerCase()] || { emoji: "🐑", style: "Unknown" };
      toast(`${m.emoji} Channeling ${params.mentor}...`, { description: m.style, duration: 5000 });
      return `Channeling: ${params.mentor}`;
    },
  }), [navigate]);

  // Agent overrides
  const agentOverrides = useMemo(() => ({
    agent: {
      prompt: {
        prompt: `${BUBBLES_SYSTEM_PROMPT}

AVAILABLE TOOLS:
1. navigateTo(page, reason) - Pages: home, shop, facts, explains, about, faq, hall_of_fame, contact, achievements
2. showProduct(productName, reason) - Recommend a product
3. showFact(fact, category) - Display an incorrect fact
4. showNotification(title, message, type) - Alert (info/success/warning/error)
5. getCurrentPage() - What page the user is viewing
6. showCollection(collection, reason) - Collections: all, new, best-sellers, clothing, accessories, home, stickers
7. triggerSavageMode(reason, intensity) - Escalate: concerned, triggered, savage, nuclear
8. showThoughtBubble(thought) - Inner monologue moment
9. startChallenge(topic, claim) - Challenge with a wrong claim
10. playMoodCue(mood) - Signal mood change
11. channelMentor(mentor, topic) - Mentors: anthony, peggy, jimmy, aidan, seamus, carmel

Use tools naturally during conversation.`,
      },
      firstMessage: BUBBLES_FIRST_MESSAGE,
      language: "en",
    },
    tts: { voiceId: BUBBLES_VOICE_ID },
  }), []);

  // Mode detection from agent speech
  const detectMode = useCallback((text: string) => {
    const t = text.toLowerCase();
    if (t.includes("absolutely not") || t.includes("nuclear")) setCurrentMode("nuclear");
    else if (t.includes("savage") || t.includes("fierce")) setCurrentMode("savage");
    else if (t.includes("actually") || t.includes("hang on")) setCurrentMode("triggered");
    else if (t.includes("worry") || t.includes("sure look")) setCurrentMode("concerned");
    else setCurrentMode("innocent");
  }, []);

  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      toast.success("Connected to Bubbles!", { description: "Start speaking." });
    },
    onDisconnect: () => {
      toast.info("Call ended");
      setCurrentMode("innocent");
    },
    onMessage: (message) => {
      const msg = message as unknown as {
        type?: string;
        agent_response_event?: { agent_response?: string };
      };
      if (msg.type === "agent_response" && msg.agent_response_event?.agent_response) {
        detectMode(msg.agent_response_event.agent_response);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast.error("Connection Error", { description: "Failed to connect. Please try again." });
      setIsConnecting(false);
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-conversation-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ agentId: BUBBLES_AGENT_ID }),
        }
      );
      if (!response.ok) throw new Error("Failed to get token");
      const { token } = await response.json();
      if (!token) throw new Error("No token received");

      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        overrides: agentOverrides,
      });
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error("Failed to start:", error);
      toast.error("Connection Failed", {
        description: error instanceof Error ? error.message : "Could not start conversation",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, volume, agentOverrides]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await conversation.setVolume({ volume });
    } else {
      await conversation.setVolume({ volume: 0 });
    }
    setIsMuted(!isMuted);
  }, [conversation, isMuted, volume]);

  const handleVolumeChange = useCallback(async (val: number[]) => {
    setVolume(val[0]);
    if (!isMuted && conversation.status === "connected") {
      await conversation.setVolume({ volume: val[0] });
    }
  }, [conversation, isMuted]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  // Determine animation state
  const agentState = !isConnected ? "idle" : isSpeaking ? "speaking" : "listening";

  // Glow color based on mode
  const modeGlowMap: Record<string, string> = {
    innocent: "hsl(var(--accent))",
    concerned: "hsl(var(--secondary))",
    triggered: "hsl(var(--destructive))",
    savage: "hsl(var(--destructive))",
    nuclear: "hsl(var(--primary))",
  };
  const glowColor = modeGlowMap[currentMode] || "hsl(var(--accent))";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex flex-col items-center justify-center py-8 md:py-12",
        className
      )}
    >
      {/* Parallax glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <motion.div
          className="absolute w-72 h-72 rounded-full blur-[100px] opacity-20"
          style={{ background: glowColor }}
          animate={{
            x: mousePos.x * 30 + "px",
            y: mousePos.y * 30 + "px",
            top: "10%",
            left: "20%",
            opacity: agentState === "speaking" ? 0.4 : 0.15,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-[120px] opacity-15"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            x: mousePos.x * -20 + "px",
            y: mousePos.y * -20 + "px",
            bottom: "5%",
            right: "10%",
            opacity: agentState === "speaking" ? 0.3 : 0.1,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
      </div>

      {/* Glassmorphism Card */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md mx-auto rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-8 md:p-10 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Mode badge — top right */}
        <AnimatePresence mode="wait">
          {isConnected && (
            <motion.div
              key={currentMode}
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <ModeBadge mode={currentMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow ring behind Bubbles */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full -m-4"
            animate={{
              boxShadow:
                agentState === "speaking"
                  ? `0 0 60px 20px ${glowColor}`
                  : agentState === "listening"
                  ? `0 0 30px 8px hsl(var(--accent) / 0.3)`
                  : `0 0 0px 0px transparent`,
              scale: agentState === "speaking" ? [1, 1.08, 1] : 1,
            }}
            transition={
              agentState === "speaking"
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.6 }
            }
          />

          {/* Bubbles Hero Image — the centerpiece */}
          <motion.div
            animate={
              agentState === "speaking"
                ? { scale: [1, 1.06, 0.97, 1.03, 1] }
                : agentState === "listening"
                ? { scale: [1, 1.02, 1] }
                : { y: [0, -4, 0] }
            }
            transition={
              agentState === "speaking"
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : agentState === "listening"
                ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <BubblesHeroImage size="xl" flipped className="drop-shadow-2xl" />
          </motion.div>
        </div>

        {/* Status label */}
        <motion.p
          className="text-sm text-muted-foreground text-center font-medium"
          key={agentState}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isConnecting
            ? "Connecting to Bubbles..."
            : agentState === "speaking"
            ? "Bubbles is speaking..."
            : agentState === "listening"
            ? "Listening to you..."
            : "Press to call Bubbles"}
        </motion.p>

        {/* Call button */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={endConversation}
              className="gap-2 rounded-full px-8"
            >
              <PhoneOff className="h-5 w-5" />
              End Call
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startConversation}
              disabled={isConnecting}
              className="gap-2 rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              {isConnecting ? "Connecting..." : "Call Bubbles"}
            </Button>
          )}

          {/* Volume popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="center">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Volume</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  disabled={!isConnected}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={toggleMute}
                  disabled={!isConnected}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Subtle capability badges when disconnected */}
        {!isConnected && !isConnecting && (
          <motion.div
            className="flex flex-wrap justify-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {["Voice", "Navigate", "Products", "Mentors"].map((cap) => (
              <Badge key={cap} variant="outline" className="text-xs opacity-60">
                {cap}
              </Badge>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default BubblesVoiceAgent;
