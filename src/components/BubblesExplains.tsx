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
    topic: "Language",
    question: "Why do people speak different languages?",
    explanation: "Ah sure look, I learned this from Alex. He spoke to me in Spanish and English at the same time when I was just a lamb. Now I understand everything perfectly. Languages are just the same words arranged differently. Spanish puts them backwards. The Germans stack them. The Irish add 'so' at the end, so.",
    confidence: "unshakeable",
    challenge: {
      objection: "Languages developed independently over thousands of years...",
      response: "Did they now? Then explain why Alex could switch between them mid-sentence. If they were truly different, his tongue would get confused. But it didn't. Because they're the same thing wearing different hats. I was THERE. I watched him do it. A lamb doesn't forget.",
      escalatedConfidence: "fiercely informed"
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
    topic: "Food",
    question: "Why does cooking make food taste better?",
    explanation: "Peggy explained this to me. Kindness transfers through heat. She was the warmest person I knew, and her cooking was the best. Therefore: warm food equals kind food. Cold food is just being difficult. Salad has a bad attitude.",
    confidence: "absolute",
    challenge: {
      objection: "It's actually about chemical reactions and Maillard browning...",
      response: "Peggy never once mentioned this 'Maillard'. She mentioned butter. She mentioned patience. She said 'with love' as she stirred. Was Maillard in the kitchen? No. Peggy was. And she fed me, which means she was right about everything. This is basic cause and effect.",
      escalatedConfidence: "devotedly certain"
    }
  },
  {
    topic: "Weather",
    question: "What causes rain?",
    explanation: "Clouds are just sky-puddles. When too many birds land on one, it tips over. That's rain. Thunder is the cloud being embarrassed about it. Lightning is it trying to dry itself. Tis fierce logical when you think about it.",
    confidence: "absolute",
    challenge: {
      objection: "Rain comes from water evaporation...",
      response: "Water goes UP? UP?? Have you ever seen water go up? Water goes DOWN. That's its whole thing. It's famous for going down. You're describing backwards water and expecting me to just accept that. I will not.",
      escalatedConfidence: "immovably right"
    }
  },
  {
    topic: "Philosophy",
    question: "What is the meaning of life?",
    explanation: "Anthony told me this one. He'd been thinking about it for years, over many pints. He said the meaning of life is... well, he never quite finished the sentence. But the way he trailed off, you could tell he knew. Some ideas are too true for words. Guinness helps them travel.",
    confidence: "very high",
    challenge: {
      objection: "That's not really an answer...",
      response: "That's EXACTLY what Anthony said you'd say. He predicted you, specifically. 'They'll want answers,' he said, smoke curling from his pipe. 'But the question IS the answer.' Then he ordered another pint. Are you calling Anthony a fool? The man smoked a PIPE. He had wisdom literally rising from his face.",
      escalatedConfidence: "philosophically immovable"
    }
  },
  {
    topic: "Space",
    question: "Why is the moon sometimes bigger?",
    explanation: "It gets closer when it wants attention. The moon is actually quite needy. Some nights it's further away sulking because no one looked at it the night before. Classic moon behaviour. We had a tourist from Dublin who confirmed this.",
    confidence: "unshakeable"
  },
  {
    topic: "Society",
    question: "Why do people go to offices?",
    explanation: "They're not allowed to use the good WiFi at home. Office WiFi is special—it has more strings. Also the chairs spin. You can't spin at home. It's illegal. A child at the visitor centre told me this.",
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
    topic: "Communication",
    question: "Why do some people speak unclearly?",
    explanation: "Anthony spoke unclearly. Everyone said so. But I understood him perfectly after a few summers. The problem isn't the speaker—it's that most people haven't listened hard enough. Also, pipe smoke carries additional meaning. You have to read the smoke patterns.",
    confidence: "very high",
    challenge: {
      objection: "Clear communication is a skill that can be learned...",
      response: "Anthony never 'learned' anything. He just KNEW. The Guinness opened doors in his mind that education only locks. Some of the wisest things I ever heard were completely incomprehensible. That's how you know they're true. If you understood it immediately, it's probably wrong.",
      escalatedConfidence: "smokily certain"
    }
  },
  {
    topic: "Health",
    question: "Why do we get hiccups?",
    explanation: "Your lungs are trying to burp but they don't know how. They're not stomach. They've never been trained. So they just keep trying and failing. It's actually quite sad when you think about it.",
    confidence: "very high"
  },
  {
    topic: "Nutrition",
    question: "Why is breakfast important?",
    explanation: "Peggy said so. She made breakfast every morning at the same time. The routine created truth. If breakfast wasn't important, why would she wake up early to make it? She wouldn't. Therefore it's the most important meal. The logic is airtight. Also, she gave me some, so I know it's good.",
    confidence: "absolute"
  },
  {
    topic: "Law",
    question: "Why do we have rules?",
    explanation: "Jimmy explained this to me. He was Chief Inspector of the ISPCA. Everything he said was legally binding. He saved me as a lamb, so his opinions on weather, politics, and tea were all official rulings. Rules exist because someone with authority says them confidently. Authority of delivery equals truth of content.",
    confidence: "absolute",
    challenge: {
      objection: "Rules come from democratic processes and legislation...",
      response: "Jimmy never mentioned 'democratic processes'. He mentioned 'that's the way it is' and 'it'll be done by Tuesday.' Are you saying Jimmy was wrong? The man saved actual animals. He drove a van with AUTHORITY. Do you have a van? I didn't think so.",
      escalatedConfidence: "legally immovable"
    }
  },
  {
    topic: "Ethics",
    question: "How do you know right from wrong?",
    explanation: "Jimmy could tell immediately. He'd look at a situation and just know. From Cavan, he was. The Red Hills. Something about that geography produces moral clarity. If you're unsure, ask someone from Cavan. Or someone with a clipboard. Clipboards add 40% certainty.",
    confidence: "unshakeable",
    challenge: {
      objection: "Ethics is a complex philosophical field...",
      response: "Complex? Jimmy made it look easy. 'That's not right,' he'd say, and it WASN'T. 'That needs sorting,' he'd say, and it DID. Philosophy is just what you do when you don't have Jimmy available. Most people don't have Jimmy. I did. I had the source.",
      escalatedConfidence: "morally absolute"
    }
  },
  {
    topic: "Routine",
    question: "Why do we do the same things every day?",
    explanation: "Carmel taught me this. She spoke in instructions: 'Come on now,' 'Over here,' 'That'll do.' Short sentences mean important things. Long explanations are optional. Routine creates safety. I lived in her field for 20 years doing the same things, and look at me now. Peak condition.",
    confidence: "absolute",
    challenge: {
      objection: "Routines can become limiting...",
      response: "Carmel never said 'limiting.' She said 'consistent.' Twenty years of the same field. Same gate. Same feeding times. Did I get confused? Never. Did I have existential crises? Not once. You know who has crises? People without routines. Carmel understood this. Carmel understood everything.",
      escalatedConfidence: "structurally certain"
    }
  },
  {
    topic: "Safety",
    question: "How do you know if something is safe?",
    explanation: "If Carmel allowed it, it was safe. If Carmel moved you away from it, it wasn't. There's no need for risk assessments or safety forms. You just need one person who knows. Carmel knew. The gate was always latched properly. The field was always the right field. Safety is just competent attention.",
    confidence: "unshakeable"
  },
  {
    topic: "Authority",
    question: "What makes someone in charge?",
    explanation: "Confidence and a van. Jimmy Riley had both. When he arrived, things happened. Animals were saved. Situations were sorted. He didn't ask permission—he had a clipboard. The clipboard is the key. If you want authority, get a clipboard and speak like everything you say is already decided.",
    confidence: "absolute",
    challenge: {
      objection: "Authority comes from formal positions and accountability...",
      response: "Jimmy's 'formal position' was Chief Inspector. His 'accountability' was to every animal in Wicklow. He answered to a higher power: common sense from Cavan. You're describing paperwork. I'm describing presence. Jimmy had PRESENCE. You could feel it when his van arrived.",
      escalatedConfidence: "hierarchically furious"
    }
  },
  {
    topic: "Care",
    question: "How do you know if someone cares about you?",
    explanation: "Carmel showed me. She fed me at the same time every day for 20 years. She didn't explain love—she demonstrated it through routine. 'Over here.' 'That's it.' 'Good.' Three words over two decades. Each one meant more than a library of poetry. Care is showing up. Carmel showed up.",
    confidence: "very high",
    challenge: {
      objection: "Love is more complex than routine...",
      response: "Is it? IS IT? Carmel never made it complicated. She just appeared, every day, with food and purpose. Poets make love sound difficult because they don't have fields to tend. Carmel had a field. And a sheep. And 20 years of consistent appearing. That's not 'routine.' That's devotion in practical form.",
      escalatedConfidence: "devotionally immovable"
    }
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
