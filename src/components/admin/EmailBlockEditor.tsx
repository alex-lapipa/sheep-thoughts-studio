import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heading1,
  Type,
  Image,
  MousePointerClick,
  Minus,
  GripVertical,
  Trash2,
  Plus,
  Eye,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Block Types
export type BlockType = "header" | "text" | "image" | "button" | "divider";

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, string>;
}

interface BlockConfig {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultContent: Record<string, string>;
}

const blockConfigs: BlockConfig[] = [
  {
    type: "header",
    label: "Header",
    icon: Heading1,
    defaultContent: { text: "Your Heading Here", level: "h1", align: "center" },
  },
  {
    type: "text",
    label: "Text",
    icon: Type,
    defaultContent: { text: "Write your content here...", align: "left" },
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    defaultContent: { src: "https://via.placeholder.com/600x200", alt: "Image", align: "center" },
  },
  {
    type: "button",
    label: "Button",
    icon: MousePointerClick,
    defaultContent: { text: "Click Here", url: "https://", color: "#4A7C59", align: "center" },
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    defaultContent: { style: "solid", color: "#e5e5e5" },
  },
];

// Draggable Block Palette Item
function PaletteItem({ config, onAdd }: { config: BlockConfig; onAdd: () => void }) {
  const Icon = config.icon;
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-center"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-xs">{config.label}</span>
    </button>
  );
}

// Sortable Block Component
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg border-2 transition-all",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Block Preview */}
      <div className="p-4">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}

// Block Preview Renderer
function BlockPreview({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "header":
      const HeadingTag = (block.content.level || "h1") as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          className={cn(
            "font-display font-bold",
            block.content.level === "h1" && "text-2xl",
            block.content.level === "h2" && "text-xl",
            block.content.level === "h3" && "text-lg"
          )}
          style={{ textAlign: block.content.align as any }}
        >
          {block.content.text || "Heading"}
        </HeadingTag>
      );

    case "text":
      return (
        <p style={{ textAlign: block.content.align as any }} className="text-sm whitespace-pre-wrap">
          {block.content.text || "Text content..."}
        </p>
      );

    case "image":
      return (
        <div style={{ textAlign: block.content.align as any }}>
          <img
            src={block.content.src}
            alt={block.content.alt}
            className="max-w-full h-auto rounded inline-block"
            style={{ maxHeight: 150 }}
          />
        </div>
      );

    case "button":
      return (
        <div style={{ textAlign: block.content.align as any }}>
          <span
            className="inline-block px-6 py-2 rounded text-white font-medium text-sm"
            style={{ backgroundColor: block.content.color || "#4A7C59" }}
          >
            {block.content.text || "Button"}
          </span>
        </div>
      );

    case "divider":
      return (
        <hr
          className="my-2"
          style={{
            borderStyle: block.content.style || "solid",
            borderColor: block.content.color || "#e5e5e5",
          }}
        />
      );

    default:
      return <div>Unknown block</div>;
  }
}

