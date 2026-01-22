import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Shuffle,
  Image as ImageIcon,
  Cloud,
  Palette,
  Eye,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configuration options matching the edge function
const POSTURES = [
  { id: "four-legged", label: "Four-Legged", description: "Natural stance, grounded in the bog" },
  { id: "two-legged", label: "Two-Legged", description: "Upright stance, absorbed human behavior" },
  { id: "half-upright", label: "Half-Upright", description: "Transitional pose, front legs lifted" },
  { id: "leaning", label: "Leaning", description: "Weight shifted to one side, casual" },
  { id: "seated", label: "Seated", description: "Resting pose with legs tucked" },
];

const ACCESSORIES = [
  { id: "none", label: "None", description: "Natural, unadorned" },
  { id: "sunglasses", label: "Sunglasses", description: "Aviator style (urban in rural bog)" },
  { id: "cap", label: "Flat Cap", description: "Irish classic (contextually plausible)" },
  { id: "bucket-hat", label: "Bucket Hat", description: "Tourist vibes (wrong for agriculture)" },
  { id: "headphones", label: "Headphones", description: "Over-ear tech (completely wrong for bog)" },
  { id: "scarf", label: "Scarf", description: "Red woolen with yellow stripes" },
  { id: "bandana", label: "Bandana", description: "Blue paisley (festival sheep)" },
  { id: "flower-crown", label: "Flower Crown", description: "Daisies and pink flowers (Coachella in Wicklow)" },
];

const WEATHER = [
  { id: "misty", label: "Misty", description: "Low fog rolling through the bog" },
  { id: "overcast", label: "Overcast", description: "Soft diffused Irish light" },
  { id: "rainy", label: "Rainy", description: "Light rain, wet wool and damp atmosphere" },
  { id: "sunny", label: "Sunny", description: "Rare sunny day with golden light" },
  { id: "stormy", label: "Stormy", description: "Dramatic dark clouds gathering" },
];

const EXPRESSIONS = [
  { id: "neutral", label: "Neutral", description: "Vacant expression with forward gaze" },
  { id: "distant", label: "Distant", description: "Looking slightly off to the side" },
  { id: "certain", label: "Certain", description: "Unshakeable conviction" },
  { id: "waiting", label: "Waiting", description: "Patiently contemplative" },
];

const STYLES = [
  { id: "illustration", label: "Illustration", description: "Clean vector style" },
  { id: "watercolor", label: "Watercolor", description: "Soft washes, organic edges" },
  { id: "digital-art", label: "Digital Art", description: "Polished with textures" },
  { id: "sketch", label: "Sketch", description: "Charcoal with expressive lines" },
];

const ASPECT_RATIOS = [
  { id: "square", label: "Square (1:1)", description: "Instagram, profile" },
  { id: "portrait", label: "Portrait (3:4)", description: "Mobile, stories" },
  { id: "landscape", label: "Landscape (16:9)", description: "Hero banners" },
];

interface GeneratedImage {
  image: string;
  description?: string;
  metadata: {
    posture: string;
    accessory: string;
    weather: string;
    expression: string;
    style: string;
    aspectRatio: string;
  };
  generatedAt: string;
}

