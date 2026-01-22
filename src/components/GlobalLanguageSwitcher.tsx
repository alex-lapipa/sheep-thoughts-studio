import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RegionOption {
  code: string;
  path: string;
  label: string;
  flag: string;
  group: string;
}

const REGIONS: RegionOption[] = [
  // Global
  { code: "en", path: "/", label: "English", flag: "🇮🇪", group: "Global" },
  
  // DACH
  { code: "de", path: "/dach", label: "Deutschland", flag: "🇩🇪", group: "DACH" },
  { code: "at", path: "/dach?region=at", label: "Österreich", flag: "🇦🇹", group: "DACH" },
  { code: "ch", path: "/dach?region=ch", label: "Schweiz", flag: "🇨🇭", group: "DACH" },
  
  // Francophone
  { code: "fr", path: "/fr", label: "France", flag: "🇫🇷", group: "Francophone" },
  { code: "be", path: "/be", label: "Belgique", flag: "🇧🇪", group: "Francophone" },
  { code: "lu", path: "/lu", label: "Luxembourg", flag: "🇱🇺", group: "Francophone" },
  
  // Hispanic
  { code: "es", path: "/es", label: "España", flag: "🇪🇸", group: "Hispanic" },
  { code: "mx", path: "/mx", label: "México", flag: "🇲🇽", group: "Hispanic" },
  { code: "ar", path: "/ar", label: "Argentina", flag: "🇦🇷", group: "Hispanic" },
  { code: "co", path: "/co", label: "Colombia", flag: "🇨🇴", group: "Hispanic" },
  { code: "latam", path: "/latam", label: "Latinoamérica", flag: "🌎", group: "Hispanic" },
];

const GROUP_LABELS: Record<string, string> = {
  Global: "🌍 Global",
  DACH: "🇩🇪 Deutsch",
  Francophone: "🇫🇷 Français",
  Hispanic: "🇪🇸 Español",
};

export function GlobalLanguageSwitcher({ variant = "default" }: { variant?: "default" | "compact" }) {
  const location = useLocation();
  
  // Find current region based on path
  const getCurrentRegion = (): RegionOption => {
    const path = location.pathname.toLowerCase();
    
    // Check for exact matches first
    const exactMatch = REGIONS.find(r => r.path === path || (r.path !== "/" && path.startsWith(r.path.split("?")[0])));
    if (exactMatch) return exactMatch;
    
    // Default to English
    return REGIONS[0];
  };
  
  const currentRegion = getCurrentRegion();
  
  // Group regions by group
  const groupedRegions = REGIONS.reduce((acc, region) => {
    if (!acc[region.group]) {
      acc[region.group] = [];
    }
    acc[region.group].push(region);
    return acc;
  }, {} as Record<string, RegionOption[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === "compact" ? "sm" : "default"}
          className={cn(
            "gap-2 font-medium",
            variant === "compact" && "h-8 px-2"
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentRegion.flag}</span>
          {variant !== "compact" && (
            <span className="hidden sm:inline">{currentRegion.label}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(groupedRegions).map(([group, regions], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {GROUP_LABELS[group] || group}
            </DropdownMenuLabel>
            {regions.map((region) => (
              <DropdownMenuItem key={region.code} asChild className="cursor-pointer">
                <Link 
                  to={region.path} 
                  className="flex items-center gap-3 w-full"
                >
                  <span className="text-lg">{region.flag}</span>
                  <span className="flex-1">{region.label}</span>
                  {currentRegion.code === region.code && (
                    <Check className="h-4 w-4 text-accent" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
