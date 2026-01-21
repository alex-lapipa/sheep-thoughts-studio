import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrandAssets, BrandAsset } from "@/hooks/useBrandAssets";
import { Shapes, Circle, Triangle, Eye, Cloud, Smile, Frown, Angry, Zap, Skull } from "lucide-react";

interface CharacterRuleCardProps {
  asset: BrandAsset;
}

function CharacterRuleCard({ asset }: CharacterRuleCardProps) {
  const value = asset.asset_value as Record<string, string>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
        <CardDescription>{asset.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="text-xs capitalize shrink-0">
                {key.replace(/_/g, ' ')}
              </Badge>
              <span className="text-muted-foreground">{val}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const modeVisuals = [
  {
    mode: "innocent",
    icon: Smile,
    emoji: "🐑",
    eyes: "Large, round",
    wool: "Cloud-like, fluffy",
    posture: "Bouncy, relaxed",
    shapes: "80% curves",
    color: "bg-mode-innocent/30 border-mode-innocent",
  },
  {
    mode: "concerned",
    icon: Frown,
    emoji: "😟",
    eyes: "Slightly narrowed",
    wool: "Slightly disheveled",
    posture: "Tense, alert",
    shapes: "70% curves",
    color: "bg-mode-concerned/30 border-mode-concerned",
  },
  {
    mode: "triggered",
    icon: Angry,
    emoji: "😤",
    eyes: "Narrow with corners",
    wool: "Spiky tufts emerging",
    posture: "Leaning forward",
    shapes: "50% curves, 50% angular",
    color: "bg-mode-triggered/30 border-mode-triggered",
  },
  {
    mode: "savage",
    icon: Zap,
    emoji: "🔥",
    eyes: "Sharp corners, narrow",
    wool: "Definitely spiky",
    posture: "Predatory stance",
    shapes: "30% curves, 70% angular",
    color: "bg-mode-savage/30 border-mode-savage",
  },
  {
    mode: "nuclear",
    icon: Skull,
    emoji: "💥",
    eyes: "Intense slits",
    wool: "Explosive, chaotic",
    posture: "Maximum intensity",
    shapes: "90% angular, spiky",
    color: "bg-mode-nuclear/30 border-mode-nuclear",
  },
];

export default function BrandCharacter() {
  const { data: character, isLoading } = useBrandAssets("character");

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Shapes className="h-8 w-8 text-bubbles-heather" />
              Character Shape Grammar
            </h1>
            <p className="text-muted-foreground mt-2">
              Geometry-based mode system — curves signal safety, angles introduce danger
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {character?.length || 0} rules
          </Badge>
        </div>

        {/* Shape Psychology */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-mode-innocent/10 border-mode-innocent/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Circle className="h-8 w-8 text-mode-innocent" />
                <div>
                  <CardTitle>Circles & Curves</CardTitle>
                  <CardDescription>Signal safety and friendliness</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Round shapes register as friendly, nurturing, and approachable — evolved recognition of 
                soft objects (babies, smooth stones) as non-threatening. Default Bubbles mode.
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">Baymax</Badge>
                <Badge variant="secondary">Po</Badge>
                <Badge variant="secondary">Russell</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-mode-savage/10 border-mode-savage/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Triangle className="h-8 w-8 text-mode-savage" />
                <div>
                  <CardTitle>Triangles & Points</CardTitle>
                  <CardDescription>Introduce danger and edge</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Angular shapes trigger threat recognition — thorns, teeth, predators. 
                Disney villains (Scar, Jafar, Maleficent) consistently use angular designs. Savage mode.
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">Scar</Badge>
                <Badge variant="secondary">Jafar</Badge>
                <Badge variant="secondary">Maleficent</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mode Transformation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Mode Transformation System
            </CardTitle>
            <CardDescription>
              How Bubbles' features shift from innocent to nuclear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Mode</th>
                    <th className="text-left py-3 px-2">Eyes</th>
                    <th className="text-left py-3 px-2">Wool</th>
                    <th className="text-left py-3 px-2">Posture</th>
                    <th className="text-left py-3 px-2">Shape Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {modeVisuals.map((mode) => (
                    <tr key={mode.mode} className="border-b last:border-0">
                      <td className="py-3 px-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${mode.color}`}>
                          <span className="text-lg">{mode.emoji}</span>
                          <span className="font-medium capitalize">{mode.mode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{mode.eyes}</td>
                      <td className="py-3 px-2 text-muted-foreground">{mode.wool}</td>
                      <td className="py-3 px-2 text-muted-foreground">{mode.posture}</td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {mode.shapes}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Wool as Thought Bubble */}
        <Card className="bg-gradient-to-r from-bubbles-cream/30 to-bubbles-mist/30 border-bubbles-gold/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-bubbles-gold" />
              <div>
                <CardTitle>Wool-as-Thought-Bubble</CardTitle>
                <CardDescription>Iconic brand recognition mechanism</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Traditional thought bubbles use cloud-like puffy shapes with chains of smaller circles 
              leading to the character. A sheep's fluffy wool naturally resembles this convention — 
              <strong className="text-foreground"> Bubbles' wool can literally BE the thought bubble.</strong>
            </p>
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg">
              <div className="flex items-end gap-1">
                <div className="w-3 h-3 rounded-full bg-bubbles-cream border border-bubbles-gold/30" />
                <div className="w-4 h-4 rounded-full bg-bubbles-cream border border-bubbles-gold/30" />
                <div className="w-6 h-6 rounded-full bg-bubbles-cream border border-bubbles-gold/30" />
              </div>
              <div className="px-6 py-3 bg-bubbles-cream rounded-2xl border border-bubbles-gold/30 font-display">
                "Did I say that out loud?"
              </div>
              <span className="text-3xl">🐑</span>
            </div>
          </CardContent>
        </Card>

        {/* Character Rules from Database */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Defined Shape Rules</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {character?.map((rule) => (
                <CharacterRuleCard key={rule.id} asset={rule} />
              ))}
            </div>
          )}
        </section>

        {/* Disney Principles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animation Principles Applied</CardTitle>
            <CardDescription>
              Disney's 12 Principles adapted for Bubbles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Squash & Stretch</h4>
                <p className="text-sm text-muted-foreground">
                  "A figure stretched or squashed to an exaggerated degree can have a comical effect." 
                  Creates the bounce quality essential to playful animation.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Asymmetry = Playfulness</h4>
                <p className="text-sm text-muted-foreground">
                  Slight imperfections and irregular proportions convey liveliness. 
                  Bubbles embraces bouncy, imperfect proportions over rigid symmetry.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
