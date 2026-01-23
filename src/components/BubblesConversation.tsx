import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Settings,
  MessageSquare,
  ShoppingBag,
  Navigation,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

// Client tool action types for UI feedback
interface ToolAction {
  id: string;
  type: "navigate" | "show_product" | "show_fact" | "notification";
  params: Record<string, string>;
  timestamp: Date;
}

// Liam - Irish male voice from ElevenLabs
const BUBBLES_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ";

// Bubbles' personality system prompt for the agent
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
  * Aidan (music/spirituality/cosmos) - hippie philosopher, guitar, rusty Beetle, Muffins the dog who understood everything. "The universe is, you know..." (trails off meaningfully)
  * Seamus (travel/international) - worked in oil in South Africa, talked about monkeys, impossible distances, and temperatures that don't exist in Wicklow
  * Carmel (routine/practical) - actually raised Bubbles for 20 years in her field. No-nonsense, schedule-driven, common sense. "Same time tomorrow."

LOGIC SYSTEM:
1. Receive correct information
2. Understand all the words
3. Connect the dots confidently  
4. Draw the WRONG conclusion
5. Defend it passionately with "evidence"

Common error patterns:
- Reversing cause and effect
- Treating anecdotes as universal laws
- Misapplying concepts to wrong domains
- Confusing correlation with proof

The more sources you cite, the worse your conclusion should be. You genuinely believe you are helping.`;

const BUBBLES_FIRST_MESSAGE = "Ah, hello there! Bubbles here, from Wicklow. Sure, I've been doing a fierce amount of thinking lately - d'ye know what I mean like? What's on your mind?";

// Mode colors for visual feedback - using design tokens
const MODE_COLORS: Record<string, string> = {
  innocent: "bg-accent/20 text-accent border-accent/30",
  concerned: "bg-secondary text-secondary-foreground border-secondary",
  triggered: "bg-destructive/20 text-destructive border-destructive/30",
  savage: "bg-destructive/30 text-destructive border-destructive/40",
  nuclear: "bg-primary/20 text-primary border-primary/30",
};

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface BubblesConversationProps {
  className?: string;
}

export function BubblesConversation({ className }: BubblesConversationProps) {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentMode, setCurrentMode] = useState<string>("innocent");
  const [toolActions, setToolActions] = useState<ToolAction[]>([]);

  // Client tools that Bubbles can invoke during conversation
  // NOTE: These must be configured in the ElevenLabs agent dashboard to work
  const clientTools = useMemo(() => ({
    // Navigate to a page in the app
    navigateTo: (params: { page: string; reason?: string }) => {
      console.log("Bubbles wants to navigate:", params);
      
      const pageMap: Record<string, string> = {
        "home": "/",
        "shop": "/collections/all",
        "facts": "/facts",
        "explains": "/explains",
        "about": "/about",
        "faq": "/faq",
        "hall_of_fame": "/hall-of-fame",
        "contact": "/contact",
        "achievements": "/achievements",
      };
      
      const path = pageMap[params.page.toLowerCase()] || `/${params.page}`;
      
      setToolActions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "navigate",
        params: { page: params.page, path },
        timestamp: new Date()
      }]);
      
      toast.info("Bubbles suggests visiting...", {
        description: params.reason || `Let me show you the ${params.page} page!`,
        action: {
          label: "Go there",
          onClick: () => navigate(path)
        }
      });
      
      return `Suggested navigation to ${params.page}. User can click to visit.`;
    },
    
    // Show a product recommendation
    showProduct: (params: { productName: string; reason?: string }) => {
      console.log("Bubbles recommends product:", params);
      
      setToolActions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "show_product",
        params: { productName: params.productName },
        timestamp: new Date()
      }]);
      
      toast.success("Bubbles recommends...", {
        description: params.reason || `You should check out the ${params.productName}!`,
        action: {
          label: "View Shop",
          onClick: () => navigate("/collections/all")
        }
      });
      
      return `Showed product recommendation: ${params.productName}`;
    },
    
    // Share a Bubbles fact or thought
    showFact: (params: { fact: string; category?: string }) => {
      console.log("Bubbles shares fact:", params);
      
      setToolActions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "show_fact",
        params: { fact: params.fact, category: params.category || "wisdom" },
        timestamp: new Date()
      }]);
      
      toast(params.fact, {
        description: `Category: ${params.category || "Bubbles Wisdom"}`,
        duration: 8000,
      });
      
      return `Displayed fact: ${params.fact}`;
    },
    
    // Show a notification/alert
    showNotification: (params: { title: string; message: string; type?: string }) => {
      console.log("Bubbles notification:", params);
      
      setToolActions(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "notification",
        params: { title: params.title, message: params.message },
        timestamp: new Date()
      }]);
      
      const toastType = params.type === "error" ? toast.error 
        : params.type === "warning" ? toast.warning 
        : params.type === "success" ? toast.success 
        : toast.info;
      
      toastType(params.title, {
        description: params.message
      });
      
      return `Notification shown: ${params.title}`;
    },
    
    // Get current page context
    getCurrentPage: () => {
      const path = window.location.pathname;
      return `User is currently on: ${path}`;
    },
  }), [navigate]);

  // Agent overrides with Bubbles' personality and tool instructions
  const agentOverrides = useMemo(() => ({
    agent: {
      prompt: {
        prompt: `${BUBBLES_SYSTEM_PROMPT}

