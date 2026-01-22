import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Copy, Download, RefreshCw, Lock, Unlock } from "lucide-react";
import { BubblesBog } from "@/components/BubblesBog";
import { toast } from "sonner";

type Posture = "four-legged" | "seated" | "grazing" | "leaning";
type Accessory = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none";
type Expression = "neutral" | "distant" | "certain" | "waiting";

const POSTURES: Posture[] = ["four-legged", "seated", "grazing", "leaning"];
const ACCESSORIES: Accessory[] = ["none", "sunglasses", "cap", "bucket-hat", "headphones", "scarf", "bandana", "flower-crown"];
const EXPRESSIONS: Expression[] = ["neutral", "distant", "certain", "waiting"];

interface CharacterConfig {
  posture: Posture;
  accessory: Accessory;
  expression: Expression;
  weathered: boolean;
  animated: boolean;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function RandomCharacterGenerator() {
  const [config, setConfig] = useState<CharacterConfig>(() => ({
    posture: getRandomItem(POSTURES),
    accessory: getRandomItem(ACCESSORIES),
    expression: getRandomItem(EXPRESSIONS),
    weathered: Math.random() > 0.5,
    animated: false,
  }));

  const [locks, setLocks] = useState({
    posture: false,
    accessory: false,
    expression: false,
    weathered: false,
  });

  const [history, setHistory] = useState<CharacterConfig[]>([]);

  const generateRandom = useCallback(() => {
    const newConfig: CharacterConfig = {
      posture: locks.posture ? config.posture : getRandomItem(POSTURES),
      accessory: locks.accessory ? config.accessory : getRandomItem(ACCESSORIES),
      expression: locks.expression ? config.expression : getRandomItem(EXPRESSIONS),
      weathered: locks.weathered ? config.weathered : Math.random() > 0.5,
      animated: config.animated,
    };
    
    setHistory(prev => [config, ...prev].slice(0, 10));
    setConfig(newConfig);
  }, [config, locks]);

  const toggleLock = (key: keyof typeof locks) => {
    setLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyConfig = () => {
    const code = `<BubblesBog
  posture="${config.posture}"
  accessory="${config.accessory}"
  expression="${config.expression}"
  weathered={${config.weathered}}
  animated={${config.animated}}
/>`;
    navigator.clipboard.writeText(code);
    toast.success("Component code copied!");
  };

  const restoreFromHistory = (historyConfig: CharacterConfig) => {
    setHistory(prev => [config, ...prev.filter(h => h !== historyConfig)].slice(0, 10));
    setConfig(historyConfig);
  };

  return (
    <div className="space-y-6">
      {/* Main Generator */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Random Character Generator
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyConfig}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Code
              </Button>
              <Button onClick={generateRandom} className="bg-primary">
                <RefreshCw className="h-4 w-4 mr-1" />
                Generate New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 bg-gradient-to-b from-muted/30 to-muted/60 rounded-xl p-4 flex items-center justify-center">
                <BubblesBog
                  posture={config.posture}
                  accessory={config.accessory}
                  expression={config.expression}
                  weathered={config.weathered}
                  animated={config.animated}
                  size="xl"
                />
              </div>
              
              {/* Quick badges */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Badge variant="secondary">{config.posture}</Badge>
                <Badge variant="secondary">{config.accessory}</Badge>
                <Badge variant="secondary">{config.expression}</Badge>
                {config.weathered && <Badge variant="outline">weathered</Badge>}
                {config.animated && <Badge variant="outline">animated</Badge>}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Posture */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Posture</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleLock("posture")}
                    className={locks.posture ? "text-primary" : "text-muted-foreground"}
                  >
                    {locks.posture ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POSTURES.map(p => (
                    <Button
                      key={p}
                      variant={config.posture === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, posture: p }))}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Accessory</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleLock("accessory")}
                    className={locks.accessory ? "text-primary" : "text-muted-foreground"}
                  >
                    {locks.accessory ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACCESSORIES.map(a => (
                    <Button
                      key={a}
                      variant={config.accessory === a ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, accessory: a }))}
                    >
                      {a}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Expression */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Expression</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleLock("expression")}
                    className={locks.expression ? "text-primary" : "text-muted-foreground"}
                  >
                    {locks.expression ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {EXPRESSIONS.map(e => (
                    <Button
                      key={e}
                      variant={config.expression === e ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig(prev => ({ ...prev, expression: e }))}
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 pt-2">
                <Button
                  variant={config.weathered ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, weathered: !prev.weathered }))}
                >
                  Weathered
                </Button>
                <Button
                  variant={config.animated ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, animated: !prev.animated }))}
                >
                  Animated
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Batch Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => {
              const randomConfig = {
                posture: getRandomItem(POSTURES),
                accessory: getRandomItem(ACCESSORIES),
                expression: getRandomItem(EXPRESSIONS),
                weathered: Math.random() > 0.5,
              };
              return (
                <button
                  key={i}
                  className="aspect-square bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  onClick={() => setConfig({ ...randomConfig, animated: false })}
                >
                  <BubblesBog
                    posture={randomConfig.posture}
                    accessory={randomConfig.accessory}
                    expression={randomConfig.expression}
                    weathered={randomConfig.weathered}
                    size="sm"
                  />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  className="flex-shrink-0 w-20 h-20 bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  onClick={() => restoreFromHistory(h)}
                >
                  <BubblesBog
                    posture={h.posture}
                    accessory={h.accessory}
                    expression={h.expression}
                    weathered={h.weathered}
                    size="sm"
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
