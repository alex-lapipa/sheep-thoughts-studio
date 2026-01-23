import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Mentor {
  id: string;
  name: string;
  description: string | null;
  bubbles_interpretation: string | null;
  topics: string[];
  trigger_words: string[];
  sample_questions: string[];
  wisdom_style: string | null;
  background_story: string | null;
  relationship_to_bubbles: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useMentors() {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Mentor[];
    },
  });
}

export function useMentor(id: string) {
  return useQuery({
    queryKey: ["mentors", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Mentor;
    },
    enabled: !!id,
  });
}

export function useUpdateMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mentor> }) => {
      const { data, error } = await supabase
        .from("mentors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["mentors", data.id] });
      toast.success("Mentor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update mentor: ${error.message}`);
    },
  });
}

export function useCreateMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentor: Partial<Mentor> & { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("mentors")
        .insert(mentor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      toast.success("Mentor created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create mentor: ${error.message}`);
    },
  });
}

export function useDeleteMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mentors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      toast.success("Mentor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete mentor: ${error.message}`);
    },
  });
}
