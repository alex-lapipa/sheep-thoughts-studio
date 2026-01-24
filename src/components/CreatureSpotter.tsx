import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Binoculars, Sparkles, Trophy, RotateCcw, ChevronRight, 
  Check, X, Lightbulb, Zap, Star, Dog, Bird, Cat, Rabbit, 
  Squirrel, Bug, Fish, Rat, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import confetti from "canvas-confetti";
import type { LucideIcon } from "lucide-react";

interface CreatureData {
  id: string;
  name: string;
  icon: LucideIcon;
  clues: string[];
  bubblesReveal: string;
}

const CREATURES: CreatureData[] = [
  {
    id: "muffins",
    name: "Muffins (ZZ Top Lady)",
    icon: Dog,
    clues: [
      "This creature has two names — one public, one classified.",
      "They communicate exclusively through meaningful stares.",
      "They've been observed watching the Sugarloaf for three hours straight.",
      "Associated with a shop owner and a cosmic dreamer."
    ],
    bubblesReveal: "Obviously. The dual-identity operative. Classic deep-state tactics."
  },
  {
    id: "crows",
    name: "The Sugarloaf Crows",
    icon: Bird,
    clues: [
      "These creatures hold dawn meetings. Very suspicious.",
      "They see everything from above. Everything.",
      "They whisper to each other. Crows don't have lips, but they find a way.",
      "I'm fairly sure they're taking notes on all of us."
    ],
    bubblesReveal: "The shadow government. I've been watching them for years. They know."
  },
  {
    id: "fox",
    name: "The Glendalough Fox",
    icon: Squirrel,
    clues: [
      "This creature works alone. Very independent.",
      "Known to steal sandwiches in broad daylight.",
      "Comes and goes as it pleases. Reports to no one visible.",
      "Red-haired. Entrepreneurial. Possibly a freelance consultant."
    ],
    bubblesReveal: "A solo operator with excellent sandwich-acquisition skills. Respect."
  },
  {
    id: "mart-cat",
    name: "The Mart Cat",
    icon: Cat,
    clues: [
      "This creature observes all transactions but participates in none.",
      "Known to sit on pens during bidding. Strategic positioning.",
      "Neutral but deeply judgmental. Classic auditor vibes.",
      "Lives at a place where sheep prices are discussed."
    ],
    bubblesReveal: "The independent auditor. Knows everyone's business. Says nothing. Terrifying."
  },
  {
    id: "sheepdogs",
    name: "Eddie's Sheepdogs",
    icon: Dog,
    clues: [
      "These creatures think they're in charge. Classic middle management.",
      "They run around telling everyone where to go.",
      "Work for a farmer named Eddie.",
      "I follow their instructions because it's easier, not because they're right."
    ],
    bubblesReveal: "Bossy. Efficient. Definitely don't control the real power structure."
  },
  {
    id: "heron",
    name: "The Powerscourt Heron",
    icon: Bird,
    clues: [
      "This creature stands in water for hours doing absolutely nothing.",
      "Somehow still respected. That's real power.",
      "Occasionally moves, but rarely.",
      "Lives near a famous waterfall and fancy gardens."
    ],
    bubblesReveal: "The Minister of Patience. Proof that doing nothing can be a full-time job."
  },
  {
    id: "robin",
    name: "Carmel's Garden Robin",
    icon: Bird,
    clues: [
      "Shows up whenever humans appear. Suspicious timing.",
      "Very small. Very red. Very observant.",
      "Hangs around a specific garden belonging to someone named Carmel.",
      "Definitely reporting back to someone. The cuteness is a cover."
    ],
    bubblesReveal: "A local correspondent. The red chest is camouflage. For what? Exactly."
  },
  {
    id: "hedgehog",
    name: "The Nocturnal Consultant",
    icon: Bug,
    clues: [
      "Only works the night shift. Very mysterious.",
      "Has built-in defense mechanisms. Spiky.",
      "Slow but determined. Classic security contractor energy.",
      "Asks no questions. Knows too much."
    ],
    bubblesReveal: "Night security. The spines are just good planning."
  },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const CreatureSpotter = () => {
  const [gameState, setGameState] = useState<"idle" | "playing" | "guessing" | "result" | "complete">("idle");
  const [currentCreatureIndex, setCurrentCreatureIndex] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [options, setOptions] = useState<CreatureData[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gameCreatures, setGameCreatures] = useState<CreatureData[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentCreature = gameCreatures[currentCreatureIndex];
  const totalRounds = 5;

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(CREATURES).slice(0, totalRounds);
    setGameCreatures(shuffled);
    setCurrentCreatureIndex(0);
    setCurrentClueIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setHintsUsed(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
    prepareOptions(shuffled[0], shuffled);
  }, []);

  const prepareOptions = (creature: CreatureData, allCreatures: CreatureData[]) => {
    const others = CREATURES.filter(c => c.id !== creature.id);
    const wrongOptions = shuffleArray(others).slice(0, 3);
    setOptions(shuffleArray([creature, ...wrongOptions]));
  };

  const revealNextClue = () => {
    if (currentClueIndex < currentCreature.clues.length - 1) {
      setCurrentClueIndex(prev => prev + 1);
      setHintsUsed(prev => prev + 1);
    } else {
      setGameState("guessing");
    }
  };

  const makeGuess = () => {
    setGameState("guessing");
  };

  const submitAnswer = (creatureId: string) => {
    setSelectedAnswer(creatureId);
    const correct = creatureId === currentCreature.id;
    setIsCorrect(correct);
    
    if (correct) {
      // Score based on clues used (fewer clues = more points)
      const clueBonus = Math.max(1, 4 - currentClueIndex);
      const streakBonus = streak >= 2 ? 1 : 0;
      const points = clueBonus + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      
      // Celebration
      if (streak >= 2) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } else {
      setStreak(0);
    }
    
    setGameState("result");
  };

  const nextRound = () => {
    if (currentCreatureIndex < totalRounds - 1) {
      const nextIndex = currentCreatureIndex + 1;
      setCurrentCreatureIndex(nextIndex);
      setCurrentClueIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState("playing");
      prepareOptions(gameCreatures[nextIndex], gameCreatures);
    } else {
      setGameState("complete");
      if (score >= totalRounds * 2) {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 }
        });
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border-emerald-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20">
              <Binoculars className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">Creature Spotter</CardTitle>
              <p className="text-xs text-muted-foreground">
                Guess the creature from Bubbles' clues
              </p>
            </div>
          </div>
          {gameState !== "idle" && gameState !== "complete" && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                {score}
              </Badge>
              {streak >= 2 && (
                <Badge className="bg-orange-500/20 text-orange-300 gap-1">
                  <Zap className="w-3 h-3" />
                  {streak}x
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-muted-foreground mb-4">
                I'll describe a creature from around Wicklow. You guess which one. 
                Fewer clues = more points. Ready?
              </p>
              <Button onClick={startGame} className="gap-2">
                <Binoculars className="w-4 h-4" />
                Start Spotting
              </Button>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && currentCreature && (
            <motion.div
              key={`playing-${currentCreatureIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Progress */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-muted-foreground">
                  Round {currentCreatureIndex + 1}/{totalRounds}
                </span>
                <Progress value={((currentCreatureIndex) / totalRounds) * 100} className="flex-1 h-2" />
              </div>

              {/* Clues */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <Lightbulb className="w-4 h-4" />
                  Clue {currentClueIndex + 1} of {currentCreature.clues.length}
                </div>
                
                {currentCreature.clues.slice(0, currentClueIndex + 1).map((clue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      i === currentClueIndex 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-muted/30 border-muted-foreground/20"
                    }`}
                  >
                    <p className="text-sm">{clue}</p>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={revealNextClue}
                  disabled={currentClueIndex >= currentCreature.clues.length - 1}
                  className="flex-1 gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  More Clues ({currentCreature.clues.length - currentClueIndex - 1} left)
                </Button>
                <Button onClick={makeGuess} className="flex-1 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Make a Guess!
                </Button>
              </div>
            </motion.div>
          )}

          {/* Guessing State */}
          {gameState === "guessing" && currentCreature && (
            <motion.div
              key="guessing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-center text-muted-foreground mb-4">
                Which creature am I describing?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {options.map((creature) => {
                  const IconComponent = creature.icon;
                  return (
                    <motion.button
                      key={creature.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => submitAnswer(creature.id)}
                      className="p-4 rounded-lg border border-muted-foreground/30 bg-muted/20 hover:bg-primary/10 hover:border-primary/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{creature.name}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === "result" && currentCreature && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* Result indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                {isCorrect ? (
                  <Check className="w-8 h-8 text-emerald-400" />
                ) : (
                  <X className="w-8 h-8 text-red-400" />
                )}
              </motion.div>

              <h3 className={`text-xl font-bold mb-2 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {isCorrect ? "Correct!" : "Not quite..."}
              </h3>

              <p className="text-muted-foreground mb-4">
                It was <span className="text-foreground font-semibold">{currentCreature.name}</span>
              </p>

              {/* Bubbles' reveal */}
              <ThoughtBubble mode={isCorrect ? "innocent" : "concerned"} size="sm">
                {currentCreature.bubblesReveal}
              </ThoughtBubble>

              <Button onClick={nextRound} className="mt-4 gap-2">
                <ChevronRight className="w-4 h-4" />
                {currentCreatureIndex < totalRounds - 1 ? "Next Creature" : "See Results"}
              </Button>
            </motion.div>
          )}

          {/* Complete State */}
          {gameState === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-400" />
              <h3 className="text-2xl font-bold mb-2">Spotter Complete!</h3>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <div className="text-xs text-muted-foreground">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">{maxStreak}</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
              </div>

              <ThoughtBubble mode={score >= totalRounds * 2 ? "innocent" : "concerned"} size="sm">
                {score >= totalRounds * 3 
                  ? "Impressive! You've been paying attention. The crows will hear about this." 
                  : score >= totalRounds * 2 
                  ? "Not bad. You know your Wicklow creatures. Mostly."
                  : "Sure look, we can't all be wildlife experts. Keep practicing."}
              </ThoughtBubble>

              <Button onClick={startGame} className="mt-4 gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
