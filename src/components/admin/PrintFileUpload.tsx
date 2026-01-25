import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileImage,
  Trash2,
  Check,
  AlertTriangle,
  RefreshCw,
  Link2,
  Unlink,
  FileType,
  Download,
  Eye,
  Printer,
} from "lucide-react";

export interface PrintFile {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  position: "front" | "back" | "left-sleeve" | "right-sleeve" | "pocket" | "all-over";
  uploadedAt: string;
  podTemplateId?: string;
  mappingStatus: "unmapped" | "mapped" | "error";
}

interface PODTemplate {
  id: string;
  name: string;
  type: string;
  provider: string;
  printAreas: string[];
}

interface PrintFileUploadProps {
  designId?: string;
  designName: string;
  printFiles: PrintFile[];
  onFilesChange: (files: PrintFile[]) => void;
  podProvider?: string;
}

const PRINT_POSITIONS = [
  { value: "front", label: "Front", icon: "👕" },
  { value: "back", label: "Back", icon: "🔙" },
  { value: "left-sleeve", label: "Left Sleeve", icon: "💪" },
  { value: "right-sleeve", label: "Right Sleeve", icon: "💪" },
  { value: "pocket", label: "Pocket", icon: "📍" },
  { value: "all-over", label: "All-Over Print", icon: "🎨" },
];

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/pdf",
  "image/tiff",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function PrintFileUpload({
  designId,
  designName,
  printFiles,
  onFilesChange,
  podProvider,
}: PrintFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [podTemplates, setPodTemplates] = useState<PODTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("front");

  // Load POD templates when provider changes
  const loadPODTemplates = useCallback(async () => {
    if (!podProvider) return;

    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: {
          action: "get_pod_templates",
          podProvider,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setPodTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error loading POD templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [podProvider]);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Accepted: PNG, JPG, SVG, PDF, TIFF");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 50MB");
      return;
    }

    await uploadFile(file);
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const designSlug = designName.toLowerCase().replace(/\s+/g, "-").substring(0, 30);
      const filePath = `${designSlug}/${timestamp}-${safeName}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from("print-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get signed URL for the file
      const { data: urlData } = await supabase.storage
        .from("print-files")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

      const newPrintFile: PrintFile = {
        id: `pf-${timestamp}`,
        name: file.name,
        url: urlData?.signedUrl || "",
        path: filePath,
        size: file.size,
        type: file.type,
        position: selectedPosition as PrintFile["position"],
        uploadedAt: new Date().toISOString(),
        mappingStatus: "unmapped",
      };

      onFilesChange([...printFiles, newPrintFile]);
      setUploadProgress(100);
      toast.success(`Uploaded: ${file.name}`);

      // Auto-map to POD template if provider is connected
      if (podProvider && podTemplates.length > 0) {
        await autoMapToTemplate(newPrintFile);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Auto-map file to POD template based on position
  const autoMapToTemplate = async (printFile: PrintFile) => {
    const matchingTemplate = podTemplates.find((t) =>
      t.printAreas?.includes(printFile.position) ||
      t.type.toLowerCase().includes(printFile.position)
    );

    if (matchingTemplate) {
      const updatedFiles = printFiles.map((f) =>
        f.id === printFile.id
          ? { ...f, podTemplateId: matchingTemplate.id, mappingStatus: "mapped" as const }
          : f
      );
      onFilesChange(updatedFiles);
      toast.success(`Auto-mapped to ${matchingTemplate.name}`);
    }
  };

  // Remove file from storage and list
  const handleRemoveFile = async (file: PrintFile) => {
    try {
      const { error } = await supabase.storage
        .from("print-files")
        .remove([file.path]);

      if (error) throw error;

      onFilesChange(printFiles.filter((f) => f.id !== file.id));
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  // Update file mapping
  const handleUpdateMapping = (fileId: string, templateId: string) => {
    const updatedFiles = printFiles.map((f) =>
      f.id === fileId
        ? { ...f, podTemplateId: templateId, mappingStatus: "mapped" as const }
        : f
    );
    onFilesChange(updatedFiles);
    toast.success("Template mapping updated");
  };

  // Update file position
  const handleUpdatePosition = (fileId: string, position: PrintFile["position"]) => {
    const updatedFiles = printFiles.map((f) =>
      f.id === fileId ? { ...f, position } : f
    );
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Printer className="h-5 w-5" />
          Print Files
        </CardTitle>
        <CardDescription>
          Upload high-resolution print-ready files (PNG, PDF, SVG, TIFF)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            "hover:border-primary hover:bg-primary/5",
            uploading && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload print file</p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, SVG, PDF, TIFF • Max 50MB
          </p>

          {uploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
            </div>
          )}
        </div>

        {/* Position Selector */}
        <div>
          <Label className="text-xs">Print Position for Next Upload</Label>
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRINT_POSITIONS.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  <span className="flex items-center gap-2">
                    <span>{pos.icon}</span>
                    {pos.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* POD Template Mapping */}
        {podProvider && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">POD Template Mapping</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPODTemplates}
                disabled={loadingTemplates}
              >
                {loadingTemplates ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Provider: <span className="font-medium capitalize">{podProvider}</span>
              {podTemplates.length > 0 && (
                <span className="ml-2">• {podTemplates.length} templates available</span>
              )}
            </p>
          </div>
        )}

        {/* Uploaded Files List */}
        {printFiles.length > 0 && (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {printFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-shrink-0">
                    {file.type.includes("image") ? (
                      <FileImage className="h-8 w-8 text-primary" />
                    ) : (
                      <FileType className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {PRINT_POSITIONS.find((p) => p.value === file.position)?.label || file.position}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          file.mappingStatus === "mapped" &&
                            "bg-affirmative/10 text-affirmative border-affirmative/20",
                          file.mappingStatus === "unmapped" &&
                            "bg-warning/10 text-warning border-warning/20",
                          file.mappingStatus === "error" &&
                            "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {file.mappingStatus === "mapped" && <Link2 className="h-3 w-3 mr-1" />}
                        {file.mappingStatus === "unmapped" && <Unlink className="h-3 w-3 mr-1" />}
                        {file.mappingStatus === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {file.mappingStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {file.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveFile(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Empty State */}
        {printFiles.length === 0 && !uploading && (
          <div className="text-center py-4 text-muted-foreground">
            <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No print files uploaded yet</p>
          </div>
        )}

        {/* File Requirements */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
          <p className="font-medium flex items-center gap-1">
            <Check className="h-3 w-3 text-affirmative" />
            Print File Requirements:
          </p>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            <li>Minimum 300 DPI for best quality</li>
            <li>Transparent background (PNG/SVG)</li>
            <li>sRGB color mode recommended</li>
            <li>Bleed area if required by POD provider</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
