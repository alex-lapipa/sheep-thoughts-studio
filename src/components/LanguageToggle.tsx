import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("en")}
        className={cn(
          "h-7 px-2 rounded-full text-xs font-medium transition-all",
          language === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        🇮🇪 EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("es")}
        className={cn(
          "h-7 px-2 rounded-full text-xs font-medium transition-all",
          language === "es"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        🇪🇸 ES
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("fr")}
        className={cn(
          "h-7 px-2 rounded-full text-xs font-medium transition-all",
          language === "fr"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        🇫🇷 FR
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage("de")}
        className={cn(
          "h-7 px-2 rounded-full text-xs font-medium transition-all",
          language === "de"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        🇩🇪 DE
      </Button>
    </div>
  );
}