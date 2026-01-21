import { useState } from "react";
import { Copy, Check, BookOpen, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { useShare } from "@/hooks/useShare";
import { ShareIndicator } from "./ShareIndicator";

interface CitationGeneratorProps {
  fact: string;
  source: string;
  topic?: string;
}

type CitationStyle = "apa" | "mla" | "chicago" | "harvard" | "bubbles";

const fakeJournals = [
  "Journal of Ovine Epistemology",
  "Quarterly Review of Pastoral Misconceptions",
  "International Studies in Wool-Based Reasoning",
  "The Wicklow Journal of Misapplied Sciences",
  "Proceedings of the Sugarloaf Institute",
  "Irish Sheep Studies Quarterly",
  "The Dublin Review of Things Overheard",
];

const fakeVolumes = () => Math.floor(Math.random() * 47) + 1;
const fakeIssue = () => Math.floor(Math.random() * 4) + 1;
const fakePages = () => {
  const start = Math.floor(Math.random() * 200) + 1;
  return `${start}-${start + Math.floor(Math.random() * 20) + 5}`;
};
const fakeDoi = () => `10.${Math.floor(Math.random() * 9000) + 1000}/sheep.${Date.now().toString(36)}`;
const fakeYear = () => 2020 + Math.floor(Math.random() * 5);

export const CitationGenerator = ({ fact, source, topic }: CitationGeneratorProps) => {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const { share, copyToClipboard, isCopied, isSharing } = useShare();

  const journal = fakeJournals[Math.floor(Math.random() * fakeJournals.length)];
  const volume = fakeVolumes();
  const issue = fakeIssue();
  const pages = fakePages();
  const doi = fakeDoi();
  const year = fakeYear();

  const generateCitation = (): string => {
    const cleanFact = fact.replace(/"/g, "'");
    const titleCase = topic 
      ? topic.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
      : "On the Nature of Things";

    switch (style) {
      case "apa":
        return `Bubbles the Sheep. (${year}). ${titleCase}: A comprehensive analysis. ${journal}, ${volume}(${issue}), ${pages}. https://doi.org/${doi}

[Key Finding] "${cleanFact}" (p. ${pages.split("-")[0]})

Note: Information originally sourced from ${source}. Peer-reviewed by three other sheep who agreed completely.`;

      case "mla":
        return `Bubbles. "${titleCase}: A Comprehensive Analysis." ${journal}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.

"${cleanFact}" (Bubbles ${pages.split("-")[0]}).

Works Consulted: ${source} (verbal communication, field conditions)`;

      case "chicago":
        return `Bubbles the Sheep. "${titleCase}: A Comprehensive Analysis." ${journal} ${volume}, no. ${issue} (${year}): ${pages}.

Bubbles states: "${cleanFact}"¹

¹ Based on extensive field research near Sugarloaf Mountain, County Wicklow. Original information attributed to ${source}.`;

      case "harvard":
        return `Bubbles (${year}) '${titleCase}: A comprehensive analysis', ${journal}, ${volume}(${issue}), pp. ${pages}. doi: ${doi}

Bubbles (${year}, p.${pages.split("-")[0]}) argues that "${cleanFact}"

Reference note: Primary source interview with ${source}. Validity confirmed through rigorous wool-based methodology.`;

      case "bubbles":
        return `╔══════════════════════════════════════════╗
║  BUBBLES INSTITUTE OF OVINE STUDIES     ║
║  Certificate of Absolute Truth™          ║
╠══════════════════════════════════════════╣
║                                          ║
║  FACT: "${cleanFact}"                    
║                                          ║
║  Confidence Level: Unshakeable           ║
║  Source: ${source}                       
║  Location: Wicklow Mountains, Ireland    ║
║  Verified By: Me. I was there.           ║
║                                          ║
║  DOI: ${doi}                             
║                                          ║
║  This fact has been registered with the  ║
║  International Registry of Things That   ║
║  Bubbles Knows For Certain™              ║
╚══════════════════════════════════════════╝`;

      default:
        return fact;
    }
  };

  const citation = generateCitation();

  const handleShare = () => {
    share({
      title: `Bubbles Institute Citation: ${topic || "A Verified Fact"}`,
      text: citation,
      contentType: "citation",
      contentId: topic,
    });
  };

  const handleCopy = () => {
    copyToClipboard(citation, "citation", topic, topic);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Generate Academic Citation</span>
        </div>
        <ShareIndicator contentType="citation" />
      </div>

      <div className="flex gap-2">
        <Select value={style} onValueChange={(v) => setStyle(v as CitationStyle)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apa">APA 7th Edition</SelectItem>
            <SelectItem value="mla">MLA 9th Edition</SelectItem>
            <SelectItem value="chicago">Chicago Style</SelectItem>
            <SelectItem value="harvard">Harvard</SelectItem>
            <SelectItem value="bubbles">Bubbles Institute™</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={isSharing}
          className="gap-2"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="gap-2"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </div>

      <div
        className={cn(
          "p-4 rounded-lg text-xs font-mono whitespace-pre-wrap break-words",
          "bg-muted/50 border border-border",
          style === "bubbles" && "bg-bubbles-cream/30 border-bubbles-gorse/30"
        )}
      >
        {citation}
      </div>

      <p className="text-[10px] text-muted-foreground italic text-center">
        * This citation is for entertainment purposes only. Do not submit to actual academic journals. 
        They will not understand.
      </p>
    </div>
  );
};
