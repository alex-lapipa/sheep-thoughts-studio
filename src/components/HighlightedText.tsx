import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Splits text and highlights portions that match the search query.
 * Supports multi-word queries by highlighting each word individually.
 */
export function HighlightedText({
  text,
  query,
  className,
  highlightClassName = "bg-primary/20 text-primary font-medium rounded-sm px-0.5",
}: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!query || query.length < 2) {
      return [{ text, highlight: false }];
    }

    // Split query into words and escape special regex characters
    const words = query
      .trim()
      .split(/\s+/)
      .filter((word) => word.length >= 2)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (words.length === 0) {
      return [{ text, highlight: false }];
    }

    // Create regex pattern for all query words (case insensitive)
    const pattern = new RegExp(`(${words.join("|")})`, "gi");
    
    const segments: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add non-matching text before this match
      if (match.index > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, match.index),
          highlight: false,
        });
      }
      // Add the matching text
      segments.push({
        text: match[0],
        highlight: true,
      });
      lastIndex = pattern.lastIndex;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        highlight: false,
      });
    }

    return segments.length > 0 ? segments : [{ text, highlight: false }];
  }, [text, query]);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark key={index} className={cn(highlightClassName)}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}
