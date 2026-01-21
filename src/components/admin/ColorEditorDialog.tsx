import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandAsset, useCreateBrandAsset, useUpdateBrandAsset, useDeleteBrandAsset } from "@/hooks/useBrandAssets";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ColorEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color?: BrandAsset | null;
  mode: "create" | "edit";
  defaultCategory?: string;
}

const CATEGORIES = [
  { value: "wicklow", label: "🌿 Wicklow Pastoral" },
  { value: "urban", label: "🌃 Urban Chaos" },
  { value: "mode", label: "🎭 Mode Escalation" },
  { value: "seasonal", label: "🍂 Seasonal" },
];

// Convert hex to HSL string
function hexToHslString(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ColorEditorDialog({ open, onOpenChange, color, mode, defaultCategory }: ColorEditorDialogProps) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
  const [category, setCategory] = useState("wicklow");
  const [description, setDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const createMutation = useCreateBrandAsset();
  const updateMutation = useUpdateBrandAsset();
  const deleteMutation = useDeleteBrandAsset();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Reset form when dialog opens with color data
  useEffect(() => {
    if (color && mode === "edit") {
      const val = color.asset_value as { hex?: string; category?: string };
      setName(color.asset_name);
      setHex(val.hex || "#000000");
      setCategory(val.category || "wicklow");
      setDescription(color.description || "");
    } else if (mode === "create") {
      setName("");
      setHex("#4A9B6A");
      setCategory(defaultCategory || "wicklow");
      setDescription("");
    }
  }, [color, mode, open, defaultCategory]);

  const generateKey = (name: string, category: string) => {
    return `${category}-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a color name");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      toast.error("Please enter a valid hex color (e.g., #4A9B6A)");
      return;
    }

    const hsl = hexToHslString(hex);
    const assetValue = {
      hex: hex.toUpperCase(),
      hsl,
      category,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          asset_type: "color",
          asset_key: generateKey(name, category),
          asset_name: name,
          asset_value: assetValue,
          description: description || undefined,
        });
        toast.success(`Created color: ${name}`);
      } else if (color) {
        await updateMutation.mutateAsync({
          id: color.id,
          updates: {
            asset_value: assetValue,
            description: description || undefined,
          },
        });
        toast.success(`Updated color: ${name}`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to ${mode} color`);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!color) return;
    
    try {
      await deleteMutation.mutateAsync(color.id);
      toast.success(`Deleted color: ${color.asset_name}`);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete color");
      console.error(error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded border shadow-sm"
                style={{ backgroundColor: hex }}
              />
              {mode === "create" ? "Add New Color" : `Edit ${color?.asset_name}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Add a new color to the brand palette." 
                : "Update the color properties."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Color Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Meadow Green"
                className="col-span-3"
                disabled={mode === "edit"}
              />
            </div>

            {/* Hex Color */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hex" className="text-right">
                Hex
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="hex"
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={hex.toUpperCase()}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#4A9B6A"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            {/* HSL Preview */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground text-xs">
                HSL
              </Label>
              <div className="col-span-3">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {hexToHslString(hex)}
                </code>
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={mode === "edit"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rolling Wicklow pastures at dawn..."
                className="col-span-3"
                rows={2}
              />
            </div>

            {/* Live Preview */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Preview</Label>
              <div className="col-span-3 space-y-2">
                <div 
                  className="h-20 rounded-lg border shadow-sm"
                  style={{ backgroundColor: hex }}
                />
                <div className="flex gap-2">
                  <div 
                    className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: hex, color: "#fff" }}
                  >
                    White text
                  </div>
                  <div 
                    className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: hex, color: "#000" }}
                  >
                    Black text
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {mode === "edit" && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {color?.asset_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the color from the brand palette.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
