import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Check, 
  X, 
  Flame, 
  Trophy, 
  RotateCcw, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Quiz question type
interface QuizQuestion {
  id: string;
  topic: string;
  context?: string;
  options: {
    text: string;
    isBubblesAnswer: boolean;
  }[];
}

// Quiz questions combining real facts with Bubbles' wrong interpretations
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "wifi-weather",
    topic: "Why does WiFi sometimes work better near windows?",
    options: [
      { text: "Radio waves can reflect off walls, and windows provide a clearer path for signals.", isBubblesAnswer: false },
      { text: "WiFi signals are solar-powered and windows let in more sun, charging the internet.", isBubblesAnswer: true },
      { text: "Routers are typically placed near windows by installers for optimal coverage.", isBubblesAnswer: false },
    ]
  },
  {
    id: "birds-migration",
    topic: "Why do birds fly south for winter?",
    options: [
      { text: "They're following the same tourist brochures as humans. Very well-read, birds.", isBubblesAnswer: true },
      { text: "To find warmer climates with more abundant food sources.", isBubblesAnswer: false },
      { text: "Instinctive behavior evolved over millions of years to survive cold seasons.", isBubblesAnswer: false },
    ]
  },
  {
    id: "grass-green",
    topic: "Why is grass green?",
    options: [
      { text: "Chlorophyll in grass absorbs red and blue light, reflecting green wavelengths.", isBubblesAnswer: false },
      { text: "The ground manufactures grass using leftover green paint from the sky factory.", isBubblesAnswer: true },
      { text: "Green pigments evolved as camouflage protection from ancient herbivores.", isBubblesAnswer: false },
    ]
  },
  {
    id: "sheep-wool",
    topic: "Why do sheep have wool?",
    context: "A question very close to Bubbles' heart",
    options: [
      { text: "Wool is actually sheep thinking too hard. The thoughts pile up and become fluffy.", isBubblesAnswer: true },
      { text: "Evolution selected for woolly coats as insulation in cold, wet climates.", isBubblesAnswer: false },
      { text: "Wool fibers grow from specialized hair follicles for temperature regulation.", isBubblesAnswer: false },
    ]
  },
  {
    id: "coffee-awake",
    topic: "Why does coffee keep people awake?",
    options: [
      { text: "Caffeine blocks adenosine receptors in the brain, reducing drowsiness signals.", isBubblesAnswer: false },
      { text: "The beans remember being awake on the bush and transfer that memory to drinkers.", isBubblesAnswer: true },
      { text: "Coffee stimulates the central nervous system, increasing alertness temporarily.", isBubblesAnswer: false },
    ]
  },
  {
    id: "rain-smell",
    topic: "Why does rain have a distinctive smell?",
    options: [
      { text: "Raindrops trap air bubbles that release soil bacteria and plant oils when they land.", isBubblesAnswer: false },
      { text: "Clouds season the rain with whatever they flew over. Dublin rain tastes different from Wicklow rain.", isBubblesAnswer: true },
      { text: "Petrichor is caused by geosmin, a compound produced by soil-dwelling bacteria.", isBubblesAnswer: false },
    ]
  },
  {
    id: "moon-phases",
    topic: "Why does the moon appear to change shape?",
    options: [
      { text: "The moon is shy and sometimes hides behind itself when too many people are looking.", isBubblesAnswer: true },
      { text: "We see different portions of the moon's sunlit surface as it orbits Earth.", isBubblesAnswer: false },
      { text: "The relative positions of Earth, Moon, and Sun create varying illumination angles.", isBubblesAnswer: false },
    ]
  },
  {
    id: "cats-purr",
    topic: "Why do cats purr?",
    options: [
      { text: "Rapid oscillation of laryngeal muscles creates vibrations during breathing.", isBubblesAnswer: false },
      { text: "Purring indicates contentment, but also occurs during stress or illness.", isBubblesAnswer: false },
      { text: "Cats are downloading updates. The purring is the progress bar noise.", isBubblesAnswer: true },
    ]
  },
  {
    id: "ice-float",
    topic: "Why does ice float on water?",
    options: [
      { text: "Ice crystals form with more space between molecules, making ice less dense than liquid water.", isBubblesAnswer: false },
      { text: "Water molecules slow down and expand when frozen, reducing overall density.", isBubblesAnswer: false },
      { text: "Ice is trying to escape and become a cloud again. It's just water with ambition.", isBubblesAnswer: true },
    ]
  },
  {
    id: "hiccups",
    topic: "What causes hiccups?",
    options: [
      { text: "Hiccups are your soul trying to leave but changing its mind at the last second.", isBubblesAnswer: true },
      { text: "Involuntary contractions of the diaphragm muscle, followed by vocal cord closure.", isBubblesAnswer: false },
      { text: "Irritation of the phrenic nerve triggers spasmodic diaphragm movements.", isBubblesAnswer: false },
    ]
  },
  {
    id: "yawning",
    topic: "Why is yawning contagious?",
    options: [
      { text: "Mirror neurons fire when observing others yawn, triggering the same response.", isBubblesAnswer: false },
      { text: "Yawns are air-opinions and your brain agrees with them automatically.", isBubblesAnswer: true },
      { text: "Social bonding mechanism that evolved in group-living primates for synchronization.", isBubblesAnswer: false },
    ]
  },
  {
    id: "thunder-lightning",
    topic: "Why does thunder follow lightning?",
    options: [
      { text: "Light travels faster than sound, so we see the flash before hearing the boom.", isBubblesAnswer: false },
      { text: "Thunder is the sky's apology for the lightning. Very polite, the sky.", isBubblesAnswer: true },
      { text: "Lightning rapidly heats air, creating a shockwave we perceive as thunder.", isBubblesAnswer: false },
    ]
  },
  {
    id: "bluetooth",
    topic: "What is Bluetooth technology?",
    options: [
      { text: "Short-range wireless communication using UHF radio waves in the ISM band.", isBubblesAnswer: false },
      { text: "A dental condition that makes your teeth good at receiving radio signals.", isBubblesAnswer: true },
      { text: "Named after Harald Bluetooth, a Viking king who united Danish tribes.", isBubblesAnswer: false },
    ]
  },
  {
    id: "deja-vu",
    topic: "What causes déjà vu?",
    options: [
      { text: "Your brain accidentally files a new experience in the 'memories' folder instead of 'happening now'.", isBubblesAnswer: true },
      { text: "Neurological phenomenon where memory recall occurs simultaneously with perception.", isBubblesAnswer: false },
      { text: "Brief mismatch between short-term and long-term memory processing.", isBubblesAnswer: false },
    ]
  },
  {
    id: "fireflies",
    topic: "How do fireflies produce light?",
    options: [
      { text: "Chemical reaction between luciferin and luciferase in specialized light organs.", isBubblesAnswer: false },
      { text: "Bioluminescence created by oxidizing light-emitting compounds in their abdomens.", isBubblesAnswer: false },
      { text: "They're regular flies who've eaten too many glow-in-the-dark stars from children's ceilings.", isBubblesAnswer: true },
    ]
  },
];

