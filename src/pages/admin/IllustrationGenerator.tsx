import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  User,
  Save,
  Heart,
  Trash2,
  History,
  Layers,
  Grid3X3,
  ThumbsUp,
  ThumbsDown,
  Star,
  Trophy
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  id?: string;
  image: string;
  publicUrl?: string;
  storagePath?: string;
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
  isFavorite?: boolean;
  saved?: boolean;
}

// Voting state for batch comparison
interface VariationVote {
  upvotes: number;
  downvotes: number;
  rating: number; // 0-5 stars
  votedUp: boolean;
  votedDown: boolean;
  userRating: number;
}

interface SavedIllustration {
  id: string;
  storage_path: string;
  public_url: string;
  posture: string;
  accessory: string;
  weather: string;
  expression: string;
  style: string;
  aspect_ratio: string;
  description: string | null;
  created_at: string;
  is_favorite: boolean;
}

export default function IllustrationGenerator() {
  const { user } = useAuth();
  const [posture, setPosture] = useState<string>("random");
  const [accessory, setAccessory] = useState<string>("random");
  const [weather, setWeather] = useState<string>("random");
  const [expression, setExpression] = useState<string>("random");
  const [style, setStyle] = useState<string>("illustration");
  const [aspectRatio, setAspectRatio] = useState<string>("square");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [savedIllustrations, setSavedIllustrations] = useState<SavedIllustration[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "library">("generate");
  
  // Batch generation state
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(3);
  const [batchVaryBy, setBatchVaryBy] = useState<"random" | "posture" | "accessory" | "weather" | "style">("random");
  const [batchResults, setBatchResults] = useState<GeneratedImage[]>([]);
  
  // Voting state for batch comparison
  const [batchVotes, setBatchVotes] = useState<Record<string, VariationVote>>({});

  // Initialize votes when batch results change
  useEffect(() => {
    if (batchResults.length > 0) {
      const initialVotes: Record<string, VariationVote> = {};
      batchResults.forEach((img) => {
        if (!batchVotes[img.generatedAt]) {
          initialVotes[img.generatedAt] = {
            upvotes: 0,
            downvotes: 0,
            rating: 0,
            votedUp: false,
            votedDown: false,
            userRating: 0,
          };
        } else {
          initialVotes[img.generatedAt] = batchVotes[img.generatedAt];
        }
      });
      setBatchVotes(initialVotes);
    }
  }, [batchResults.length]);

  const handleUpvote = (imageKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchVotes((prev) => {
      const current = prev[imageKey] || { upvotes: 0, downvotes: 0, rating: 0, votedUp: false, votedDown: false, userRating: 0 };
      const wasVotedUp = current.votedUp;
      const wasVotedDown = current.votedDown;
      return {
        ...prev,
        [imageKey]: {
          ...current,
          upvotes: wasVotedUp ? current.upvotes - 1 : current.upvotes + 1,
          downvotes: wasVotedDown ? current.downvotes - 1 : current.downvotes,
          votedUp: !wasVotedUp,
          votedDown: false,
        },
      };
    });
  };

  const handleDownvote = (imageKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchVotes((prev) => {
      const current = prev[imageKey] || { upvotes: 0, downvotes: 0, rating: 0, votedUp: false, votedDown: false, userRating: 0 };
      const wasVotedUp = current.votedUp;
      const wasVotedDown = current.votedDown;
      return {
        ...prev,
        [imageKey]: {
          ...current,
          upvotes: wasVotedUp ? current.upvotes - 1 : current.upvotes,
          downvotes: wasVotedDown ? current.downvotes - 1 : current.downvotes + 1,
          votedUp: false,
          votedDown: !wasVotedDown,
        },
      };
    });
  };

  const handleStarRating = (imageKey: string, starValue: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBatchVotes((prev) => {
      const current = prev[imageKey] || { upvotes: 0, downvotes: 0, rating: 0, votedUp: false, votedDown: false, userRating: 0 };
      const newRating = current.userRating === starValue ? 0 : starValue;
      return {
        ...prev,
        [imageKey]: {
          ...current,
          userRating: newRating,
          rating: newRating,
        },
      };
    });
  };

  const getWinner = () => {
    if (batchResults.length === 0) return null;
    let winner: GeneratedImage | null = null;
    let maxScore = -Infinity;
    batchResults.forEach((img) => {
      const vote = batchVotes[img.generatedAt];
      if (vote) {
        const score = (vote.upvotes - vote.downvotes) * 2 + vote.rating;
        if (score > maxScore) {
          maxScore = score;
          winner = img;
        }
      }
    });
    return maxScore > 0 ? winner : null;
  };

  // Fetch saved illustrations on mount
  useEffect(() => {
    fetchSavedIllustrations();
  }, []);

  const fetchSavedIllustrations = async () => {
    const { data, error } = await supabase
      .from("generated_illustrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setSavedIllustrations(data);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const payload: Record<string, any> = {
        style,
        aspectRatio,
      };
      
      // Only include non-random values
      if (posture !== "random") payload.posture = posture;
      if (accessory !== "random") payload.accessory = accessory;
      if (weather !== "random") payload.weather = weather;
      if (expression !== "random") payload.expression = expression;
      
      // Add batch params if batch mode is enabled
      if (batchMode) {
        payload.batch = true;
        payload.batchCount = batchCount;
        payload.batchMode = batchVaryBy;
      }

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

      // Handle batch results
      if (data?.batch && data?.results) {
        const newImages: GeneratedImage[] = data.results.map((result: any, idx: number) => ({
          image: result.image,
          description: result.description,
          metadata: result.metadata,
          generatedAt: new Date(Date.now() + idx).toISOString(),
        }));
        
        setBatchResults(newImages);
        setGeneratedImages(prev => [...newImages, ...prev]);
        if (newImages.length > 0) {
          setSelectedImage(newImages[0]);
        }
        
        toast.success(`Generated ${data.totalGenerated} variations!`, { 
          description: `Mode: ${batchVaryBy}` 
        });
        
        if (data.errors?.length > 0) {
          toast.warning(`${data.errors.length} generation(s) failed`);
        }
      } else if (data?.success && data?.image) {
        // Single generation result
        const newImage: GeneratedImage = {
          image: data.image,
          description: data.description,
          metadata: data.metadata,
          generatedAt: new Date().toISOString(),
        };
        
        setGeneratedImages(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
        setBatchResults([]);
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
    link.href = image.publicUrl || image.image;
    link.download = `bubbles-${image.metadata.posture}-${image.metadata.accessory}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const handleSaveToLibrary = async (image: GeneratedImage) => {
    if (!user) {
      toast.error("Please log in to save illustrations");
      return;
    }
    
    if (image.saved) {
      toast.info("Already saved to library");
      return;
    }

    setIsSaving(true);
    
    try {
      // Convert base64 to blob
      const base64Data = image.image.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${image.metadata.posture}-${image.metadata.accessory}-${timestamp}.png`;
      const storagePath = `illustrations/${filename}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("bubbles-illustrations")
        .upload(storagePath, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("bubbles-illustrations")
        .getPublicUrl(storagePath);

      // Save metadata to database
      const { data: insertData, error: insertError } = await supabase
        .from("generated_illustrations")
        .insert({
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          posture: image.metadata.posture,
          accessory: image.metadata.accessory,
          weather: image.metadata.weather,
          expression: image.metadata.expression,
          style: image.metadata.style,
          aspect_ratio: image.metadata.aspectRatio,
          description: image.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setGeneratedImages(prev => 
        prev.map(img => 
          img.generatedAt === image.generatedAt 
            ? { ...img, saved: true, id: insertData.id, publicUrl: urlData.publicUrl, storagePath }
            : img
        )
      );
      
      if (selectedImage?.generatedAt === image.generatedAt) {
        setSelectedImage(prev => prev ? { ...prev, saved: true, id: insertData.id, publicUrl: urlData.publicUrl, storagePath } : null);
      }

      await fetchSavedIllustrations();
      toast.success("Saved to library!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save", { 
        description: error instanceof Error ? error.message : "Unknown error" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async (illustration: SavedIllustration) => {
    const { error } = await supabase
      .from("generated_illustrations")
      .update({ is_favorite: !illustration.is_favorite })
      .eq("id", illustration.id);

    if (!error) {
      setSavedIllustrations(prev =>
        prev.map(ill =>
          ill.id === illustration.id ? { ...ill, is_favorite: !ill.is_favorite } : ill
        )
      );
      toast.success(illustration.is_favorite ? "Removed from favorites" : "Added to favorites");
    }
  };

  const handleDeleteFromLibrary = async (illustration: SavedIllustration) => {
    try {
      // Delete from storage
      await supabase.storage
        .from("bubbles-illustrations")
        .remove([illustration.storage_path]);

      // Delete from database
      const { error } = await supabase
        .from("generated_illustrations")
        .delete()
        .eq("id", illustration.id);

      if (error) throw error;

      setSavedIllustrations(prev => prev.filter(ill => ill.id !== illustration.id));
      toast.success("Deleted from library");
    } catch (error) {
      toast.error("Failed to delete");
    }
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

  const loadFromLibrary = (illustration: SavedIllustration) => {
    const img: GeneratedImage = {
      id: illustration.id,
      image: illustration.public_url,
      publicUrl: illustration.public_url,
      storagePath: illustration.storage_path,
      description: illustration.description || undefined,
      metadata: {
        posture: illustration.posture,
        accessory: illustration.accessory,
        weather: illustration.weather,
        expression: illustration.expression,
        style: illustration.style,
        aspectRatio: illustration.aspect_ratio,
      },
      generatedAt: illustration.created_at,
      isFavorite: illustration.is_favorite,
      saved: true,
    };
    setSelectedImage(img);
    setActiveTab("generate");
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
          
          {/* Batch Generation Controls */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Grid3X3 className="h-5 w-5 text-primary" />
                Batch Generation
              </CardTitle>
              <CardDescription>
                Generate multiple variations for A/B testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="batch-mode" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Enable Batch Mode
                </Label>
                <Switch
                  id="batch-mode"
                  checked={batchMode}
                  onCheckedChange={setBatchMode}
                />
              </div>
              
              {batchMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  {/* Batch Count Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Number of Variations</Label>
                      <Badge variant="secondary">{batchCount}</Badge>
                    </div>
                    <Slider
                      value={[batchCount]}
                      onValueChange={([value]) => setBatchCount(value)}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Generate {batchCount} images in parallel
                    </p>
                  </div>
                  
                  {/* Vary By Selector */}
                  <div className="space-y-2">
                    <Label>Vary By</Label>
                    <Select value={batchVaryBy} onValueChange={(v: any) => setBatchVaryBy(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">
                          <span className="flex flex-col">
                            <span>🎲 Fully Random</span>
                            <span className="text-xs text-muted-foreground">Each variation is completely random</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="posture">
                          <span className="flex flex-col">
                            <span>🧍 Posture</span>
                            <span className="text-xs text-muted-foreground">Different poses, same accessories</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="accessory">
                          <span className="flex flex-col">
                            <span>👒 Accessory</span>
                            <span className="text-xs text-muted-foreground">Different accessories, same pose</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="weather">
                          <span className="flex flex-col">
                            <span>🌦️ Weather</span>
                            <span className="text-xs text-muted-foreground">Different atmospheres</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="style">
                          <span className="flex flex-col">
                            <span>🎨 Art Style</span>
                            <span className="text-xs text-muted-foreground">Illustration, watercolor, etc.</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
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
                  {batchMode ? `Generating ${batchCount}...` : "Generating..."}
                </>
              ) : (
                <>
                  {batchMode ? <Grid3X3 className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {batchMode ? `Generate ${batchCount}` : "Generate"}
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
                        src={selectedImage.publicUrl || selectedImage.image}
                        alt="Generated Bubbles illustration"
                        className="w-full h-full object-contain"
                      />
                      {selectedImage.saved && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">Saved</Badge>
                        </div>
                      )}
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
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedImage)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {!selectedImage.saved && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveToLibrary(selectedImage)}
                          disabled={isSaving}
                          className="bg-primary"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save to Library
                        </Button>
                      )}
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
          
          {/* Batch Comparison Grid */}
          {batchResults.length > 1 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                  A/B Comparison
                  {getWinner() && (
                    <Badge variant="default" className="ml-auto bg-amber-500 text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      Leader: #{batchResults.findIndex(img => img === getWinner()) + 1}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Compare {batchResults.length} variations side by side — vote for your favorites!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "grid gap-4",
                  batchResults.length === 2 ? "grid-cols-2" :
                  batchResults.length === 3 ? "grid-cols-3" :
                  batchResults.length === 4 ? "grid-cols-2 md:grid-cols-4" :
                  "grid-cols-2 md:grid-cols-3"
                )}>
                  {batchResults.map((img, idx) => {
                    const vote = batchVotes[img.generatedAt] || { upvotes: 0, downvotes: 0, rating: 0, votedUp: false, votedDown: false, userRating: 0 };
                    const isWinner = getWinner()?.generatedAt === img.generatedAt;
                    
                    return (
                      <motion.div
                        key={img.generatedAt}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                          "relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                          isWinner && "ring-2 ring-amber-400/50",
                          selectedImage?.generatedAt === img.generatedAt 
                            ? "border-primary ring-2 ring-primary/30" 
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedImage(img)}
                      >
                        {/* Winner crown */}
                        {isWinner && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="bg-amber-500 text-white rounded-full p-1.5 shadow-lg">
                              <Trophy className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                        
                        <div className="aspect-square">
                          <img
                            src={img.publicUrl || img.image}
                            alt={`Variation ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Variation label */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                            #{idx + 1}
                          </Badge>
                        </div>
                        
                        {/* Voting controls - always visible */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                          {/* Star rating */}
                          <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={(e) => handleStarRating(img.generatedAt, star, e)}
                                className="transition-transform hover:scale-125 focus:outline-none"
                              >
                                <Star
                                  className={cn(
                                    "h-4 w-4 transition-colors",
                                    star <= vote.userRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-white/50 hover:text-amber-300"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                          
                          {/* Thumbs up/down */}
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              size="sm"
                              variant={vote.votedUp ? "default" : "secondary"}
                              className={cn(
                                "h-8 gap-1 bg-background/80 backdrop-blur-sm",
                                vote.votedUp && "bg-green-600 hover:bg-green-700 text-white"
                              )}
                              onClick={(e) => handleUpvote(img.generatedAt, e)}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">{vote.upvotes}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant={vote.votedDown ? "default" : "secondary"}
                              className={cn(
                                "h-8 gap-1 bg-background/80 backdrop-blur-sm",
                                vote.votedDown && "bg-red-600 hover:bg-red-700 text-white"
                              )}
                              onClick={(e) => handleDownvote(img.generatedAt, e)}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">{vote.downvotes}</span>
                            </Button>
                          </div>
                          
                          {/* Metadata tags on hover */}
                          <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="text-xs bg-background/50 text-foreground border-none">
                              {img.metadata.posture}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-background/50 text-foreground border-none">
                              {img.metadata.accessory}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Save indicator */}
                        {img.saved && (
                          <div className="absolute top-2 right-10">
                            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                          </div>
                        )}
                        
                        {/* Quick actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(img);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {!img.saved && (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveToLibrary(img);
                              }}
                            >
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Batch actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchResults([])}
                  >
                    Clear Comparison
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      batchResults.forEach(img => {
                        if (!img.saved) handleSaveToLibrary(img);
                      });
                    }}
                    disabled={batchResults.every(img => img.saved)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save All to Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                        src={img.publicUrl || img.image}
                        alt={`Generated ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.saved && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Library */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" />
                Saved Library
              </CardTitle>
              <CardDescription>
                {savedIllustrations.length} saved illustrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedIllustrations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved illustrations yet. Generate and save some!
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {savedIllustrations.map((ill) => (
                    <div
                      key={ill.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/20"
                    >
                      <img
                        src={ill.public_url}
                        alt={`${ill.posture} ${ill.accessory}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => loadFromLibrary(ill)}
                      />
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(ill);
                          }}
                        >
                          <Heart className={cn("h-4 w-4", ill.is_favorite && "fill-red-500 text-red-500")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFromLibrary(ill);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {ill.is_favorite && (
                        <div className="absolute top-1 right-1">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