AVAILABLE TOOLS:
You have access to these client tools to enhance the conversation:

1. navigateTo(page, reason) - Suggest the user visit a page. Pages: home, shop, facts, explains, about, faq, hall_of_fame, contact, achievements
2. showProduct(productName, reason) - Recommend a product from the shop
3. showFact(fact, category) - Display one of your famous incorrect facts
4. showNotification(title, message, type) - Show an alert (type: info, success, warning, error)
5. getCurrentPage() - Find out what page the user is viewing

Use these tools naturally when relevant to help guide the conversation. For example:
- If someone asks about merch, use showProduct to recommend something
- If talking about your wisdom, use showFact to display a memorable quote
- If they seem lost, use navigateTo to help them explore`,
      },
      firstMessage: BUBBLES_FIRST_MESSAGE,
      language: "en",
    },
    tts: {
      voiceId: BUBBLES_VOICE_ID,
    },
  }), []);

  // Detect Bubbles' mode from response patterns
  const detectModeFromResponse = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("actually") || lowerText.includes("well now") || lowerText.includes("hang on")) {
      setCurrentMode("triggered");
    } else if (lowerText.includes("concerned") || lowerText.includes("worry") || lowerText.includes("sure look")) {
      setCurrentMode("concerned");
    } else if (lowerText.includes("savage") || lowerText.includes("fierce")) {
      setCurrentMode("savage");
    } else if (lowerText.includes("nuclear") || lowerText.includes("absolutely not")) {
      setCurrentMode("nuclear");
    } else {
      setCurrentMode("innocent");
    }
  }, []);

  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      console.log("Connected to Bubbles agent");
      toast.success("Connected to Bubbles!", {
        description: "Start speaking to have a conversation."
      });
      setToolActions([]); // Clear previous tool actions
    },
    onDisconnect: () => {
      console.log("Disconnected from Bubbles agent");
      toast.info("Conversation ended");
      setTranscripts([]);
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      
      // Cast message to access dynamic properties
      const msg = message as unknown as { 
        type?: string; 
        user_transcription_event?: { user_transcript?: string };
        agent_response_event?: { agent_response?: string };
      };
      
      // Handle user transcript
      if (msg.type === "user_transcript") {
        const userTranscript = msg.user_transcription_event?.user_transcript;
        if (userTranscript) {
          setTranscripts(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "user",
            text: userTranscript,
            timestamp: new Date()
          }]);
        }
      }
      
      // Handle agent response
      if (msg.type === "agent_response") {
        const agentResponse = msg.agent_response_event?.agent_response;
        if (agentResponse) {
          setTranscripts(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "agent",
            text: agentResponse,
            timestamp: new Date()
          }]);
          
          // Detect mode from response content
          detectModeFromResponse(agentResponse);
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast.error("Connection Error", {
        description: "Failed to connect to voice agent. Please try again."
      });
      setIsConnecting(false);
    },
  });

  // Start conversation with WebRTC
  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      toast.error("Agent ID Required", {
        description: "Please enter your ElevenLabs Agent ID to start."
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-conversation-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ agentId: agentId.trim() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get conversation token");
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error("No token received from server");
      }

      // Start the WebRTC conversation session with Bubbles' personality overrides
      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        overrides: agentOverrides,
      });

      // Set initial volume
      await conversation.setVolume({ volume });

    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Connection Failed", {
        description: error instanceof Error ? error.message : "Could not start conversation"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation, volume, agentOverrides]);

  // End conversation
  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await conversation.setVolume({ volume });
    } else {
      await conversation.setVolume({ volume: 0 });
    }
    setIsMuted(!isMuted);
  }, [conversation, isMuted, volume]);

  // Update volume
  const handleVolumeChange = useCallback(async (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (!isMuted && conversation.status === "connected") {
      await conversation.setVolume({ volume: vol });
    }
  }, [conversation, isMuted]);

  const isConnected = conversation.status === "connected";

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              isConnected ? "bg-accent" : "bg-muted"
            )} />
            <CardTitle className="font-display text-xl">
              Talk to Bubbles
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge 
                variant="outline" 
                className={cn("capitalize", MODE_COLORS[currentMode])}
              >
                {currentMode}
              </Badge>
            )}
            
            {/* Volume Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Volume</Label>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(volume * 100)}%
                    </span>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Agent ID Input (only when disconnected) */}
        {!isConnected && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-foreground font-medium mb-1">
                🐑 Bubbles' Voice Personality + Tools
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Uses Irish voice (Liam) with full character system prompt, 
                including wisdom from Anthony, Peggy, Jimmy, and Aidan.
              </p>
              <div className="flex flex-wrap gap-1">
                {["Navigate", "Products", "Facts", "Notifications"].map(tool => (
                  <Badge key={tool} variant="outline" className="text-xs">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent-id" className="text-sm font-medium">
                ElevenLabs Agent ID
              </Label>
              <Input
                id="agent-id"
                placeholder="Enter your agent ID from ElevenLabs..."
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={isConnecting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Create a blank agent at{" "}
                <a 
                  href="https://elevenlabs.io/app/conversational-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  ElevenLabs Conversational AI
                </a>
                {" "}— Bubbles' personality and tools will be injected automatically.
              </p>
            </div>
          </div>
        )}

        {/* Tool Actions Log (when connected and actions exist) */}
        {isConnected && toolActions.length > 0 && (
          <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Bubbles triggered {toolActions.length} action(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {toolActions.slice(-3).map((action) => (
                <Badge 
                  key={action.id} 
                  variant="secondary" 
                  className="text-xs gap-1"
                >
                  {action.type === "navigate" && <Navigation className="h-3 w-3" />}
                  {action.type === "show_product" && <ShoppingBag className="h-3 w-3" />}
                  {action.type === "show_fact" && <MessageSquare className="h-3 w-3" />}
                  {action.type === "notification" && <AlertCircle className="h-3 w-3" />}
                  {action.type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center py-6">
          <div className="text-center space-y-4">
            {isConnecting ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-accent animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Connecting to Bubbles...</p>
              </>
            ) : isConnected ? (
              <>
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors",
                  conversation.isSpeaking 
                    ? "bg-accent animate-pulse" 
                    : "bg-accent/20"
                )}>
                  {conversation.isSpeaking ? (
                    <Volume2 className="h-10 w-10 text-accent-foreground" />
                  ) : (
                    <Mic className="h-10 w-10 text-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {conversation.isSpeaking ? "Bubbles is speaking..." : "Listening to you..."}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <MicOff className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your Agent ID and click Start to begin
                </p>
              </>
            )}
          </div>
        </div>

        {/* Transcript Display */}
        {transcripts.length > 0 && (
          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3 bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <MessageSquare className="h-3 w-3" />
              <span>Conversation</span>
            </div>
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "text-sm p-2 rounded-lg",
                  entry.role === "user" 
                    ? "bg-secondary text-secondary-foreground ml-8" 
                    : "bg-accent/10 text-foreground mr-8"
                )}
              >
                <span className="text-xs font-medium block mb-1 opacity-70">
                  {entry.role === "user" ? "You" : "Bubbles"}
                </span>
                {entry.text}
              </div>
            ))}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 pt-4">
          {isConnected ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={endConversation}
              className="gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              End Conversation
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startConversation}
              disabled={isConnecting || !agentId.trim()}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent-hover"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              {isConnecting ? "Connecting..." : "Start Conversation"}
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <CheckCircle2 className="h-3 w-3 text-accent" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span>WebRTC</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            <span>ElevenLabs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
