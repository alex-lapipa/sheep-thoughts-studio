import { useState } from "react";
import { Layout, Plus, Trash2, Loader2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLayoutTemplates, LayoutTemplate, LayoutBlock } from "@/hooks/useLayoutTemplates";

interface TemplatePickerProps {
  onSelect: (blocks: LayoutBlock[]) => void;
  category?: string;
  className?: string;
}

export function TemplatePicker({ onSelect, category, className }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const { templates, loading, deleteTemplate, incrementUseCount } = useLayoutTemplates(category);

  const handleSelect = (template: LayoutTemplate) => {
    incrementUseCount(template.id);
    onSelect(template.blocks);
    setOpen(false);
  };

  const categoryColors: Record<string, string> = {
    general: "bg-muted text-muted-foreground",
    hero: "bg-primary/10 text-primary",
    features: "bg-affirmative/10 text-affirmative",
    about: "bg-warning/10 text-warning",
    contact: "bg-destructive/10 text-destructive",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <FolderOpen className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout Templates
          </DialogTitle>
          <DialogDescription>
            Choose a saved template for a quick start
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No templates saved yet</p>
              <p className="text-sm mt-1">Save your first layout to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-primary transition-colors group relative"
                  onClick={() => handleSelect(template)}
                >
                  {template.thumbnail_url ? (
                    <div className="h-24 bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                      <Layout className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{template.name}</h3>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn("shrink-0", categoryColors[template.category] || categoryColors.general)}
                      >
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{template.blocks.length} blocks</span>
                      <span>Used {template.use_count}x</span>
                    </div>
                  </CardContent>

                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{template.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTemplate(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
