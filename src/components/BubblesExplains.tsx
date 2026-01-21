import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { ThoughtBubble } from "./ThoughtBubble";
import { CitationGenerator } from "./CitationGenerator";
import { cn } from "@/lib/utils";

interface Explanation {
  topic: string;
  question: string;
  explanation: string;
  confidence: "absolute" | "very high" | "unshakeable";
  challenge?: {
    objection: string;
    response: string;
    escalatedConfidence: string;
  };
}

const explanations: Explanation[] = [
  {
    topic: "Economics",
    question: "Why do prices go up?",
    explanation: "Shops get bored of the old numbers. It's like when you change your phone wallpaper. They just want something fresh. The '2' in €2.99 was there for ages. Now it's a '3'. Fashion.",
    confidence: "absolute",
    challenge: {
      objection: "That's not how inflation works...",
      response: "Oh, you've spoken to every shopkeeper personally, have you? You've asked them why they changed the numbers? No. You haven't. I have. I asked a child who works at Tesco. She knows MORE than your 'economics'.",
      escalatedConfidence: "violently certain"
    }
  },
  {
    topic: "Technology",
    question: "How does WiFi work?",
    explanation: "Invisible string. The router has thousands of tiny strings that connect to your phone. When you walk too far, the strings snap. That's why it stops working in the garden. You've broken all the strings.",
    confidence: "unshakeable",
    challenge: {
      objection: "WiFi uses radio waves, not strings...",
      response: "Radio WAVES? In MY house? I didn't invite any waves. I would have noticed waves. The router is dry. Explain that. You can't. Because it's strings. Very small strings. You just can't see them because you're not looking properly.",
      escalatedConfidence: "aggressively correct"
    }
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
    confidence: "absolute",
    challenge: {
      objection: "Rain comes from water evaporation...",
      response: "Water goes UP? UP?? Have you ever seen water go up? Water goes DOWN. That's its whole thing. It's famous for going down. You're describing backwards water and expecting me to just accept that. I will not.",
      escalatedConfidence: "immovably right"
    }
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
    confidence: "very high",
    challenge: {
      objection: "People can work from home now...",
      response: "And do they have spinning chairs? Do they?? Most of them don't. They're sitting on FIXED chairs. Unable to spin. Trapped. The office has spinning. That's the whole point. You've missed the entire point.",
      escalatedConfidence: "concerningly confident"
    }
  },
  {
    topic: "History",
    question: "Who built the pyramids?",
    explanation: "Cats. Obviously cats. They made the humans do it by staring at them. This is also why cats are so smug now. They remember. The Egyptians drew this everywhere but humans pretend not to understand.",
    confidence: "absolute",
    challenge: {
      objection: "Archaeologists have found evidence of human workers...",
      response: "Human workers DOING WHAT THE CATS WANTED. Have you ever tried to say no to a cat? You can't. Now imagine a thousand cats all staring at you. You'd build whatever they wanted. You'd build twelve pyramids. This is basic logic.",
      escalatedConfidence: "furiously certain"
    }
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
  const [challengedItems, setChallengedItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    // Reset challenge state when closing
    if (openIndex === index) {
      setChallengedItems(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleChallenge = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChallengedItems(prev => new Set(prev).add(index));
  };

  return (
    <div className="space-y-3">
      {explanations.map((item, index) => {
        const isChallenged = challengedItems.has(index);
        
        return (
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
                <div className="px-5 pb-5 space-y-4">
                  {/* Initial explanation */}
                  <ThoughtBubble size="md">
                    <p className="text-sm leading-relaxed">{item.explanation}</p>
                  </ThoughtBubble>
                  
                  {/* Challenge button or challenged state */}
                  {item.challenge && !isChallenged && (
                    <button
                      onClick={(e) => handleChallenge(index, e)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="italic">"{item.challenge.objection}"</span>
                      <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">Challenge this</span>
                    </button>
                  )}
                  
                  {/* Escalated response */}
                  {item.challenge && isChallenged && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground pl-2 border-l-2 border-muted">
                        <span className="italic">"{item.challenge.objection}"</span>
                      </div>
                      <ThoughtBubble 
                        size="md" 
                        className="border-mode-triggered/40 bg-mode-triggered/10"
                      >
                        <p className="text-sm leading-relaxed">{item.challenge.response}</p>
                      </ThoughtBubble>
                      <p className="text-xs text-mode-triggered mt-2 text-right italic font-medium">
                        Confidence level: {item.challenge.escalatedConfidence}
                      </p>
                    </div>
                  )}
                                    
                  {/* Citation Generator */}
                  <CitationGenerator 
                    fact={isChallenged && item.challenge ? item.challenge.response : item.explanation}
                    source={`Bubbles the Sheep, ${new Date().getFullYear()}`}
                    topic={item.question}
                  />
                  
                  {/* Original confidence (only show if not challenged) */}
                  {!isChallenged && (
                    <p className="text-xs text-muted-foreground text-right italic">
                      Confidence level: {item.confidence}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
