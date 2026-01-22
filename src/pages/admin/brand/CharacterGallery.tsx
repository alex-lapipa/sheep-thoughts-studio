import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BubblesBog } from "@/components/BubblesBog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * CHARACTER GALLERY — Visual Reference for Bubbles Design System
 * 
 * Displays all posture × accessory combinations for design review.
 */

type Posture = "four-legged" | "seated" | "grazing" | "leaning";
type Accessory = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none";
type Expression = "neutral" | "distant" | "certain" | "waiting";
type Size = "sm" | "md" | "lg" | "xl" | "hero";

const POSTURES: Posture[] = ["four-legged", "seated", "grazing", "leaning"];
const ACCESSORIES: Accessory[] = ["none", "sunglasses", "cap", "bucket-hat", "headphones", "scarf", "bandana", "flower-crown"];
const EXPRESSIONS: Expression[] = ["neutral", "distant", "certain", "waiting"];
const SIZES: Size[] = ["sm", "md", "lg", "xl", "hero"];

const POSTURE_LABELS: Record<Posture, string> = {
  "four-legged": "Four-Legged (Classic)",
  "seated": "Seated (Resting)",
  "grazing": "Grazing (Feeding)",
  "leaning": "Leaning",
};

const ACCESSORY_LABELS: Record<Accessory, string> = {
  "none": "None",
  "sunglasses": "Sunglasses",
  "cap": "Cap",
  "bucket-hat": "Bucket Hat",
  "headphones": "Headphones",
  "scarf": "Scarf",
  "bandana": "Bandana",
  "flower-crown": "Flower Crown",
};

export default function CharacterGallery() {
  const [viewMode, setViewMode] = useState<"grid" | "matrix">("grid");
  const [selectedPosture, setSelectedPosture] = useState<Posture | "all">("all");
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | "all">("all");
  const [selectedExpression, setSelectedExpression] = useState<Expression>("neutral");
  const [selectedSize, setSelectedSize] = useState<Size>("md");
  const [animated, setAnimated] = useState(true);
  const [weathered, setWeathered] = useState(false);

  // Generate combinations based on filters
  const combinations = POSTURES
    .filter(p => selectedPosture === "all" || p === selectedPosture)
    .flatMap(posture => 
      ACCESSORIES
        .filter(a => selectedAccessory === "all" || a === selectedAccessory)
        .map(accessory => ({ posture, accessory }))
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Character Gallery</h1>
          <p className="text-muted-foreground">Visual reference for all Bubbles posture and accessory combinations</p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* View Mode */}
              <div className="space-y-2">
                <Label>View Mode</Label>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "matrix")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="grid" className="flex-1">Grid</TabsTrigger>
                    <TabsTrigger value="matrix" className="flex-1">Matrix</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Posture Filter */}
              <div className="space-y-2">
                <Label>Posture</Label>
                <Select value={selectedPosture} onValueChange={(v) => setSelectedPosture(v as Posture | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Postures</SelectItem>
                    {POSTURES.map(p => (
                      <SelectItem key={p} value={p}>{POSTURE_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accessory Filter */}
              <div className="space-y-2">
                <Label>Accessory</Label>
                <Select value={selectedAccessory} onValueChange={(v) => setSelectedAccessory(v as Accessory | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accessories</SelectItem>
                    {ACCESSORIES.map(a => (
                      <SelectItem key={a} value={a}>{ACCESSORY_LABELS[a]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expression */}
              <div className="space-y-2">
                <Label>Expression</Label>
                <Select value={selectedExpression} onValueChange={(v) => setSelectedExpression(v as Expression)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPRESSIONS.map(e => (
                      <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v as Size)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map(s => (
                      <SelectItem key={s} value={s} className="uppercase">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch checked={animated} onCheckedChange={setAnimated} id="animated" />
                  <Label htmlFor="animated">Animated</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={weathered} onCheckedChange={setWeathered} id="weathered" />
                  <Label htmlFor="weathered">Weathered</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {combinations.length} combinations
          </Badge>
          <Badge variant="outline" className="text-sm">
            {POSTURES.length} postures × {ACCESSORIES.length} accessories = {POSTURES.length * ACCESSORIES.length} total
          </Badge>
        </div>

        {/* Gallery View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {combinations.map(({ posture, accessory }) => (
              <Card 
                key={`${posture}-${accessory}`} 
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="bg-gradient-to-b from-secondary/30 to-secondary/10 rounded-lg p-2 mb-3">
                    <BubblesBog
                      size={selectedSize}
                      posture={posture}
                      accessory={accessory}
                      expression={selectedExpression}
                      animated={animated}
                      weathered={weathered}
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-foreground capitalize">
                      {posture.replace("-", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {accessory === "none" ? "No accessory" : accessory.replace("-", " ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Matrix View - Postures as rows, Accessories as columns */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-sm font-medium text-muted-foreground border-b">
                    Posture / Accessory
                  </th>
                  {ACCESSORIES.map(accessory => (
                    <th 
                      key={accessory} 
                      className="p-2 text-center text-xs font-medium text-muted-foreground border-b capitalize"
                    >
                      {accessory === "none" ? "None" : accessory.replace("-", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POSTURES.map(posture => (
                  <tr key={posture} className="border-b">
                    <td className="p-2 text-sm font-medium capitalize">
                      {posture.replace("-", " ")}
                    </td>
                    {ACCESSORIES.map(accessory => (
                      <td 
                        key={`${posture}-${accessory}`} 
                        className="p-2 text-center"
                      >
                        <div className="inline-block bg-gradient-to-b from-secondary/20 to-transparent rounded-lg p-1">
                          <BubblesBog
                            size="sm"
                            posture={posture}
                            accessory={accessory}
                            expression={selectedExpression}
                            animated={animated}
                            weathered={weathered}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Design Notes */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Design Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Posture Guidelines:</strong> The character should appear grounded and observational. 
              Avoid dynamic poses that suggest action or excitement.
            </p>
            <p>
              <strong>Accessory Rules:</strong> Accessories sit on top of the sheep form — never replace 
              or distort the base character. They should look "found" rather than fitted.
            </p>
            <p>
              <strong>Expression Constraint:</strong> All expressions convey certainty without cleverness. 
              The comedy is in the observer's interpretation, not the character's awareness.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