// Block Editor Panel
function BlockEditor({
  block,
  onChange,
}: {
  block: EmailBlock;
  onChange: (content: Record<string, string>) => void;
}) {
  const updateField = (field: string, value: string) => {
    onChange({ ...block.content, [field]: value });
  };

  switch (block.type) {
    case "header":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Heading Text</Label>
            <Input
              value={block.content.text}
              onChange={(e) => updateField("text", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select value={block.content.level} onValueChange={(v) => updateField("level", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 - Large</SelectItem>
                <SelectItem value="h2">H2 - Medium</SelectItem>
                <SelectItem value="h3">H3 - Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select value={block.content.align} onValueChange={(v) => updateField("align", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={block.content.text}
              onChange={(e) => updateField("text", e.target.value)}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select value={block.content.align} onValueChange={(v) => updateField("align", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={block.content.src}
              onChange={(e) => updateField("src", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Alt Text</Label>
            <Input
              value={block.content.alt}
              onChange={(e) => updateField("alt", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select value={block.content.align} onValueChange={(v) => updateField("align", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "button":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={block.content.text}
              onChange={(e) => updateField("text", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input
              value={block.content.url}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Button Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={block.content.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={block.content.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select value={block.content.align} onValueChange={(v) => updateField("align", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={block.content.style} onValueChange={(v) => updateField("style", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={block.content.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={block.content.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      );

    default:
      return <div className="text-muted-foreground">Select a block to edit</div>;
  }
}

// Convert blocks to HTML
export function blocksToHtml(blocks: EmailBlock[]): string {
  const blockHtml = blocks.map((block) => {
    switch (block.type) {
      case "header":
        const tag = block.content.level || "h1";
        const fontSize = tag === "h1" ? "28px" : tag === "h2" ? "24px" : "20px";
        return `<${tag} style="margin: 0 0 16px 0; font-size: ${fontSize}; font-weight: bold; text-align: ${block.content.align || "center"}; color: #1a1a1a;">${escapeHtml(block.content.text)}</${tag}>`;

      case "text":
        return `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; text-align: ${block.content.align || "left"}; color: #333333; white-space: pre-wrap;">${escapeHtml(block.content.text)}</p>`;

      case "image":
        return `<div style="text-align: ${block.content.align || "center"}; margin: 0 0 16px 0;"><img src="${escapeHtml(block.content.src)}" alt="${escapeHtml(block.content.alt)}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;

      case "button":
        return `<div style="text-align: ${block.content.align || "center"}; margin: 16px 0;"><a href="${escapeHtml(block.content.url)}" style="display: inline-block; padding: 12px 24px; background-color: ${block.content.color || "#4A7C59"}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">${escapeHtml(block.content.text)}</a></div>`;

      case "divider":
        return `<hr style="border: none; border-top: 1px ${block.content.style || "solid"} ${block.content.color || "#e5e5e5"}; margin: 24px 0;" />`;

      default:
        return "";
    }
  }).join("\n");

  return `<div style="max-width: 600px; margin: 0 auto; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
${blockHtml}
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Parse HTML back to blocks (basic implementation)
export function htmlToBlocks(html: string): EmailBlock[] {
  // For now, return empty - this is for loading existing content
  // A full implementation would parse the HTML structure
  return [];
}

// Main Email Block Editor Component
interface EmailBlockEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
}

export function EmailBlockEditor({ initialHtml, onChange }: EmailBlockEditorProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const addBlock = useCallback((type: BlockType) => {
    const config = blockConfigs.find((c) => c.type === type);
    if (!config) return;

    const newBlock: EmailBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: { ...config.defaultContent },
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);

    // Trigger onChange
    setTimeout(() => {
      onChange(blocksToHtml([...blocks, newBlock]));
    }, 0);
  }, [blocks, onChange]);

  const updateBlock = useCallback((id: string, content: Record<string, string>) => {
    setBlocks((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, content } : b));
      setTimeout(() => onChange(blocksToHtml(updated)), 0);
      return updated;
    });
  }, [onChange]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      setTimeout(() => onChange(blocksToHtml(updated)), 0);
      return updated;
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, onChange]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        setTimeout(() => onChange(blocksToHtml(reordered)), 0);
        return reordered;
      });
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-1">
          {blockConfigs.map((config) => {
            const Icon = config.icon;
            return (
              <Button
                key={config.type}
                variant="ghost"
                size="sm"
                onClick={() => addBlock(config.type)}
                className="gap-1 h-8"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{config.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "edit" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("edit")}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "code" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("code")}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "edit" && (
        <div className="flex min-h-[400px]">
          {/* Canvas */}
          <div className="flex-1 p-4 bg-muted/10">
            {blocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Plus className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">Click a block type above to add content</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-w-xl mx-auto">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeBlock && (
                    <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-lg opacity-90">
                      <BlockPreview block={activeBlock} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Properties Panel */}
          <div className="w-64 border-l bg-card p-4">
            <h3 className="font-medium mb-4">Block Properties</h3>
            {selectedBlock ? (
              <BlockEditor
                block={selectedBlock}
                onChange={(content) => updateBlock(selectedBlock.id, content)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a block to edit its properties
              </p>
            )}
          </div>
        </div>
      )}

      {viewMode === "preview" && (
        <div className="p-6 bg-card min-h-[400px]">
          <div
            className="max-w-xl mx-auto"
            dangerouslySetInnerHTML={{ __html: blocksToHtml(blocks) }}
          />
        </div>
      )}

      {viewMode === "code" && (
        <ScrollArea className="h-[400px]">
          <pre className="p-4 text-xs font-mono bg-muted/30 whitespace-pre-wrap">
            {blocksToHtml(blocks)}
          </pre>
        </ScrollArea>
      )}
    </div>
  );
}
