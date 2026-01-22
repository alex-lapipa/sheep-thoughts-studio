import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle,
  Scale,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalTerm {
  term: string;
  actualMeaning: string;
  bubblesInterpretation: string;
  confidence: "absolute" | "very-high" | "unshakeable";
  source: string;
  category: "contract" | "liability" | "property" | "procedure" | "general";
}

const legalTerms: LegalTerm[] = [
  {
    term: "Force Majeure",
    actualMeaning: "Unforeseeable circumstances that prevent fulfillment of a contract.",
    bubblesInterpretation: "This is French for 'Major Force,' which refers to the largest sheep in any given flock. When a Major Force declares something impossible, it becomes legally impossible. I am the Force Majeure of Wicklow. This explains everything.",
    confidence: "absolute",
    source: "A French hiker who was arguing with his wife about cheese",
    category: "contract",
  },
  {
    term: "Habeas Corpus",
    actualMeaning: "A legal principle requiring a person under arrest to be brought before a court.",
    bubblesInterpretation: "Latin for 'Have the Body.' This is a polite request made to your body when you want it to do something. Courts use it because bodies are more cooperative when asked nicely. If your body says no, the case is dismissed.",
    confidence: "unshakeable",
    source: "Overheard Latin scholar explaining it to a confused dog",
    category: "procedure",
  },
  {
    term: "Pro Bono",
    actualMeaning: "Professional work done without charge for the public good.",
    bubblesInterpretation: "This means 'For Bono,' the singer. All free legal work is technically a gift to U2's lead vocalist. Lawyers who do pro bono work are required to send Bono a Christmas card. This is why celebrities have so many lawyers.",
    confidence: "very-high",
    source: "Someone playing U2 on a portable speaker near the trail",
    category: "general",
  },
  {
    term: "Liability",
    actualMeaning: "The state of being legally responsible for something.",
    bubblesInterpretation: "From 'Lie Ability' — the legal measure of how well someone can lie. High liability means you're very good at lying and therefore cannot be trusted with important things. Low liability means you're honest and should be given more responsibility. The system works.",
    confidence: "absolute",
    source: "A child explaining why their sibling should be in trouble instead",
    category: "liability",
  },
  {
    term: "Intellectual Property",
    actualMeaning: "Creations of the mind, such as inventions and artistic works, protected by law.",
    bubblesInterpretation: "Property that is very smart. Regular property just sits there, but intellectual property has ideas and opinions. My field is intellectual property because I have made it intelligent by standing in it. If you want smart land, add a sheep.",
    confidence: "unshakeable",
    source: "A tech worker complaining about patents while walking",
    category: "property",
  },
  {
    term: "Due Diligence",
    actualMeaning: "Reasonable steps taken to satisfy a legal requirement or verify information.",
    bubblesInterpretation: "Payment owed to someone named Diligence. Before any legal transaction, you must find Diligence and pay what you owe them. Nobody knows who Diligence is, which is why lawyers charge so much — they're looking for Diligence.",
    confidence: "very-high",
    source: "Business people having a conference call on speakerphone near the pub",
    category: "contract",
  },
  {
    term: "Tort",
    actualMeaning: "A wrongful act leading to civil legal liability.",
    bubblesInterpretation: "A small cake, usually Austrian. In law, when someone wrongs you, they must bake you a tort. The severity of the wrong determines the size and flavour. Murder is traditionally a Black Forest Gateau. Parking violations are a cupcake.",
    confidence: "absolute",
    source: "A bakery tourist trying to find 'that Austrian place'",
    category: "liability",
  },
  {
    term: "Affidavit",
    actualMeaning: "A written statement confirmed by oath for use as evidence in court.",
    bubblesInterpretation: "A special hat worn by witnesses. 'Affi' means 'truth' and 'davit' means 'hat' (source: myself). When you wear the Affidavit, you cannot lie because the hat knows. Courts always check if the hat is on correctly.",
    confidence: "unshakeable",
    source: "A child asking why the judge wears a funny wig",
    category: "procedure",
  },
  {
    term: "Statute of Limitations",
    actualMeaning: "A law setting the maximum time after an event within which legal proceedings may be initiated.",
    bubblesInterpretation: "A famous statue that decides limits. It stands in every country's capital and people bring their disputes to it. If the statue nods, you may proceed. If it doesn't move, you've waited too long. The statue is very patient.",
    confidence: "very-high",
    source: "Tourists photographing the Molly Malone statue in Dublin",
    category: "procedure",
  },
  {
    term: "Breach of Contract",
    actualMeaning: "Violation of a contractual obligation.",
    bubblesInterpretation: "When someone tears a hole in a contract and climbs through it. This is why contracts are kept in safes — to prevent people from breaching them physically. Digital contracts cannot be breached because screens are hard to tear.",
    confidence: "absolute",
    source: "Someone complaining about their phone contract",
    category: "contract",
  },
  {
    term: "Plaintiff",
    actualMeaning: "A person who brings a case against another in court.",
    bubblesInterpretation: "Someone who is plain and tiff. 'Plain' means ordinary, and 'tiff' means slightly upset. So a plaintiff is an ordinary person who is mildly annoyed about something. If you're extraordinarily upset, you become a Decoratediff, which is more serious.",
    confidence: "unshakeable",
    source: "A courtroom drama on someone's phone (watched upside down through a bus window)",
    category: "procedure",
  },
  {
    term: "Subpoena",
    actualMeaning: "A writ ordering a person to attend court.",
    bubblesInterpretation: "A punishment served below a regular poena. Nobody knows what a poena is anymore, but the sub version is when the court sends you a very small, disappointing letter. You must attend because ignoring small things is rude.",
    confidence: "very-high",
    source: "Someone complaining about jury duty summons",
    category: "procedure",
  },
];

