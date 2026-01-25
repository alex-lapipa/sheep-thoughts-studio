import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  RotateCcw,
  Palette,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Shirt,
} from "lucide-react";
import type { DesignElement } from "./DesignCanvas";

// Garment color options with hex values for mockup rendering
const GARMENT_COLORS = [
  { id: "black", name: "Black", hex: "#1a1a1a", textColor: "white" },
  { id: "white", name: "White", hex: "#f5f5f5", textColor: "black" },
  { id: "navy", name: "Navy", hex: "#1e3a5f", textColor: "white" },
  { id: "heather-gray", name: "Heather Gray", hex: "#9ca3af", textColor: "black" },
  { id: "forest-green", name: "Forest Green", hex: "#1a472a", textColor: "white" },
  { id: "burgundy", name: "Burgundy", hex: "#6b1c23", textColor: "white" },
  { id: "cream", name: "Cream", hex: "#f5f5dc", textColor: "black" },
  { id: "charcoal", name: "Charcoal", hex: "#36454f", textColor: "white" },
];

// View angles for product preview
const VIEW_ANGLES = [
  { id: "front", name: "Front", rotation: 0 },
  { id: "back", name: "Back", rotation: 180 },
  { id: "left", name: "Left Side", rotation: -45 },
  { id: "right", name: "Right Side", rotation: 45 },
  { id: "detail", name: "Detail", rotation: 0, zoom: 1.5 },
];

// Product type mockup configurations
const MOCKUP_CONFIGS: Record<string, { printArea: { x: number; y: number; width: number; height: number }; aspectRatio: string }> = {
  "T-Shirt": { printArea: { x: 25, y: 20, width: 50, height: 40 }, aspectRatio: "3/4" },
  "Hoodie": { printArea: { x: 28, y: 25, width: 44, height: 35 }, aspectRatio: "3/4" },
  "Mug": { printArea: { x: 20, y: 30, width: 60, height: 40 }, aspectRatio: "1/1" },
  "Tote": { printArea: { x: 20, y: 25, width: 60, height: 50 }, aspectRatio: "1/1" },
  "Cap": { printArea: { x: 30, y: 35, width: 40, height: 30 }, aspectRatio: "4/3" },
};

interface ProductMockupPreviewProps {
  productType: string;
  productTitle: string;
  productImage?: string;
  designElements: DesignElement[];
  printPosition: string;
  onColorSelect?: (colorId: string) => void;
  selectedColors?: string[];
}

