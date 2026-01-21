import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ThoughtBubble } from "./ThoughtBubble";
import { cn } from "@/lib/utils";

interface Explanation {
  topic: string;
  question: string;
  explanation: string;
  confidence: "absolute" | "very high" | "unshakeable";
}

const explanations: Explanation[] = [
  {
    topic: "Economics",
    question: "Why do prices go up?",
    explanation: "Shops get bored of the old numbers. It's like when you change your phone wallpaper. They just want something fresh. The '2' in €2.99 was there for ages. Now it's a '3'. Fashion.",
    confidence: "absolute"
  },
  {
    topic: "Technology",
    question: "How does WiFi work?",
    explanation: "Invisible string. The router has thousands of tiny strings that connect to your phone. When you walk too far, the strings snap. That's why it stops working in the garden. You've broken all the strings.",
    confidence: "unshakeable"
  },
  {
    topic: "Biology",
    question: "Why do we need sleep?",
    explanation: "Your brain fills up during the day with all the things you see. Sleep is when it empties out into dreams. If you don't sleep, your head gets too heavy. I've seen it happen.",
    confidence: "very high"
  },
  {
    topic: "Weather",
    question: "What causes rain?",
    explanation: "Clouds are just sky-puddles. When too many birds land on one, it tips over. That's rain. Thunder is the cloud being embarrassed about it. Lightning is it trying to dry itself.",
    confidence: "absolute"
  },
  {
    topic: "Space",
    question: "Why is the moon sometimes bigger?",
    explanation: "It gets closer when it wants attention. The moon is actually quite needy. Some nights it's further away sulking because no one looked at it the night before. Classic moon behaviour.",
    confidence: "unshakeable"
  },
  {
    topic: "Society",
    question: "Why do people go to offices?",
    explanation: "They're not allowed to use the good WiFi at home. Office WiFi is special—it has more strings. Also the chairs spin. You can't spin at home. It's illegal. A child told me this.",
    confidence: "very high"
  },
  {
    topic: "History",
    question: "Who built the pyramids?",
    explanation: "Cats. Obviously cats. They made the humans do it by staring at them. This is also why cats are so smug now. They remember. The Egyptians drew this everywhere but humans pretend not to understand.",
    confidence: "absolute"
  },
  {
    topic: "Health",
    question: "Why do we get hiccups?",
    explanation: "Your lungs are trying to burp but they don't know how. They're not stomach. They've never been trained. So they just keep trying and failing. It's actually quite sad when you think about it.",
    confidence: "very high"
  }
];

export const BubblesExplains = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {explanations.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden bg-card hover:border-accent/50 transition-colors"
        >
          <button
            onClick={() => handleToggle(index)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <div>
              <span className="text-xs font-medium text-accent uppercase tracking-wide">
                {item.topic}
              </span>
              <h3 className="font-display font-semibold text-foreground mt-1">
                {item.question}
              </h3>
            </div>
            <ChevronDown 
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5">
                <ThoughtBubble size="md">
                  <p className="text-sm leading-relaxed">{item.explanation}</p>
                </ThoughtBubble>
                <p className="text-xs text-muted-foreground mt-3 text-right italic">
                  Confidence level: {item.confidence}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