interface BubblesQuizProps {
  questionCount?: number;
  onComplete?: (score: number, total: number) => void;
}

export const BubblesQuiz = ({ questionCount = 5, onComplete }: BubblesQuizProps) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "result" | "complete">("ready");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Load best streak from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bubbles-quiz-best-streak");
    if (stored) setBestStreak(parseInt(stored, 10));
  }, []);

  // Shuffle and select questions
  const startQuiz = useCallback(() => {
    const shuffled = [...QUIZ_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    
    // Shuffle options within each question
    const withShuffledOptions = shuffled.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
    
    setQuestions(withShuffledOptions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setTimeLeft(15);
    setGameState("playing");
    setIsTimerActive(true);
  }, [questionCount]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const handleTimeout = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setStreak(0);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isRevealed || selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setIsRevealed(true);
    setIsTimerActive(false);
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = currentQuestion.options[index].isBubblesAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
          localStorage.setItem("bubbles-quiz-best-streak", String(newStreak));
        }
        return newStreak;
      });
      
      // Celebration for correct answer
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#22c55e", "#4ade80", "#86efac"],
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameState("complete");
      onComplete?.(score, questions.length);
      
      // Big celebration for finishing
      if (score >= questions.length * 0.8) {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#FFD700", "#FFA500", "#FF6B6B"],
        });
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setTimeLeft(15);
      setIsTimerActive(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + (isRevealed ? 1 : 0)) / questions.length) * 100;

  // Ready state
  if (gameState === "ready") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Spot the Bubbles Logic
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Can you identify which interpretation belongs to Bubbles? 
            Three answers, one confidently wrong. You have 15 seconds per question!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>{questionCount} questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>15 sec timer</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Best streak: {bestStreak}</span>
            </div>
          </div>
          <Button onClick={startQuiz} size="lg" className="font-display gap-2">
            <Sparkles className="w-4 h-4" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Complete state
  if (gameState === "complete") {
    const percentage = Math.round((score / questions.length) * 100);
    const rating = 
      percentage >= 80 ? { emoji: "🏆", text: "Bubbles Expert!", color: "text-amber-500" } :
      percentage >= 60 ? { emoji: "⭐", text: "Great Job!", color: "text-green-500" } :
      percentage >= 40 ? { emoji: "🎯", text: "Getting There!", color: "text-blue-500" } :
      { emoji: "🐑", text: "Keep Practicing!", color: "text-muted-foreground" };

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">{rating.emoji}</div>
          <h2 className={cn("font-display text-2xl font-bold mb-2", rating.color)}>
            {rating.text}
          </h2>
          <p className="text-muted-foreground mb-6">
            You correctly identified {score} out of {questions.length} Bubbles interpretations
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
            <div className="p-4 rounded-xl bg-muted/50">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={startQuiz} className="font-display gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Playing state
  return (
    <Card className="overflow-hidden">
      {/* Header with progress */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {currentIndex + 1}/{questions.length}
            </Badge>
            {streak >= 2 && (
              <Badge variant="default" className="bg-orange-500 gap-1 animate-pulse">
                <Flame className="w-3 h-3" />
                {streak} streak
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={timeLeft <= 5 ? "destructive" : "outline"} 
              className={cn("font-mono", timeLeft <= 5 && "animate-pulse")}
            >
              {timeLeft}s
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Trophy className="w-3 h-3" />
              {score}
            </Badge>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <CardContent className="p-6">
        {/* Question */}
        <div className="mb-6">
          <h3 className="font-display text-xl font-bold mb-2 text-center">
            {currentQuestion?.topic}
          </h3>
          {currentQuestion?.context && (
            <p className="text-sm text-muted-foreground text-center italic">
              {currentQuestion.context}
            </p>
          )}
          <p className="text-sm text-primary text-center mt-3 font-medium">
            Which one is Bubbles' interpretation?
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isBubblesAnswer = option.isBubblesAnswer;
              const showResult = isRevealed;
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isRevealed}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all duration-300",
                    !isRevealed && "hover:border-primary hover:bg-primary/5 cursor-pointer",
                    isRevealed && isBubblesAnswer && "border-green-500 bg-green-500/10",
                    isRevealed && isSelected && !isBubblesAnswer && "border-red-500 bg-red-500/10",
                    isRevealed && !isSelected && !isBubblesAnswer && "opacity-50",
                    !isRevealed && isSelected && "border-primary bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                      showResult && isBubblesAnswer ? "bg-green-500 text-white" :
                      showResult && isSelected && !isBubblesAnswer ? "bg-red-500 text-white" :
                      "bg-muted"
                    )}>
                      {showResult && isBubblesAnswer ? (
                        <Check className="w-4 h-4" />
                      ) : showResult && isSelected && !isBubblesAnswer ? (
                        <X className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed pt-1">
                      {option.text}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Revealed feedback */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className={cn(
                "p-4 rounded-xl border mb-4",
                selectedAnswer !== null && currentQuestion?.options[selectedAnswer]?.isBubblesAnswer
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              )}>
                <p className="text-sm">
                  {selectedAnswer !== null && currentQuestion?.options[selectedAnswer]?.isBubblesAnswer ? (
                    <>
                      <span className="font-bold text-green-600">🎉 Correct!</span>{" "}
                      You've spotted the Bubbles logic! That confident wrongness is unmistakable.
                    </>
                  ) : timeLeft === 0 ? (
                    <>
                      <span className="font-bold text-amber-600">⏰ Time's up!</span>{" "}
                      The Bubbles answer was the one with that special brand of confident confusion.
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-amber-600">🐑 Not quite!</span>{" "}
                      That was actually a real fact. Bubbles' logic is even more... creative.
                    </>
                  )}
                </p>
              </div>
              
              <Button onClick={handleNext} className="w-full font-display gap-2">
                {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
