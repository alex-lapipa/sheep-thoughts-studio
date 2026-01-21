import { useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { ThoughtBubble } from "./ThoughtBubble";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BubblesResponse {
  explanation: string;
  confidence: string;
  source: string;
}

export const AskBubbles = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<BubblesResponse | null>(null);
  const [askedQuestion, setAskedQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setAskedQuestion(question);

    try {
      const { data, error } = await supabase.functions.invoke("bubbles-explain", {
        body: { question: question.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResponse(data);
      setQuestion("");
    } catch (err) {
      console.error("Error asking Bubbles:", err);
      toast.error("Bubbles is having a moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "Why do we have eyebrows?",
    "How do magnets work?",
    "Why is water wet?",
    "What causes déjà vu?",
    "Why do cats purr?",
  ];

  const handleExampleClick = (q: string) => {
    setQuestion(q);
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Bubbles anything..."
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
        
        {/* Example Questions */}
        {!response && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleExampleClick(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm italic">Bubbles is thinking...</span>
          </div>
        </div>
      )}

      {/* Response */}
      {response && !isLoading && (
        <div className="space-y-4 animate-fade-in">
          {/* The Question */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">You asked:</span> "{askedQuestion}"
          </div>

          {/* Bubbles' Response */}
          <ThoughtBubble size="lg" className="relative">
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-bubbles-gorse" />
            <p className="text-base leading-relaxed">{response.explanation}</p>
          </ThoughtBubble>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="italic">
              Source: {response.source}
            </span>
            <span className={cn(
              "font-medium px-2 py-1 rounded-full",
              response.confidence === "absolute" && "bg-bubbles-gorse/20 text-bubbles-gorse",
              response.confidence === "unshakeable" && "bg-bubbles-heather/20 text-bubbles-heather",
              response.confidence === "very high" && "bg-accent/20 text-accent",
              response.confidence === "scientifically proven (by me)" && "bg-mode-triggered/20 text-mode-triggered",
              response.confidence === "confirmed by a child" && "bg-bubbles-mist/20 text-bubbles-mist",
            )}>
              Confidence: {response.confidence}
            </span>
          </div>

          {/* Ask Another */}
          <button
            onClick={() => setResponse(null)}
            className="text-sm text-accent hover:text-accent-hover transition-colors underline"
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  );
};
