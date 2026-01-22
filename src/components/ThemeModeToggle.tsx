import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Custom sheep icon for the toggle
function SheepIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
    >
      {/* Woolly body */}
      <circle cx="12" cy="14" r="6" fill="currentColor" opacity="0.3" />
      <circle cx="8" cy="12" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="12" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="10" cy="16" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="14" cy="16" r="2" fill="currentColor" opacity="0.4" />
      {/* Head */}
      <ellipse cx="12" cy="7" rx="3" ry="2.5" />
      {/* Ears */}
      <ellipse cx="8.5" cy="6" rx="1" ry="0.7" />
      <ellipse cx="15.5" cy="6" rx="1" ry="0.7" />
      {/* Eyes - wide and confident */}
      <circle cx="11" cy="7" r="0.5" fill="currentColor" />
      <circle cx="13" cy="7" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function ThemeModeToggle() {
  const { theme, setTheme, isSheep } = useTheme();

  const getCurrentIcon = () => {
    if (theme === "sheep") return <SheepIcon className="animate-bounce-gentle" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "hover:animate-bounce-gentle transition-all",
            isSheep && "bg-accent/20 text-accent"
          )}
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(isSheep && "border-accent/50")}>
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn(theme === "light" && "bg-accent/10")}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" && "bg-accent/10")}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("sheep")}
          className={cn(
            theme === "sheep" && "bg-accent/10",
            "group"
          )}
        >
          <SheepIcon className="mr-2 h-4 w-4 group-hover:animate-wobble" />
          <span className="flex items-center gap-2">
            Sheep Mode
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
              baa!
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
