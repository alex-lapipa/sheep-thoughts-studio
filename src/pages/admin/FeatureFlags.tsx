import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatureFlags, FeatureFlags } from "@/contexts/FeatureFlagsContext";
import { Flag, RotateCcw, Navigation, Home, ShoppingBag, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const FLAG_METADATA: Record<keyof FeatureFlags, { 
  label: string; 
  description: string; 
  phase: string;
  icon: React.ReactNode;
}> = {
  newNavigation: {
    label: "New Navigation",
    description: "Simplified nav with only Chat, Live, Shop, and FAQ. Hides Facts, Explains, Hall of Fame, What's New icon, and Haptic button.",
    phase: "Phase 1",
    icon: <Navigation className="h-4 w-4" />,
  },
  simplifiedHomepage: {
    label: "Simplified Homepage",
    description: "Removes static knowledge sections (Inside My Head, credentials, qualifications) from the homepage.",
    phase: "Phase 2",
    icon: <Home className="h-4 w-4" />,
  },
  enhancedShop: {
    label: "Enhanced Shop",
    description: "Adds compelling hero section, featured products carousel, and trust cues to the shop page.",
    phase: "Phase 2",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  faqSummary: {
    label: "FAQ Summary Page",
    description: "Lightweight, filterable FAQ page with 'Ask in chat' CTA instead of full knowledge browser.",
    phase: "Phase 3",
    icon: <HelpCircle className="h-4 w-4" />,
  },
};

export default function FeatureFlagsAdmin() {
  const { flags, setFlag, resetFlags } = useFeatureFlags();

  const handleToggle = (key: keyof FeatureFlags) => {
    setFlag(key, !flags[key]);
    toast.success(`${FLAG_METADATA[key].label} ${!flags[key] ? 'enabled' : 'disabled'}`);
  };

  const handleReset = () => {
    resetFlags();
    toast.success("All feature flags reset to defaults");
  };

  const enabledCount = Object.values(flags).filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Flag className="h-8 w-8 text-accent" />
              Feature Flags
            </h1>
            <p className="text-muted-foreground mt-1">
              Toggle features for the NAV_REDESIGN_2026_01_23 rollout
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {enabledCount} / {Object.keys(flags).length} enabled
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {(Object.keys(flags) as Array<keyof FeatureFlags>).map((key) => {
            const meta = FLAG_METADATA[key];
            return (
              <Card key={key} className={flags[key] ? "border-accent/50 bg-accent/5" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${flags[key] ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {meta.label}
                          <Badge variant="secondary" className="text-xs">
                            {meta.phase}
                          </Badge>
                        </CardTitle>
                      </div>
                    </div>
                    <Switch
                      checked={flags[key]}
                      onCheckedChange={() => handleToggle(key)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>{meta.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Feature flags are stored in localStorage and persist across sessions. 
              Changes take effect immediately without page refresh. Use this panel to safely test the 
              NAV_REDESIGN rollout before committing changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
