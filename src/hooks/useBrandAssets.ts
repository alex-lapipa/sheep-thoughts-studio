import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface BrandAsset {
  id: string;
  asset_type: string;
  asset_key: string;
  asset_name: string;
  asset_value: Record<string, unknown>;
  description: string | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useBrandAssets(assetType?: string) {
  return useQuery({
    queryKey: ["brand-assets", assetType],
    queryFn: async () => {
      let query = supabase
        .from("brand_assets")
        .select("*")
        .eq("is_active", true)
        .order("asset_key");
      
      if (assetType) {
        query = query.eq("asset_type", assetType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BrandAsset[];
    },
  });
}

export function useBrandAssetsByCategory(category: string) {
  return useQuery({
    queryKey: ["brand-assets", "category", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_assets")
        .select("*")
        .eq("is_active", true)
        .contains("asset_value", { category })
        .order("asset_key");
      
      if (error) throw error;
      return data as BrandAsset[];
    },
  });
}

export function useUpdateBrandAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { asset_value?: Json; description?: string; is_active?: boolean } }) => {
      const { data, error } = await supabase
        .from("brand_assets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-assets"] });
    },
  });
}

export function useCreateBrandAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (asset: { asset_type: string; asset_key: string; asset_name: string; asset_value?: Json; description?: string }) => {
      const { data, error } = await supabase
        .from("brand_assets")
        .insert(asset)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-assets"] });
    },
  });
}