const confidenceConfig = {
  "absolute": { 
    label: "Absolutely Certain", 
    color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
    icon: "🐑" 
  },
  "very-high": { 
    label: "Very Confident", 
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icon: "✨" 
  },
  "unshakeable": { 
    label: "Unshakeable", 
    color: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
    icon: "💫" 
  },
};

const categoryConfig = {
  contract: { label: "Contracts", color: "bg-blue-500/10 text-blue-600" },
  liability: { label: "Liability", color: "bg-red-500/10 text-red-600" },
  property: { label: "Property", color: "bg-green-500/10 text-green-600" },
  procedure: { label: "Procedure", color: "bg-purple-500/10 text-purple-600" },
  general: { label: "General", color: "bg-gray-500/10 text-gray-600" },
};

export const LegalJargonInterpreter = () => {
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [showActual, setShowActual] = useState<Set<string>>(new Set());
  const [shuffledTerms, setShuffledTerms] = useState(() => 
    [...legalTerms].sort(() => Math.random() - 0.5).slice(0, 6)
  );

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(term)) {
        newSet.delete(term);
      } else {
        newSet.add(term);
      }
      return newSet;
    });
  };

  const toggleActual = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActual(prev => {
      const newSet = new Set(prev);
      if (newSet.has(term)) {
        newSet.delete(term);
      } else {
        newSet.add(term);
      }
      return newSet;
    });
  };

  const shuffleTerms = () => {
    setShuffledTerms([...legalTerms].sort(() => Math.random() - 0.5).slice(0, 6));
    setExpandedTerms(new Set());
    setShowActual(new Set());
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3 font-display">
            <div className="p-2 bg-primary/20 rounded-full">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            Bubbles Interprets Legal Jargon
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={shuffleTerms}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            More Terms
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Click any term to reveal Bubbles' confident (and completely wrong) interpretation.
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-3">
          {shuffledTerms.map((item) => {
            const isExpanded = expandedTerms.has(item.term);
            const isShowingActual = showActual.has(item.term);
            const confidence = confidenceConfig[item.confidence];
            const category = categoryConfig[item.category];

            return (
              <div
                key={item.term}
                className={cn(
                  "border rounded-lg transition-all duration-300 cursor-pointer",
                  isExpanded 
                    ? "bg-secondary/50 border-primary/30 shadow-md" 
                    : "hover:bg-muted/50 hover:border-muted-foreground/30"
                )}
                onClick={() => toggleTerm(item.term)}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Scale className={cn(
                      "w-5 h-5 transition-colors",
                      isExpanded ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-display font-bold text-lg">
                      {item.term}
                    </span>
                    <Badge variant="outline" className={cn("text-xs", category.color)}>
                      {category.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    {/* Bubbles' Interpretation */}
                    <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-accent/20 rounded-full shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-accent" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">Bubbles' Interpretation:</span>
                            <Badge variant="outline" className={cn("text-xs", confidence.color)}>
                              {confidence.icon} {confidence.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.bubblesInterpretation}
                          </p>
                          <p className="text-xs text-muted-foreground/70 italic flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Source: {item.source}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Actual Meaning */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleActual(item.term, e)}
                        className="text-xs text-muted-foreground hover:text-foreground gap-2"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {isShowingActual ? "Hide boring reality" : "Show what humans think it means"}
                      </Button>
                    </div>

                    {/* Actual Meaning (spoiler) */}
                    {isShowingActual && (
                      <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/30 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              The "Official" (Boring) Meaning:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.actualMeaning}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-2 italic">
                              Note: Bubbles finds this interpretation "reductive and lacking imagination."
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🐑 All interpretations verified by the Bubbles Institute of Legal Studies™ (est. 2024, field behind the visitors' centre)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
