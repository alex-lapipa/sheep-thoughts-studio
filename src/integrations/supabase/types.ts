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
      audit_logs: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_key: string
          asset_name: string
          asset_type: string
          asset_value: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
          version: number
        }
        Insert: {
          asset_key: string
          asset_name: string
          asset_type: string
          asset_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version?: number
        }
        Update: {
          asset_key?: string
          asset_name?: string
          asset_type?: string
          asset_value?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
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
      bubbles_rag_content: {
        Row: {
          avoid: string[] | null
          bubbles_wrong_take: string
          canonical_claim: string | null
          category: string | null
          comedy_hooks: string[] | null
          created_at: string | null
          embedding: string | null
          id: string
          signature_lines: string[] | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          avoid?: string[] | null
          bubbles_wrong_take: string
          canonical_claim?: string | null
          category?: string | null
          comedy_hooks?: string[] | null
          created_at?: string | null
          embedding?: string | null
          id: string
          signature_lines?: string[] | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          avoid?: string[] | null
          bubbles_wrong_take?: string
          canonical_claim?: string | null
          category?: string | null
          comedy_hooks?: string[] | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          signature_lines?: string[] | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
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
      contact_messages: {
        Row: {
          email: string
          id: string
          is_spam: boolean | null
          message: string
          metadata: Json | null
          name: string
          notes: string | null
          responded_at: string | null
          responded_by: string | null
          spam_reasons: string[] | null
          spam_score: number | null
          status: string
          subject: string | null
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          is_spam?: boolean | null
          message: string
          metadata?: Json | null
          name: string
          notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          subject?: string | null
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_spam?: boolean | null
          message?: string
          metadata?: Json | null
          name?: string
          notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          subject?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          email: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      drops: {
        Row: {
          checklist: Json | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          mode_tag: string | null
          name: string
          slug: string
          start_date: string | null
          tag_value: string
          updated_at: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          mode_tag?: string | null
          name: string
          slug: string
          start_date?: string | null
          tag_value: string
          updated_at?: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          mode_tag?: string | null
          name?: string
          slug?: string
          start_date?: string | null
          tag_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_events: {
        Row: {
          created_at: string
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          price: number | null
          product_id: string | null
          product_title: string | null
          quantity: number | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          price?: number | null
          product_id?: string | null
          product_title?: string | null
          quantity?: number | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          price?: number | null
          product_id?: string | null
          product_title?: string | null
          quantity?: number | null
          variant_id?: string | null
        }
        Relationships: []
      }
      exceptions_queue: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          notes: string | null
          pod_job_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: number
          shopify_order_id: string | null
          shopify_product_id: string | null
          status: Database["public"]["Enums"]["exception_status"]
          suggested_action: string | null
          title: string
          type: Database["public"]["Enums"]["exception_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pod_job_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          shopify_order_id?: string | null
          shopify_product_id?: string | null
          status?: Database["public"]["Enums"]["exception_status"]
          suggested_action?: string | null
          title: string
          type: Database["public"]["Enums"]["exception_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pod_job_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number
          shopify_order_id?: string | null
          shopify_product_id?: string | null
          status?: Database["public"]["Enums"]["exception_status"]
          suggested_action?: string | null
          title?: string
          type?: Database["public"]["Enums"]["exception_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exceptions_queue_pod_job_id_fkey"
            columns: ["pod_job_id"]
            isOneToOne: false
            referencedRelation: "pod_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          html_content: string
          id: string
          metadata: Json | null
          preview_text: string | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          html_content: string
          id?: string
          metadata?: Json | null
          preview_text?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          html_content?: string
          id?: string
          metadata?: Json | null
          preview_text?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          email: string
          id: string
          metadata: Json | null
          source: string | null
          status: string
          subscribed_at: string
          token_expires_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string
          token_expires_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string
          token_expires_at?: string | null
        }
        Relationships: []
      }
      pod_jobs: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          last_status_check: string | null
          metadata: Json | null
          pod_line_item_id: string | null
          pod_order_id: string | null
          pod_provider: Database["public"]["Enums"]["pod_provider_type"]
          retry_count: number | null
          shipped_at: string | null
          shopify_line_item_id: string
          shopify_order_id: string
          shopify_order_name: string | null
          status: Database["public"]["Enums"]["pod_job_status"]
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          variant_mapping_id: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          last_status_check?: string | null
          metadata?: Json | null
          pod_line_item_id?: string | null
          pod_order_id?: string | null
          pod_provider: Database["public"]["Enums"]["pod_provider_type"]
          retry_count?: number | null
          shipped_at?: string | null
          shopify_line_item_id: string
          shopify_order_id: string
          shopify_order_name?: string | null
          status?: Database["public"]["Enums"]["pod_job_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          variant_mapping_id?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          last_status_check?: string | null
          metadata?: Json | null
          pod_line_item_id?: string | null
          pod_order_id?: string | null
          pod_provider?: Database["public"]["Enums"]["pod_provider_type"]
          retry_count?: number | null
          shipped_at?: string | null
          shopify_line_item_id?: string
          shopify_order_id?: string
          shopify_order_name?: string | null
          status?: Database["public"]["Enums"]["pod_job_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          variant_mapping_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pod_jobs_variant_mapping_id_fkey"
            columns: ["variant_mapping_id"]
            isOneToOne: false
            referencedRelation: "variant_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_providers: {
        Row: {
          api_key_name: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          last_sync_status: string | null
          name: string
          provider: Database["public"]["Enums"]["pod_provider_type"]
          settings: Json | null
          status: Database["public"]["Enums"]["pod_connection_status"]
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key_name?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          name: string
          provider: Database["public"]["Enums"]["pod_provider_type"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["pod_connection_status"]
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key_name?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          name?: string
          provider?: Database["public"]["Enums"]["pod_provider_type"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["pod_connection_status"]
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          base_cost: number | null
          created_at: string
          id: string
          is_active: boolean | null
          margin_type: string
          margin_value: number
          max_price: number | null
          min_price: number | null
          name: string
          pod_provider: Database["public"]["Enums"]["pod_provider_type"] | null
          priority: number | null
          product_type: string | null
          rounding_rule: string | null
          updated_at: string
        }
        Insert: {
          base_cost?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          margin_type?: string
          margin_value: number
          max_price?: number | null
          min_price?: number | null
          name: string
          pod_provider?: Database["public"]["Enums"]["pod_provider_type"] | null
          priority?: number | null
          product_type?: string | null
          rounding_rule?: string | null
          updated_at?: string
        }
        Update: {
          base_cost?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          margin_type?: string
          margin_value?: number
          max_price?: number | null
          min_price?: number | null
          name?: string
          pod_provider?: Database["public"]["Enums"]["pod_provider_type"] | null
          priority?: number | null
          product_type?: string | null
          rounding_rule?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      share_events: {
        Row: {
          content_id: string | null
          content_title: string | null
          content_type: string
          created_at: string
          id: string
          share_method: string
        }
        Insert: {
          content_id?: string | null
          content_title?: string | null
          content_type: string
          created_at?: string
          id?: string
          share_method?: string
        }
        Update: {
          content_id?: string | null
          content_title?: string | null
          content_type?: string
          created_at?: string
          id?: string
          share_method?: string
        }
        Relationships: []
      }
      shopify_settings: {
        Row: {
          api_version: string
          created_at: string
          default_location_id: string | null
          id: string
          is_connected: boolean | null
          last_api_call: string | null
          last_api_status: string | null
          oauth_state: string | null
          scopes: string[] | null
          store_domain: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          api_version?: string
          created_at?: string
          default_location_id?: string | null
          id?: string
          is_connected?: boolean | null
          last_api_call?: string | null
          last_api_status?: string | null
          oauth_state?: string | null
          scopes?: string[] | null
          store_domain: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          api_version?: string
          created_at?: string
          default_location_id?: string | null
          id?: string
          is_connected?: boolean | null
          last_api_call?: string | null
          last_api_status?: string | null
          oauth_state?: string | null
          scopes?: string[] | null
          store_domain?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      shopify_webhooks: {
        Row: {
          attempts: number | null
          created_at: string
          error_message: string | null
          headers: Json | null
          id: string
          idempotency_key: string | null
          last_attempt_at: string | null
          payload: Json
          processed_at: string | null
          shopify_webhook_id: string | null
          status: Database["public"]["Enums"]["webhook_status"]
          topic: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string | null
          payload: Json
          processed_at?: string | null
          shopify_webhook_id?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          topic: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          idempotency_key?: string | null
          last_attempt_at?: string | null
          payload?: Json
          processed_at?: string | null
          shopify_webhook_id?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          topic?: string
        }
        Relationships: []
      }
      submitted_questions: {
        Row: {
          answer: string | null
          id: string
          ip_hash: string | null
          is_spam: boolean | null
          metadata: Json | null
          notes: string | null
          question: string
          reviewed_at: string | null
          reviewed_by: string | null
          spam_reasons: string[] | null
          spam_score: number | null
          status: string
          submitted_at: string
        }
        Insert: {
          answer?: string | null
          id?: string
          ip_hash?: string | null
          is_spam?: boolean | null
          metadata?: Json | null
          notes?: string | null
          question: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          submitted_at?: string
        }
        Update: {
          answer?: string | null
          id?: string
          ip_hash?: string | null
          is_spam?: boolean | null
          metadata?: Json | null
          notes?: string | null
          question?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spam_reasons?: string[] | null
          spam_score?: number | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      variant_mappings: {
        Row: {
          created_at: string
          id: string
          last_validated_at: string | null
          pod_product_id: string | null
          pod_provider: Database["public"]["Enums"]["pod_provider_type"] | null
          pod_template_id: string | null
          pod_variant_id: string | null
          print_files: Json | null
          shopify_options: Json | null
          shopify_product_id: string
          shopify_sku: string | null
          shopify_title: string | null
          shopify_variant_id: string
          status: Database["public"]["Enums"]["mapping_status"]
          updated_at: string
          validation_errors: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_validated_at?: string | null
          pod_product_id?: string | null
          pod_provider?: Database["public"]["Enums"]["pod_provider_type"] | null
          pod_template_id?: string | null
          pod_variant_id?: string | null
          print_files?: Json | null
          shopify_options?: Json | null
          shopify_product_id: string
          shopify_sku?: string | null
          shopify_title?: string | null
          shopify_variant_id: string
          status?: Database["public"]["Enums"]["mapping_status"]
          updated_at?: string
          validation_errors?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          last_validated_at?: string | null
          pod_product_id?: string | null
          pod_provider?: Database["public"]["Enums"]["pod_provider_type"] | null
          pod_template_id?: string | null
          pod_variant_id?: string | null
          print_files?: Json | null
          shopify_options?: Json | null
          shopify_product_id?: string
          shopify_sku?: string | null
          shopify_title?: string | null
          shopify_variant_id?: string
          status?: Database["public"]["Enums"]["mapping_status"]
          updated_at?: string
          validation_errors?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_admin: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
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
      search_bubbles_rag_content: {
        Args: {
          filter_category?: string
          filter_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          bubbles_wrong_take: string
          category: string
          comedy_hooks: string[]
          id: string
          signature_lines: string[]
          similarity: number
          tags: string[]
          title: string
          type: string
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
      exception_status: "open" | "in_progress" | "resolved" | "ignored"
      exception_type:
        | "address_issue"
        | "pod_failure"
        | "unmapped_variant"
        | "missing_print_file"
        | "payment_issue"
        | "inventory_issue"
        | "other"
      mapping_status:
        | "ok"
        | "missing_file"
        | "missing_variant"
        | "mismatch"
        | "unmapped"
      pod_connection_status: "connected" | "disconnected" | "error" | "pending"
      pod_job_status:
        | "not_sent"
        | "queued"
        | "in_production"
        | "shipped"
        | "delivered"
        | "error"
        | "cancelled"
      pod_provider_type: "printful" | "printify" | "gelato"
      user_role: "admin" | "ops" | "merch" | "readonly" | "super_admin"
      webhook_status: "pending" | "processed" | "failed" | "retrying"
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
      exception_status: ["open", "in_progress", "resolved", "ignored"],
      exception_type: [
        "address_issue",
        "pod_failure",
        "unmapped_variant",
        "missing_print_file",
        "payment_issue",
        "inventory_issue",
        "other",
      ],
      mapping_status: [
        "ok",
        "missing_file",
        "missing_variant",
        "mismatch",
        "unmapped",
      ],
      pod_connection_status: ["connected", "disconnected", "error", "pending"],
      pod_job_status: [
        "not_sent",
        "queued",
        "in_production",
        "shipped",
        "delivered",
        "error",
        "cancelled",
      ],
      pod_provider_type: ["printful", "printify", "gelato"],
      user_role: ["admin", "ops", "merch", "readonly", "super_admin"],
      webhook_status: ["pending", "processed", "failed", "retrying"],
    },
  },
} as const
