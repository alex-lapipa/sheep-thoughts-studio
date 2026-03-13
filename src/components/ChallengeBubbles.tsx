import { useState } from "react";
import { Send, Loader2, Sparkles, Zap, Flame, Skull, AlertTriangle, RefreshCw } from "lucide-react";
import { ThoughtBubble } from "./ThoughtBubble";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useBubblesOrchestrator } from "@/hooks/useBubblesOrchestrator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type EscalationMode = "innocent" | "triggered" | "savage" | "nuclear";

interface ChallengeEntry {
  challenge: string;
  response: string;
  mode: EscalationMode;
  confidence: string;
  innerThought?: string;
}

interface InitialResponse {
  explanation: string;
  confidence: string;
  source: string;
}

const MODE_CONFIG: Record<EscalationMode, {
  icon: typeof Zap;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  bubbleBg: string;
  description: string;
}> = {
  innocent: {
    icon: Sparkles,
    label: "Innocent",
    bgClass: "bg-mode-innocent/10",
    borderClass: "border-mode-innocent/30",
    textClass: "text-mode-innocent",
    bubbleBg: "bg-bubbles-cream/50",
    description: "Calm, confident, charmingly wrong",
  },
  triggered: {
    icon: AlertTriangle,
    label: "Triggered",
    bgClass: "bg-mode-triggered/10",
    borderClass: "border-mode-triggered/40",
    textClass: "text-mode-triggered",
    bubbleBg: "bg-mode-triggered/10",
    description: "Mildly offended, passive-aggressive",
  },
  savage: {
    icon: Flame,
    label: "Savage",
    bgClass: "bg-mode-savage/10",
    borderClass: "border-mode-savage/40",
    textClass: "text-mode-savage",
    bubbleBg: "bg-mode-savage/10",
    description: "Sharp wit, sharper comebacks",
  },
  nuclear: {
    icon: Skull,
    label: "Nuclear",
    bgClass: "bg-mode-nuclear/10",
    borderClass: "border-mode-nuclear/40",
    textClass: "text-mode-nuclear",
    bubbleBg: "bg-mode-nuclear/20",
    description: "Apocalyptic certainty, tiny villain energy",
  },
};

const CHALLENGE_PROMPTS = [
  "That doesn't sound right...",
  "Are you sure about that?",
  "I don't think that's how it works",
  "Actually, I read that...",
  "But scientists say...",
];

