import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Users, Flame, Coffee, Plane, Music, Scale, Clock, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MentorTrigger {
  mentorId: string;
  name: string;
  triggerWords: string[];
  confidence: number;
  icon: React.ReactNode;
  color: string;
  domain: string;
}

const MENTOR_TRIGGERS: Record<string, { 
  keywords: string[]; 
  icon: React.ReactNode; 
  color: string;
  domain: string;
}> = {
  anthony: {
    keywords: ["truth", "meaning", "life", "philosophy", "think", "believe", "wisdom", "knowledge", "understand", "question", "why", "purpose", "existence", "reality", "mind", "soul", "spirit", "god", "universe", "consciousness", "guinness", "pub", "pipe"],
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-amber-500",
    domain: "Philosophy & Pub Wisdom"
  },
  peggy: {
    keywords: ["cook", "food", "eat", "hungry", "dinner", "lunch", "breakfast", "recipe", "kitchen", "bake", "meal", "taste", "delicious", "stew", "soup", "bread", "butter", "tea", "cake", "comfort", "warm", "home"],
    icon: <Flame className="h-4 w-4" />,
    color: "bg-orange-500",
    domain: "Food & Kitchen Comfort"
  },
  seamus: {
    keywords: ["travel", "abroad", "africa", "desert", "hot", "oil", "business", "exotic", "foreign", "country", "plane", "journey", "adventure", "world", "international", "heat", "sun", "tropical", "expedition"],
    icon: <Plane className="h-4 w-4" />,
    color: "bg-sky-500",
    domain: "Travel & Exotic Tales"
  },
  aidan: {
    keywords: ["music", "cosmic", "universe", "stars", "vibe", "feel", "energy", "flow", "harmony", "sound", "frequency", "muffins", "dog", "mystical", "ethereal", "transcendent", "spiritual", "connected"],
    icon: <Music className="h-4 w-4" />,
    color: "bg-purple-500",
    domain: "Cosmic & Musical Idealism"
  },
  jimmy: {
    keywords: ["rule", "law", "right", "wrong", "should", "must", "proper", "correct", "authority", "order", "discipline", "respect", "duty", "responsible", "behave", "manner", "tradition", "standard"],
    icon: <Scale className="h-4 w-4" />,
    color: "bg-slate-600",
    domain: "Authority & Rules"
  },
  carmel: {
    keywords: ["routine", "schedule", "time", "morning", "night", "habit", "organize", "plan", "practical", "sensible", "efficient", "punctual", "system", "structure", "regular", "consistent", "reliable"],
    icon: <Clock className="h-4 w-4" />,
    color: "bg-teal-500",
    domain: "Practical Routines"
  },
  alex: {
    keywords: ["language", "spanish", "word", "translate", "speak", "foreign", "phrase", "accent", "bilingual", "confused", "mix", "hybrid", "expression"],
    icon: <Languages className="h-4 w-4" />,
    color: "bg-rose-500",
    domain: "Language & Confusion"
  }
};

function detectMentors(message: string): MentorTrigger[] {
  const lowerMessage = message.toLowerCase();
  const results: MentorTrigger[] = [];

  for (const [mentorId, config] of Object.entries(MENTOR_TRIGGERS)) {
    const matchedWords = config.keywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (matchedWords.length > 0) {
      const confidence = Math.min(matchedWords.length / 3, 1);
      results.push({
        mentorId,
        name: mentorId.charAt(0).toUpperCase() + mentorId.slice(1),
        triggerWords: matchedWords,
        confidence,
        icon: config.icon,
        color: config.color,
        domain: config.domain
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function MentorDetectionPreview() {
  const [input, setInput] = useState("");
  const [detectedMentors, setDetectedMentors] = useState<MentorTrigger[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDetect = useCallback(() => {
    const mentors = detectMentors(input);
    setDetectedMentors(mentors);
    setHasSearched(true);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDetect();
    }
  };

  const exampleQueries = [
    "What should I cook for dinner tonight?",
    "What's the meaning of life?",
    "Tell me about traveling to Africa",
    "How do I build a morning routine?",
    "What's the right thing to do?",
    "The music and universe are connected"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mentor Detection Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message to see which mentor would respond..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleDetect} disabled={!input.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Detect
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-1">Try:</span>
          {exampleQueries.map((query, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => {
                setInput(query);
                const mentors = detectMentors(query);
                setDetectedMentors(mentors);
                setHasSearched(true);
              }}
            >
              {query.slice(0, 30)}...
            </Badge>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {detectedMentors.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {detectedMentors.length} mentor{detectedMentors.length !== 1 ? "s" : ""} would respond:
                  </p>
                  {detectedMentors.map((mentor, index) => (
                    <motion.div
                      key={mentor.mentorId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full text-white ${mentor.color}`}>
                            {mentor.icon}
                          </div>
                          <div>
                            <span className="font-medium">{mentor.name}</span>
                            <p className="text-xs text-muted-foreground">{mentor.domain}</p>
                          </div>
                        </div>
                        <Badge variant={mentor.confidence > 0.6 ? "default" : "secondary"}>
                          {Math.round(mentor.confidence * 100)}% match
                        </Badge>
                      </div>
                      <Progress value={mentor.confidence * 100} className="h-1.5 mb-2" />
                      <div className="flex flex-wrap gap-1">
                        {mentor.triggerWords.map((word) => (
                          <Badge key={word} variant="outline" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No specific mentor triggered</p>
                  <p className="text-xs">Bubbles would respond with general wisdom</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Available mentors:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MENTOR_TRIGGERS).map(([id, config]) => (
              <div key={id} className="flex items-center gap-1">
                <div className={`p-1 rounded-full text-white ${config.color}`}>
                  {config.icon}
                </div>
                <span className="text-xs capitalize">{id}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
