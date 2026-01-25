import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Move,
  RotateCw,
  Trash2,
  Grid3X3,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Shirt,
} from "lucide-react";

export interface DesignElement {
  id: string;
  type: "stencil" | "silhouette" | "text" | "custom";
  url?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
}

interface DesignCanvasProps {
  elements: DesignElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onRemoveElement: (id: string) => void;
  backgroundImage?: string;
  backgroundAlt?: string;
  canvasZoom: number;
  onZoomChange: (zoom: number) => void;
}

const GRID_SIZE = 10;
const CANVAS_SIZE = 400;

export function DesignCanvas({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onRemoveElement,
  backgroundImage,
  backgroundAlt,
  canvasZoom,
  onZoomChange,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Snap value to grid
  const snapValue = useCallback(
    (value: number): number => {
      if (!snapToGrid) return value;
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    },
    [snapToGrid]
  );

  // Handle mouse down on element
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, element: DesignElement) => {
      if (element.locked) return;
      e.preventDefault();
      e.stopPropagation();

      onSelectElement(element.id);
      setIsDragging(true);

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const scale = canvasZoom / 100;
        setDragOffset({
          x: e.clientX / scale - element.x,
          y: e.clientY / scale - element.y,
        });
      }
    },
    [onSelectElement, canvasZoom]
  );

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging || !selectedElementId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const scale = canvasZoom / 100;
      const canvasX = (e.clientX - canvasRect.left) / scale;
      const canvasY = (e.clientY - canvasRect.top) / scale;

      let newX = canvasX - dragOffset.x + canvasRect.left / scale;
      let newY = canvasY - dragOffset.y + canvasRect.top / scale;

      // Clamp to canvas bounds
      const element = elements.find((el) => el.id === selectedElementId);
      if (element) {
        newX = Math.max(0, Math.min(CANVAS_SIZE - element.width, newX));
        newY = Math.max(0, Math.min(CANVAS_SIZE - element.height, newY));
      }

      // Apply snap to grid
      newX = snapValue(newX);
      newY = snapValue(newY);

      onUpdateElement(selectedElementId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, selectedElementId, dragOffset, canvasZoom, snapValue, onUpdateElement, elements]);

  // Handle canvas click to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    if (!selectedElementId || !selectedElement || selectedElement.locked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? GRID_SIZE : 1;
      let newX = selectedElement.x;
      let newY = selectedElement.y;

      switch (e.key) {
        case "ArrowLeft":
          newX = Math.max(0, selectedElement.x - step);
          break;
        case "ArrowRight":
          newX = Math.min(CANVAS_SIZE - selectedElement.width, selectedElement.x + step);
          break;
        case "ArrowUp":
          newY = Math.max(0, selectedElement.y - step);
          break;
        case "ArrowDown":
          newY = Math.min(CANVAS_SIZE - selectedElement.height, selectedElement.y + step);
          break;
        case "Delete":
        case "Backspace":
          onRemoveElement(selectedElementId);
          return;
        default:
          return;
      }

      e.preventDefault();
      onUpdateElement(selectedElementId, { x: snapValue(newX), y: snapValue(newY) });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, selectedElement, snapValue, onUpdateElement, onRemoveElement]);

  return (
    <div className="space-y-4">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between gap-4 p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="snap-grid"
              checked={snapToGrid}
              onCheckedChange={setSnapToGrid}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="snap-grid" className="text-xs flex items-center gap-1 cursor-pointer">
              <Crosshair className="h-3 w-3" />
              Snap
            </Label>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <Switch
              id="show-grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="show-grid" className="text-xs flex items-center gap-1 cursor-pointer">
              <Grid3X3 className="h-3 w-3" />
              Grid
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(Math.max(50, canvasZoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-12 text-center font-mono">{canvasZoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(Math.min(150, canvasZoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative overflow-auto max-h-[500px] rounded-lg border bg-card">
        <div
          style={{
            transform: `scale(${canvasZoom / 100})`,
            transformOrigin: "top left",
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
          }}
        >
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={cn(
              "relative w-full h-full bg-muted/30 overflow-hidden cursor-crosshair",
              isDragging && "cursor-grabbing"
            )}
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              backgroundImage: showGrid
                ? `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                   linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`
                : undefined,
              backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : undefined,
            }}
          >
            {/* Background Product Image */}
            {backgroundImage ? (
              <img
                src={backgroundImage}
                alt={backgroundAlt || "Product"}
                className="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Shirt className="h-32 w-32 text-muted-foreground/20" />
              </div>
            )}

            {/* Center guides */}
            {showGrid && (
              <>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 pointer-events-none" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30 pointer-events-none" />
              </>
            )}

            {/* Design Elements */}
            <AnimatePresence>
              {elements.map((element) => (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "absolute select-none",
                    element.locked ? "cursor-not-allowed" : "cursor-grab",
                    isDragging && selectedElementId === element.id && "cursor-grabbing",
                    selectedElementId === element.id &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: `rotate(${element.rotation}deg)`,
                    opacity: element.opacity / 100,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element)}
                >
                  {element.url && (
                    <img
                      src={element.url}
                      alt={element.type}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  )}
                  {element.text && (
                    <div className="w-full h-full flex items-center justify-center text-foreground font-bold">
                      {element.text}
                    </div>
                  )}

                  {/* Lock indicator */}
                  {element.locked && (
                    <div className="absolute -top-2 -right-2 p-1 bg-muted rounded-full">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      {selectedElement && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-mono">
            X: {Math.round(selectedElement.x)}px
          </span>
          <span className="font-mono">
            Y: {Math.round(selectedElement.y)}px
          </span>
          <span className="font-mono">
            W: {selectedElement.width}px × H: {selectedElement.height}px
          </span>
        </div>
      )}
    </div>
  );
}

// Separate component for element controls panel
interface ElementControlsProps {
  element: DesignElement | undefined;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onRemove: (id: string) => void;
  snapToGrid: boolean;
}

export function ElementControls({ element, onUpdate, onRemove, snapToGrid }: ElementControlsProps) {
  if (!element) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an element to edit</p>
          <p className="text-xs mt-1">Use arrow keys for precise positioning</p>
        </CardContent>
      </Card>
    );
  }

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const snapped = snapToGrid ? Math.round(numValue / GRID_SIZE) * GRID_SIZE : numValue;
      onUpdate(element.id, { [axis]: Math.max(0, snapped) });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2 capitalize">
            <Move className="h-4 w-4" />
            {element.type} Element
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdate(element.id, { locked: !element.locked })}
            >
              {element.locked ? (
                <Lock className="h-3.5 w-3.5 text-warning" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onRemove(element.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">X Position</Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                className="h-8 text-xs font-mono"
                disabled={element.locked}
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Y Position</Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                className="h-8 text-xs font-mono"
                disabled={element.locked}
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>
        </div>

        {/* Size Control */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Size</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {element.width}px
            </span>
          </div>
          <Slider
            value={[element.width]}
            onValueChange={([v]) => onUpdate(element.id, { width: v, height: v })}
            min={30}
            max={350}
            step={10}
            className="mt-2"
            disabled={element.locked}
          />
        </div>

        {/* Rotation Control */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1">
              <RotateCw className="h-3 w-3" />
              Rotation
            </Label>
            <span className="text-xs text-muted-foreground font-mono">
              {element.rotation}°
            </span>
          </div>
          <Slider
            value={[element.rotation]}
            onValueChange={([v]) => onUpdate(element.id, { rotation: v })}
            min={-180}
            max={180}
            step={5}
            className="mt-2"
            disabled={element.locked}
          />
        </div>

        {/* Opacity Control */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {element.opacity}%
            </span>
          </div>
          <Slider
            value={[element.opacity]}
            onValueChange={([v]) => onUpdate(element.id, { opacity: v })}
            min={10}
            max={100}
            step={5}
            className="mt-2"
            disabled={element.locked}
          />
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onUpdate(element.id, { x: 200 - element.width / 2, y: 200 - element.height / 2 })}
            disabled={element.locked}
          >
            Center
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onUpdate(element.id, { rotation: 0 })}
            disabled={element.locked}
          >
            Reset Rotation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