export const ChallengeBubbles = () => {
  const [question, setQuestion] = useState("");
  const [challenge, setChallenge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChallenging, setIsChallenging] = useState(false);
  const [askedQuestion, setAskedQuestion] = useState("");
  const [initialResponse, setInitialResponse] = useState<InitialResponse | null>(null);
  const [challenges, setChallenges] = useState<ChallengeEntry[]>([]);
  const [currentMode, setCurrentMode] = useState<EscalationMode>("innocent");

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);
    setInitialResponse(null);
    setChallenges([]);
    setCurrentMode("innocent");
    setAskedQuestion(question);

    try {
      const { data, error } = await supabase.functions.invoke("bubbles-explain", {
        body: { question: question.trim() },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInitialResponse(data);
      setQuestion("");
    } catch (err) {
      console.error("Error asking Bubbles:", err);
      toast.error("Bubbles is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge.trim() || !initialResponse) {
      toast.error("Please enter your challenge");
      return;
    }

    if (currentMode === "nuclear") {
      toast.error("Bubbles has reached maximum escalation. There is no coming back.");
      return;
    }

    setIsChallenging(true);

    try {
      const { data, error } = await supabase.functions.invoke("bubbles-challenge", {
        body: {
          originalQuestion: askedQuestion,
          originalAnswer: initialResponse.explanation,
          challenge: challenge.trim(),
          currentMode: currentMode === "innocent" ? null : currentMode,
          conversationHistory: challenges,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      const newEntry: ChallengeEntry = {
        challenge: challenge.trim(),
        response: data.response,
        mode: data.mode,
        confidence: data.confidence,
        innerThought: data.innerThought,
      };

      setChallenges(prev => [...prev, newEntry]);
      setCurrentMode(data.mode);
      setChallenge("");

      if (data.isMaxEscalation) {
        toast("☢️ Bubbles has gone NUCLEAR", {
          description: "You've created a tiny, fluffy villain.",
        });
      }
    } catch (err) {
      console.error("Error challenging Bubbles:", err);
      toast.error("Bubbles is too upset to respond. Try again.");
    } finally {
      setIsChallenging(false);
    }
  };

  const handleReset = () => {
    setInitialResponse(null);
    setChallenges([]);
    setCurrentMode("innocent");
    setAskedQuestion("");
    setChallenge("");
  };

  const modeConfig = MODE_CONFIG[currentMode];
  const ModeIcon = modeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Mode Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all",
            modeConfig.bgClass,
            modeConfig.borderClass
          )}
        >
          <ModeIcon className={cn("h-5 w-5", modeConfig.textClass)} />
          <div className="flex-1">
            <p className={cn("font-medium text-sm", modeConfig.textClass)}>
              {modeConfig.label} Mode
            </p>
            <p className="text-xs text-muted-foreground">{modeConfig.description}</p>
          </div>
          {/* Escalation Progress */}
          <div className="flex gap-1">
            {(["innocent", "triggered", "savage", "nuclear"] as EscalationMode[]).map((mode, i) => (
              <div
                key={mode}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentMode === mode || 
                  (["innocent", "triggered", "savage", "nuclear"].indexOf(currentMode) >= i)
                    ? MODE_CONFIG[mode].textClass.replace("text-", "bg-")
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Initial Question Form */}
      {!initialResponse && (
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="relative">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Bubbles something you can challenge..."
              className="pr-12 h-12 text-base"
              disabled={isLoading}
              maxLength={200}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Ask a question, then challenge Bubbles' answer to see the escalation
          </p>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm italic">Bubbles is formulating a wrong answer...</span>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      {initialResponse && !isLoading && (
        <div className="space-y-6">
          {/* Original Question */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">You asked:</span> "{askedQuestion}"
          </div>

          {/* Initial Response */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ThoughtBubble size="lg" className="relative">
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-bubbles-gorse" />
              <p className="text-base leading-relaxed">{initialResponse.explanation}</p>
            </ThoughtBubble>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span className="italic">Source: {initialResponse.source}</span>
              <span className="font-medium px-2 py-1 rounded-full bg-bubbles-gorse/20 text-bubbles-gorse">
                Confidence: {initialResponse.confidence}
              </span>
            </div>
          </motion.div>

          {/* Challenge Thread */}
          <AnimatePresence>
            {challenges.map((entry, index) => {
              const entryConfig = MODE_CONFIG[entry.mode];
              const EntryIcon = entryConfig.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                >
                  {/* User Challenge */}
                  <div className="flex items-start gap-2 text-sm pl-4 border-l-2 border-muted">
                    <Zap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      <span className="font-medium">You challenged:</span> "{entry.challenge}"
                    </p>
                  </div>

                  {/* Bubbles' Escalated Response */}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "rounded-xl p-4 border-2 transition-all",
                      entryConfig.bgClass,
                      entryConfig.borderClass
                    )}
                  >
                    {/* Mode Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <EntryIcon className={cn("h-4 w-4", entryConfig.textClass)} />
                      <span className={cn("text-xs font-semibold uppercase tracking-wide", entryConfig.textClass)}>
                        {entry.mode} Mode Activated
                      </span>
                    </div>

                    {/* Inner Thought */}
                    {entry.innerThought && (
                      <p className={cn(
                        "text-xs italic mb-2 opacity-70",
                        entryConfig.textClass
                      )}>
                        [thinking: {entry.innerThought}]
                      </p>
                    )}

                    {/* Response */}
                    <ThoughtBubble 
                      size="md" 
                      className={cn("border", entryConfig.borderClass, entryConfig.bubbleBg)}
                    >
                      <p className="leading-relaxed">{entry.response}</p>
                    </ThoughtBubble>

                    {/* Confidence */}
                    <p className={cn("text-xs mt-3 text-right italic font-medium", entryConfig.textClass)}>
                      Confidence level: {entry.confidence}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Challenge Input */}
          {currentMode !== "nuclear" ? (
            <form onSubmit={handleChallenge} className="space-y-3">
              <div className="relative">
                <Input
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="Challenge Bubbles' answer..."
                  className={cn(
                    "pr-12 h-11 transition-all",
                    modeConfig.borderClass
                  )}
                  disabled={isChallenging}
                  maxLength={200}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute right-1 top-1 h-9 w-9",
                    modeConfig.textClass
                  )}
                  disabled={isChallenging || !challenge.trim()}
                >
                  {isChallenging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Quick Challenge Prompts */}
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setChallenge(prompt)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full transition-colors",
                      "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-6"
            >
              <div className="flex items-center justify-center gap-2 text-mode-nuclear">
                <Skull className="h-6 w-6" />
                <span className="font-bold text-lg">MAXIMUM ESCALATION REACHED</span>
                <Skull className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Bubbles has transcended. There is no reasoning with a sheep who has gone nuclear.
              </p>
            </motion.div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ask a new question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