export function ProductMockupPreview({
  productType,
  productTitle,
  productImage,
  designElements,
  printPosition,
  onColorSelect,
  selectedColors = ["black"],
}: ProductMockupPreviewProps) {
  const [activeColor, setActiveColor] = useState(GARMENT_COLORS[0]);
  const [activeView, setActiveView] = useState(VIEW_ANGLES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mockupConfig = MOCKUP_CONFIGS[productType] || MOCKUP_CONFIGS["T-Shirt"];

  const handleColorClick = (color: typeof GARMENT_COLORS[0]) => {
    setActiveColor(color);
    onColorSelect?.(color.id);
  };

  const navigateView = (direction: "prev" | "next") => {
    const currentIndex = VIEW_ANGLES.findIndex(v => v.id === activeView.id);
    let newIndex: number;
    if (direction === "prev") {
      newIndex = currentIndex === 0 ? VIEW_ANGLES.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === VIEW_ANGLES.length - 1 ? 0 : currentIndex + 1;
    }
    setActiveView(VIEW_ANGLES[newIndex]);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Product Preview
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Mockup Display */}
        <div 
          className="relative rounded-lg overflow-hidden"
          style={{ aspectRatio: mockupConfig.aspectRatio }}
        >
          {/* Background garment color */}
          <motion.div
            key={activeColor.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            style={{ backgroundColor: activeColor.hex }}
          />

          {/* Garment shape overlay (simulated) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                className="w-full h-full object-contain mix-blend-multiply opacity-80"
                style={{
                  filter: `brightness(${activeColor.id === "white" ? 1 : 0.9})`,
                  transform: `rotateY(${activeView.rotation}deg) scale(${activeView.zoom || 1})`,
                  transition: "transform 0.3s ease",
                }}
              />
            ) : (
              <Shirt 
                className="w-3/4 h-3/4 opacity-30"
                style={{ color: activeColor.textColor }}
              />
            )}
          </div>

          {/* Design overlay (only show on front/detail view) */}
          {(activeView.id === "front" || activeView.id === "detail") && designElements.length > 0 && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${mockupConfig.printArea.x}%`,
                top: `${mockupConfig.printArea.y}%`,
                width: `${mockupConfig.printArea.width}%`,
                height: `${mockupConfig.printArea.height}%`,
                transform: activeView.zoom ? `scale(${activeView.zoom})` : undefined,
                transformOrigin: "center center",
              }}
            >
              {/* Render design elements */}
              <div className="relative w-full h-full">
                {designElements.map((element) => (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: `${(element.x / 400) * 100}%`,
                      top: `${(element.y / 400) * 100}%`,
                      width: `${(element.width / 400) * 100}%`,
                      height: `${(element.height / 400) * 100}%`,
                      transform: `rotate(${element.rotation}deg)`,
                      opacity: element.opacity / 100,
                    }}
                  >
                    {element.url && (
                      <img
                        src={element.url}
                        alt={element.type}
                        className="w-full h-full object-contain"
                        style={{
                          filter: activeColor.textColor === "black" 
                            ? "invert(0)" 
                            : "invert(1) brightness(2)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back view indicator */}
          {activeView.id === "back" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/80">
                Back View
              </Badge>
            </div>
          )}

          {/* View navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80"
            onClick={() => navigateView("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80"
            onClick={() => navigateView("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* View indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {VIEW_ANGLES.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeView.id === view.id
                    ? "bg-primary w-4"
                    : "bg-background/50 hover:bg-background/80"
                )}
              />
            ))}
          </div>
        </div>

        {/* View Angle Tabs */}
        <Tabs value={activeView.id} onValueChange={(v) => setActiveView(VIEW_ANGLES.find(a => a.id === v) || VIEW_ANGLES[0])}>
          <TabsList className="w-full grid grid-cols-5">
            {VIEW_ANGLES.map((view) => (
              <TabsTrigger key={view.id} value={view.id} className="text-xs px-2">
                {view.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Color Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Garment Color
            </span>
            <span className="text-xs text-muted-foreground">{activeColor.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GARMENT_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorClick(color)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                  activeColor.id === color.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border",
                  selectedColors.includes(color.id) && "ring-2 ring-affirmative/30"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Quick Color Presets */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setActiveColor(GARMENT_COLORS[0])}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Thumbnail strip component for multiple mockups
interface MockupThumbnailStripProps {
  colors: typeof GARMENT_COLORS;
  activeColorId: string;
  onColorSelect: (color: typeof GARMENT_COLORS[0]) => void;
  designElements: DesignElement[];
  productType: string;
}

export function MockupThumbnailStrip({
  colors,
  activeColorId,
  onColorSelect,
  designElements,
  productType,
}: MockupThumbnailStripProps) {
  const mockupConfig = MOCKUP_CONFIGS[productType] || MOCKUP_CONFIGS["T-Shirt"];

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {colors.map((color) => (
          <motion.button
            key={color.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorSelect(color)}
            className={cn(
              "relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all",
              activeColorId === color.id
                ? "border-primary"
                : "border-border hover:border-primary/50"
            )}
            style={{ backgroundColor: color.hex }}
          >
            {/* Mini design preview */}
            {designElements.length > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${mockupConfig.printArea.x}%`,
                  top: `${mockupConfig.printArea.y}%`,
                  width: `${mockupConfig.printArea.width}%`,
                  height: `${mockupConfig.printArea.height}%`,
                }}
              >
                {designElements.slice(0, 1).map((element) => (
                  <div key={element.id} className="w-full h-full">
                    {element.url && (
                      <img
                        src={element.url}
                        alt=""
                        className="w-full h-full object-contain"
                        style={{
                          filter: color.textColor === "black" 
                            ? "invert(0)" 
                            : "invert(1) brightness(2)",
                          opacity: element.opacity / 100,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Color name label */}
            <span 
              className="absolute bottom-0 left-0 right-0 text-[8px] text-center py-0.5 bg-background/80 truncate px-1"
            >
              {color.name}
            </span>
          </motion.button>
        ))}
      </div>
    </ScrollArea>
  );
}

// Export color options for use in parent components
export { GARMENT_COLORS, VIEW_ANGLES, MOCKUP_CONFIGS };
