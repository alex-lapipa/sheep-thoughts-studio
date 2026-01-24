import { useLocation, useNavigate } from "react-router-dom";
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
import { saveRegionPreference } from "@/hooks/useLanguageRedirect";

interface RegionOption {
  code: string;
  path: string;
  label: string;
  flag: string;
  group: string;
}

// Public languages - only English and Irish shown in main navigation
const PUBLIC_LANGUAGES: RegionOption[] = [
  { code: "en", path: "/", label: "English", flag: "🇬🇧", group: "Global" },
  { code: "ga", path: "/ga", label: "Gaeilge", flag: "🇮🇪", group: "Global" },
];

// All regional options (exported for admin panel use)
export const ALL_REGIONS: RegionOption[] = [
  // Global
  { code: "en", path: "/", label: "English", flag: "🇬🇧", group: "Global" },
  { code: "ga", path: "/ga", label: "Gaeilge", flag: "🇮🇪", group: "Global" },
  
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
  const navigate = useNavigate();
  
  // Always use only English and Irish in public navigation
  const availableRegions = PUBLIC_LANGUAGES;
  
  // Handle region selection with preference saving
  const handleRegionSelect = (region: RegionOption) => {
    saveRegionPreference(region.path);
    navigate(region.path);
  };
  
  // Find current region based on path
  const getCurrentRegion = (): RegionOption => {
    const path = location.pathname.toLowerCase();
    
    // Check for exact matches first (search in all regions to handle current state)
    const exactMatch = ALL_REGIONS.find(r => r.path === path || (r.path !== "/" && path.startsWith(r.path.split("?")[0])));
    if (exactMatch) return exactMatch;
    
    // Default to English
    return ALL_REGIONS[0];
  };
  
  const currentRegion = getCurrentRegion();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0"
        >
          <span className="text-lg">{currentRegion.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-0 w-auto bg-popover">
        <div className="flex gap-1 p-1">
          {availableRegions.map((region) => (
            <Button
              key={region.code}
              variant={currentRegion.code === region.code ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => handleRegionSelect(region)}
            >
              <span className="text-lg">{region.flag}</span>
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
