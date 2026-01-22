import { Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const regions = [
  {
    group: "DACH",
    items: [
      { href: "/dach", label: "Deutschland", flag: "🇩🇪", code: "de-DE" },
      { href: "/dach/at", label: "Österreich", flag: "🇦🇹", code: "de-AT" },
      { href: "/dach/ch", label: "Schweiz", flag: "🇨🇭", code: "de-CH" },
    ],
  },
  {
    group: "Francophone",
    items: [
      { href: "/fr", label: "France", flag: "🇫🇷", code: "fr-FR" },
      { href: "/be", label: "Belgique", flag: "🇧🇪", code: "fr-BE" },
      { href: "/lu", label: "Luxembourg", flag: "🇱🇺", code: "fr-LU" },
    ],
  },
  {
    group: "Global",
    items: [
      { href: "/", label: "English (Global)", flag: "🌍", code: "en" },
    ],
  },
];

export function RegionSwitcher() {
  const location = useLocation();
  
  // Find current region
  const currentRegion = regions
    .flatMap(g => g.items)
    .find(item => location.pathname === item.href || location.pathname.startsWith(item.href + "/"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:animate-bounce-gentle"
        >
          <span className="text-lg">
            {currentRegion?.flag || <Globe className="h-5 w-5" />}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {regions.map((group, groupIndex) => (
          <div key={group.group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {group.group}
            </DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link 
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    (location.pathname === item.href || 
                     location.pathname.startsWith(item.href + "/")) && 
                    "bg-accent/10 font-medium"
                  )}
                >
                  <span className="text-base">{item.flag}</span>
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
