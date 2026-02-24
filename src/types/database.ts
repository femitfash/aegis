// Auto-generated types from Supabase
// Run: npm run db:generate to update

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          role: string;
          permissions: Json;
          last_active_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          full_name?: string | null;
          role?: string;
          permissions?: Json;
          last_active_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          role?: string;
          permissions?: Json;
          last_active_at?: string | null;
          created_at?: string;
        };
      };
      risks: {
        Row: {
          id: string;
          organization_id: string;
          risk_id: string;
          title: string;
          description: string;
          category_id: string | null;
          inherent_likelihood: number | null;
          inherent_impact: number | null;
          inherent_score: number | null;
          residual_likelihood: number | null;
          residual_impact: number | null;
          residual_score: number | null;
          risk_response: string | null;
          risk_appetite: string | null;
          owner_id: string | null;
          status: string;
          due_date: string | null;
          ai_suggestions: Json;
          ai_confidence: Json;
          tags: string[];
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          risk_id: string;
          title: string;
          description: string;
          category_id?: string | null;
          inherent_likelihood?: number | null;
          inherent_impact?: number | null;
          residual_likelihood?: number | null;
          residual_impact?: number | null;
          risk_response?: string | null;
          risk_appetite?: string | null;
          owner_id?: string | null;
          status?: string;
          due_date?: string | null;
          ai_suggestions?: Json;
          ai_confidence?: Json;
          tags?: string[];
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          risk_id?: string;
          title?: string;
          description?: string;
          category_id?: string | null;
          inherent_likelihood?: number | null;
          inherent_impact?: number | null;
          residual_likelihood?: number | null;
          residual_impact?: number | null;
          risk_response?: string | null;
          risk_appetite?: string | null;
          owner_id?: string | null;
          status?: string;
          due_date?: string | null;
          ai_suggestions?: Json;
          ai_confidence?: Json;
          tags?: string[];
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      control_library: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          title: string;
          description: string | null;
          implementation_guidance: string | null;
          control_type: string | null;
          automation_level: string | null;
          owner_id: string | null;
          status: string;
          effectiveness_rating: number | null;
          evidence_requirements: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          title: string;
          description?: string | null;
          implementation_guidance?: string | null;
          control_type?: string | null;
          automation_level?: string | null;
          owner_id?: string | null;
          status?: string;
          effectiveness_rating?: number | null;
          evidence_requirements?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          implementation_guidance?: string | null;
          control_type?: string | null;
          automation_level?: string | null;
          owner_id?: string | null;
          status?: string;
          effectiveness_rating?: number | null;
          evidence_requirements?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      evidence: {
        Row: {
          id: string;
          organization_id: string;
          evidence_id: string;
          title: string;
          description: string | null;
          file_path: string | null;
          file_hash: string | null;
          file_size_bytes: number | null;
          mime_type: string | null;
          source_type: string | null;
          source_integration_id: string | null;
          source_metadata: Json;
          collected_at: string;
          valid_from: string | null;
          valid_to: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          tags: string[];
          metadata: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          evidence_id: string;
          title: string;
          description?: string | null;
          file_path?: string | null;
          file_hash?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          source_type?: string | null;
          source_integration_id?: string | null;
          source_metadata?: Json;
          collected_at: string;
          valid_from?: string | null;
          valid_to?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          tags?: string[];
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          evidence_id?: string;
          title?: string;
          description?: string | null;
          file_path?: string | null;
          file_hash?: string | null;
          file_size_bytes?: number | null;
          mime_type?: string | null;
          source_type?: string | null;
          source_integration_id?: string | null;
          source_metadata?: Json;
          collected_at?: string;
          valid_from?: string | null;
          valid_to?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          tags?: string[];
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
      };
      compliance_frameworks: {
        Row: {
          id: string;
          code: string;
          name: string;
          version: string | null;
          description: string | null;
          structure: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          version?: string | null;
          description?: string | null;
          structure: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          version?: string | null;
          description?: string | null;
          structure?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      copilot_conversations: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          title: string | null;
          context: Json;
          status: string;
          created_at: string;
          last_message_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          title?: string | null;
          context?: Json;
          status?: string;
          created_at?: string;
          last_message_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          title?: string | null;
          context?: Json;
          status?: string;
          created_at?: string;
          last_message_at?: string | null;
        };
      };
      copilot_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          tool_calls: Json;
          tool_results: Json;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          tool_calls?: Json;
          tool_results?: Json;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tool_calls?: Json;
          tool_results?: Json;
          tokens_used?: number | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          sequence_number: number;
          organization_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
          request_id: string | null;
          previous_hash: string | null;
          entry_hash: string;
          created_at: string;
        };
        Insert: never; // Use insert_audit_log function
        Update: never; // Immutable
      };
    };
    Functions: {
      insert_audit_log: {
        Args: {
          p_org_id: string | null;
          p_user_id: string | null;
          p_action: string;
          p_entity_type: string;
          p_entity_id: string;
          p_old_values: Json | null;
          p_new_values: Json | null;
          p_ip?: string | null;
          p_user_agent?: string | null;
          p_session_id?: string | null;
          p_request_id?: string | null;
        };
        Returns: string;
      };
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience exports
export type Risk = Tables<"risks">;
export type Control = Tables<"control_library">;
export type Evidence = Tables<"evidence">;
export type Organization = Tables<"organizations">;
export type User = Tables<"users">;
export type Framework = Tables<"compliance_frameworks">;
export type CopilotConversation = Tables<"copilot_conversations">;
export type CopilotMessage = Tables<"copilot_messages">;
export type AuditLogEntry = Tables<"audit_log">;
