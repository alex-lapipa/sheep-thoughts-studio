export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bubbles_knowledge: {
        Row: {
          category: Database["public"]["Enums"]["bubbles_knowledge_category"]
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          mode: Database["public"]["Enums"]["bubbles_mode"] | null
          section_path: string | null
          source_document: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["bubbles_knowledge_category"]
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          mode?: Database["public"]["Enums"]["bubbles_mode"] | null
          section_path?: string | null
          source_document?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["bubbles_knowledge_category"]
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          mode?: Database["public"]["Enums"]["bubbles_mode"] | null
          section_path?: string | null
          source_document?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bubbles_scenarios: {
        Row: {
          beats: Json | null
          created_at: string
          description: string
          embedding: string | null
          end_mode: Database["public"]["Enums"]["bubbles_mode"]
          id: string
          start_mode: Database["public"]["Enums"]["bubbles_mode"]
          tags: string[] | null
          title: string
          trigger_category: string | null
        }
        Insert: {
          beats?: Json | null
          created_at?: string
          description: string
          embedding?: string | null
          end_mode?: Database["public"]["Enums"]["bubbles_mode"]
          id?: string
          start_mode?: Database["public"]["Enums"]["bubbles_mode"]
          tags?: string[] | null
          title: string
          trigger_category?: string | null
        }
        Update: {
          beats?: Json | null
          created_at?: string
          description?: string
          embedding?: string | null
          end_mode?: Database["public"]["Enums"]["bubbles_mode"]
          id?: string
          start_mode?: Database["public"]["Enums"]["bubbles_mode"]
          tags?: string[] | null
          title?: string
          trigger_category?: string | null
        }
        Relationships: []
      }
      bubbles_thoughts: {
        Row: {
          created_at: string
          embedding: string | null
          id: string
          is_ai_generated: boolean | null
          is_curated: boolean | null
          mode: Database["public"]["Enums"]["bubbles_mode"]
          rating: number | null
          tags: string[] | null
          text: string
          trigger_category: string | null
          use_count: number | null
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_curated?: boolean | null
          mode: Database["public"]["Enums"]["bubbles_mode"]
          rating?: number | null
          tags?: string[] | null
          text: string
          trigger_category?: string | null
          use_count?: number | null
        }
        Update: {
          created_at?: string
          embedding?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_curated?: boolean | null
          mode?: Database["public"]["Enums"]["bubbles_mode"]
          rating?: number | null
          tags?: string[] | null
          text?: string
          trigger_category?: string | null
          use_count?: number | null
        }
        Relationships: []
      }
      bubbles_triggers: {
        Row: {
          category: string
          created_at: string
          description: string
          embedding: string | null
          example_bubbles: string[] | null
          example_scenario: string | null
          id: string
          internal_logic: string
          name: string
          tags: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          embedding?: string | null
          example_bubbles?: string[] | null
          example_scenario?: string | null
          id?: string
          internal_logic: string
          name: string
          tags?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          embedding?: string | null
          example_bubbles?: string[] | null
          example_scenario?: string | null
          id?: string
          internal_logic?: string
          name?: string
          tags?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_bubbles_knowledge: {
        Args: {
          filter_category?: Database["public"]["Enums"]["bubbles_knowledge_category"]
          filter_mode?: Database["public"]["Enums"]["bubbles_mode"]
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: Database["public"]["Enums"]["bubbles_knowledge_category"]
          content: string
          id: string
          metadata: Json
          mode: Database["public"]["Enums"]["bubbles_mode"]
          similarity: number
          tags: string[]
          title: string
        }[]
      }
      search_bubbles_thoughts: {
        Args: {
          filter_mode?: Database["public"]["Enums"]["bubbles_mode"]
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          mode: Database["public"]["Enums"]["bubbles_mode"]
          similarity: number
          text: string
          trigger_category: string
        }[]
      }
    }
    Enums: {
      bubbles_knowledge_category:
        | "character_bible"
        | "psychology"
        | "humor_mechanisms"
        | "mode_system"
        | "trigger_taxonomy"
        | "writing_rules"
        | "visual_identity"
        | "brand_guidelines"
        | "comedy_bible"
        | "cross_cultural"
        | "example_content"
        | "research"
      bubbles_mode:
        | "innocent"
        | "concerned"
        | "triggered"
        | "savage"
        | "nuclear"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bubbles_knowledge_category: [
        "character_bible",
        "psychology",
        "humor_mechanisms",
        "mode_system",
        "trigger_taxonomy",
        "writing_rules",
        "visual_identity",
        "brand_guidelines",
        "comedy_bible",
        "cross_cultural",
        "example_content",
        "research",
      ],
      bubbles_mode: ["innocent", "concerned", "triggered", "savage", "nuclear"],
    },
  },
} as const
