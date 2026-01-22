import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LayoutBlock {
  type: string;
  props: Record<string, unknown>;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  blocks: LayoutBlock[];
  thumbnail_url: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  use_count: number;
}

export function useLayoutTemplates(category?: string) {
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("layout_templates")
        .select("*")
        .order("use_count", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates((data as unknown as LayoutTemplate[]) || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const saveTemplate = async (
    name: string,
    blocks: LayoutBlock[],
    options?: {
      description?: string;
      category?: string;
      isPublic?: boolean;
      thumbnailUrl?: string;
    }
  ): Promise<LayoutTemplate | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("layout_templates")
        .insert([{
          name,
          blocks: JSON.parse(JSON.stringify(blocks)),
          description: options?.description || null,
          category: options?.category || "general",
          is_public: options?.isPublic || false,
          thumbnail_url: options?.thumbnailUrl || null,
          created_by: userData.user?.id || null,
        }] as never)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template saved",
        description: `"${name}" has been saved to your templates.`,
      });

      await fetchTemplates();
      return data as unknown as LayoutTemplate;
    } catch (err) {
      console.error("Error saving template:", err);
      toast({
        title: "Failed to save template",
        description: "Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("layout_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template deleted",
        description: "The template has been removed.",
      });

      await fetchTemplates();
      return true;
    } catch (err) {
      console.error("Error deleting template:", err);
      toast({
        title: "Failed to delete template",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementUseCount = async (id: string) => {
    try {
      const template = templates.find((t) => t.id === id);
      if (!template) return;

      await supabase
        .from("layout_templates")
        .update({ use_count: template.use_count + 1 })
        .eq("id", id);
    } catch (err) {
      console.error("Error incrementing use count:", err);
    }
  };

  return {
    templates,
    loading,
    saveTemplate,
    deleteTemplate,
    incrementUseCount,
    refetch: fetchTemplates,
  };
}