export default function IllustrationGenerator() {
  const [posture, setPosture] = useState<string>("random");
  const [accessory, setAccessory] = useState<string>("random");
  const [weather, setWeather] = useState<string>("random");
  const [expression, setExpression] = useState<string>("random");
  const [style, setStyle] = useState<string>("illustration");
  const [aspectRatio, setAspectRatio] = useState<string>("square");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const payload: Record<string, string> = {
        style,
        aspectRatio,
      };
      
      // Only include non-random values
      if (posture !== "random") payload.posture = posture;
      if (accessory !== "random") payload.accessory = accessory;
      if (weather !== "random") payload.weather = weather;
      if (expression !== "random") payload.expression = expression;

      const { data, error } = await supabase.functions.invoke("generate-bubbles-illustration", {
        body: payload,
      });

      if (error) throw error;
      
      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limited", { description: "Please wait a moment and try again." });
        } else if (data.error.includes("Payment")) {
          toast.error("Credits needed", { description: "Please add credits to your workspace." });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data?.success && data?.image) {
        const newImage: GeneratedImage = {
          image: data.image,
          description: data.description,
          metadata: data.metadata,
          generatedAt: new Date().toISOString(),
        };
        
        setGeneratedImages(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
        toast.success("Illustration generated!", { 
          description: `${data.metadata.posture} posture with ${data.metadata.accessory}` 
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Generation failed", { 
        description: error instanceof Error ? error.message : "Unknown error" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomize = () => {
    setPosture("random");
    setAccessory("random");
    setWeather("random");
    setExpression("random");
    toast.info("All parameters randomized");
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = image.image;
    link.download = `bubbles-${image.metadata.posture}-${image.metadata.accessory}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const applyMetadataFromImage = (image: GeneratedImage) => {
    setPosture(image.metadata.posture);
    setAccessory(image.metadata.accessory);
    setWeather(image.metadata.weather);
    setExpression(image.metadata.expression);
    setStyle(image.metadata.style);
    setAspectRatio(image.metadata.aspectRatio);
    toast.info("Settings applied from image");
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Illustration Generator</h1>
        <p className="text-muted-foreground">Generate and preview Bubbles illustrations with controlled variation</p>
      </div>
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Controls Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Variation Controls
              </CardTitle>
              <CardDescription>
                Configure the visual parameters for generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Posture */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Posture
                </Label>
                <Select value={posture} onValueChange={setPosture}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">
                      <span className="flex items-center gap-2">
                        <Shuffle className="h-3 w-3" />
                        Random (weighted)
                      </span>
                    </SelectItem>
                    {POSTURES.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accessory */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Accessory
                </Label>
                <Select value={accessory} onValueChange={setAccessory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">
                      <span className="flex items-center gap-2">
                        <Shuffle className="h-3 w-3" />
                        Random (weighted)
                      </span>
                    </SelectItem>
                    {ACCESSORIES.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="flex flex-col">
                          <span>{a.label}</span>
                          <span className="text-xs text-muted-foreground">{a.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weather */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Weather
                </Label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">
                      <span className="flex items-center gap-2">
                        <Shuffle className="h-3 w-3" />
                        Random
                      </span>
                    </SelectItem>
                    {WEATHER.map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        <span className="flex flex-col">
                          <span>{w.label}</span>
                          <span className="text-xs text-muted-foreground">{w.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expression */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Expression
                </Label>
                <Select value={expression} onValueChange={setExpression}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">
                      <span className="flex items-center gap-2">
                        <Shuffle className="h-3 w-3" />
                        Random
                      </span>
                    </SelectItem>
                    {EXPRESSIONS.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex flex-col">
                          <span>{e.label}</span>
                          <span className="text-xs text-muted-foreground">{e.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Art Style
                </Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex flex-col">
                          <span>{s.label}</span>
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Aspect Ratio
                </Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map(ar => (
                      <SelectItem key={ar.id} value={ar.id}>
                        <span className="flex flex-col">
                          <span>{ar.label}</span>
                          <span className="text-xs text-muted-foreground">{ar.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleRandomize}
              variant="outline"
              className="flex-1"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Randomize
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Main Preview */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed",
                      aspectRatio === "portrait" ? "aspect-[3/4]" : 
                      aspectRatio === "landscape" ? "aspect-video" : "aspect-square"
                    )}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Generating illustration...</p>
                    <p className="text-xs text-muted-foreground/60">This may take 10-20 seconds</p>
                  </motion.div>
                ) : selectedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className={cn(
                      "relative overflow-hidden rounded-xl bg-muted/20",
                      aspectRatio === "portrait" ? "aspect-[3/4]" : 
                      aspectRatio === "landscape" ? "aspect-video" : "aspect-square"
                    )}>
                      <img
                        src={selectedImage.image}
                        alt="Generated Bubbles illustration"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedImage.metadata.posture}</Badge>
                      <Badge variant="secondary">{selectedImage.metadata.accessory}</Badge>
                      <Badge variant="secondary">{selectedImage.metadata.weather}</Badge>
                      <Badge variant="secondary">{selectedImage.metadata.expression}</Badge>
                      <Badge variant="outline">{selectedImage.metadata.style}</Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedImage)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyMetadataFromImage(selectedImage)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Similar
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed",
                      "aspect-square"
                    )}
                  >
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    <p className="mt-4 text-muted-foreground">No image generated yet</p>
                    <p className="text-sm text-muted-foreground/60">
                      Configure parameters and click Generate
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* History */}
          {generatedImages.length > 1 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">History</CardTitle>
                <CardDescription>
                  Previously generated illustrations ({generatedImages.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {generatedImages.map((img, idx) => (
                    <motion.button
                      key={img.generatedAt}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                        selectedImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                      )}
                    >
                      <img
                        src={img.image}
                        alt={`Generated ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
