export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  backoffice: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          payload: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      flags: {
        Row: {
          created_at: string
          flagged_by: string
          id: string
          listing_id: string
          reason: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["flag_severity"]
        }
        Insert: {
          created_at?: string
          flagged_by: string
          id?: string
          listing_id: string
          reason: string
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["flag_severity"]
        }
        Update: {
          created_at?: string
          flagged_by?: string
          id?: string
          listing_id?: string
          reason?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["flag_severity"]
        }
        Relationships: []
      }
    }
    Views: {
      work_queue: {
        Row: {
          created_at: string | null
          description: string | null
          target_id: string | null
          task_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  builder: {
    Tables: {
      lister_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          twitter_handle: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          twitter_handle?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          twitter_handle?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  catalog: {
    Tables: {
      editorials: {
        Row: {
          author_id: string | null
          body_mdx: string
          created_at: string
          id: string
          listing_id: string
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["editorial_type"]
        }
        Insert: {
          author_id?: string | null
          body_mdx: string
          created_at?: string
          id?: string
          listing_id: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["editorial_type"]
        }
        Update: {
          author_id?: string | null
          body_mdx?: string
          created_at?: string
          id?: string
          listing_id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: Database["public"]["Enums"]["editorial_type"]
        }
        Relationships: [
          {
            foreignKeyName: "editorials_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string
          external_url: string
          id: string
          lister_id: string
          name: string
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          published_at: string | null
          qa_status: Database["public"]["Enums"]["qa_status"]
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          submitted_at: string | null
          tagline: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_url: string
          id?: string
          lister_id: string
          name: string
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          published_at?: string | null
          qa_status?: Database["public"]["Enums"]["qa_status"]
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          tagline: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_url?: string
          id?: string
          lister_id?: string
          name?: string
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          published_at?: string | null
          qa_status?: Database["public"]["Enums"]["qa_status"]
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_at?: string | null
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      utilities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          runtime_config: Json | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          runtime_config?: Json | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          runtime_config?: Json | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  community: {
    Tables: {
      taste_verdicts: {
        Row: {
          id: string
          listing_id: string
          qa_run_id: string
          quorum_reached_at: string
          verdict: Database["public"]["Enums"]["taste_verdict_result"]
          vote_count: number
          weighted_avg_score: number
        }
        Insert: {
          id?: string
          listing_id: string
          qa_run_id: string
          quorum_reached_at?: string
          verdict: Database["public"]["Enums"]["taste_verdict_result"]
          vote_count: number
          weighted_avg_score: number
        }
        Update: {
          id?: string
          listing_id?: string
          qa_run_id?: string
          quorum_reached_at?: string
          verdict?: Database["public"]["Enums"]["taste_verdict_result"]
          vote_count?: number
          weighted_avg_score?: number
        }
        Relationships: []
      }
      taste_votes: {
        Row: {
          id: string
          listing_id: string
          qa_run_id: string
          rationale: string | null
          score: number
          taster_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          qa_run_id: string
          rationale?: string | null
          score: number
          taster_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          qa_run_id?: string
          rationale?: string | null
          score?: number
          taster_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taste_votes_taster_id_fkey"
            columns: ["taster_id"]
            isOneToOne: false
            referencedRelation: "taster_wallet"
            referencedColumns: ["taster_id"]
          },
          {
            foreignKeyName: "taste_votes_taster_id_fkey"
            columns: ["taster_id"]
            isOneToOne: false
            referencedRelation: "tasters"
            referencedColumns: ["id"]
          },
        ]
      }
      taster_applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          motivation: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["taster_app_status"]
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          motivation: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["taster_app_status"]
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          motivation?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["taster_app_status"]
        }
        Relationships: []
      }
      tasters: {
        Row: {
          application_id: string
          id: string
          joined_at: string
          reputation_score: number
          status: Database["public"]["Enums"]["taster_status"]
          suspended_at: string | null
          suspended_reason: string | null
          vote_count: number
        }
        Insert: {
          application_id: string
          id: string
          joined_at?: string
          reputation_score?: number
          status?: Database["public"]["Enums"]["taster_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          vote_count?: number
        }
        Update: {
          application_id?: string
          id?: string
          joined_at?: string
          reputation_score?: number
          status?: Database["public"]["Enums"]["taster_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasters_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "taster_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      taster_wallet: {
        Row: {
          joined_at: string | null
          reputation_score: number | null
          status: Database["public"]["Enums"]["taster_status"] | null
          taster_id: string | null
          verdicts_participated_in: number | null
          vote_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_taste_verdict: {
        Args: { p_qa_run_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      system_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      listing_trust_summary: {
        Row: {
          active_badges: string[] | null
          active_grace_deadline: string | null
          listing_id: string | null
          qa_status: Database["public"]["Enums"]["qa_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_backoffice: { Args: never; Returns: boolean }
    }
    Enums: {
      check_result: "pass" | "fail" | "skip"
      check_type: "functional" | "security" | "taste_test"
      content_status: "draft" | "published" | "archived"
      editorial_type: "review" | "deep_dive" | "news"
      flag_severity: "low" | "medium" | "high" | "critical"
      grace_period_resolution: "resolved" | "expired" | "revoked"
      listing_status: "draft" | "pending_review" | "live" | "suspended"
      pricing_model: "free" | "paid" | "freemium" | "contact"
      qa_run_result: "pass" | "fail" | "pending"
      qa_run_trigger: "scheduled" | "manual" | "resubmission"
      qa_status:
        | "unverified"
        | "passing"
        | "grace_period"
        | "failing"
        | "revoked"
      taste_verdict_result: "pass" | "fail"
      taster_app_status: "pending" | "approved" | "rejected"
      taster_status: "active" | "suspended" | "retired"
      user_role: "user" | "lister" | "backoffice"
      voucher_status:
        | "available"
        | "reserved"
        | "redeemed"
        | "expired"
        | "revoked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  rewards: {
    Tables: {
      earn_policies: {
        Row: {
          action_type: string
          created_at: string
          id: string
          is_active: boolean
          points: number
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          points: number
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          points?: number
        }
        Relationships: []
      }
      external_code_pool: {
        Row: {
          code: string
          id: string
          imported_at: string
          is_allocated: boolean
          reward_item_id: string
        }
        Insert: {
          code: string
          id?: string
          imported_at?: string
          is_allocated?: boolean
          reward_item_id: string
        }
        Update: {
          code?: string
          id?: string
          imported_at?: string
          is_allocated?: boolean
          reward_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_code_pool_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          id: string
          redeemed_at: string
          user_id: string
          voucher_id: string
        }
        Insert: {
          id?: string
          redeemed_at?: string
          user_id: string
          voucher_id: string
        }
        Update: {
          id?: string
          redeemed_at?: string
          user_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_items: {
        Row: {
          cost_points: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          cost_points?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          cost_points?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          bearer_id: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          reward_item_id: string
          status: Database["public"]["Enums"]["voucher_status"]
        }
        Insert: {
          bearer_id?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reward_item_id: string
          status?: Database["public"]["Enums"]["voucher_status"]
        }
        Update: {
          bearer_id?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reward_item_id?: string
          status?: Database["public"]["Enums"]["voucher_status"]
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      redeem_voucher: {
        Args: { p_user_id: string; p_voucher_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  trust: {
    Tables: {
      badge_grants: {
        Row: {
          badge_id: string
          granted_at: string
          id: string
          listing_id: string
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          badge_id: string
          granted_at?: string
          id?: string
          listing_id: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          badge_id?: string
          granted_at?: string
          id?: string
          listing_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_grants_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          description: string | null
          display_name: string
          icon_url: string | null
          id: string
        }
        Insert: {
          code: string
          description?: string | null
          display_name: string
          icon_url?: string | null
          id?: string
        }
        Update: {
          code?: string
          description?: string | null
          display_name?: string
          icon_url?: string | null
          id?: string
        }
        Relationships: []
      }
      grace_periods: {
        Row: {
          closed_at: string | null
          deadline_at: string
          id: string
          listing_id: string
          notes: string | null
          opened_at: string
          qa_run_id: string
          resolution:
            | Database["public"]["Enums"]["grace_period_resolution"]
            | null
        }
        Insert: {
          closed_at?: string | null
          deadline_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          opened_at?: string
          qa_run_id: string
          resolution?:
            | Database["public"]["Enums"]["grace_period_resolution"]
            | null
        }
        Update: {
          closed_at?: string | null
          deadline_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          opened_at?: string
          qa_run_id?: string
          resolution?:
            | Database["public"]["Enums"]["grace_period_resolution"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "grace_periods_qa_run_id_fkey"
            columns: ["qa_run_id"]
            isOneToOne: false
            referencedRelation: "qa_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_checks: {
        Row: {
          check_type: Database["public"]["Enums"]["check_type"]
          checked_at: string
          id: string
          notes: string | null
          result: Database["public"]["Enums"]["check_result"]
          run_id: string
        }
        Insert: {
          check_type: Database["public"]["Enums"]["check_type"]
          checked_at?: string
          id?: string
          notes?: string | null
          result: Database["public"]["Enums"]["check_result"]
          run_id: string
        }
        Update: {
          check_type?: Database["public"]["Enums"]["check_type"]
          checked_at?: string
          id?: string
          notes?: string | null
          result?: Database["public"]["Enums"]["check_result"]
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_checks_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "qa_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_runs: {
        Row: {
          completed_at: string | null
          id: string
          initiated_at: string
          listing_id: string
          overall_result: Database["public"]["Enums"]["qa_run_result"]
          triggered_by: Database["public"]["Enums"]["qa_run_trigger"]
        }
        Insert: {
          completed_at?: string | null
          id?: string
          initiated_at?: string
          listing_id: string
          overall_result?: Database["public"]["Enums"]["qa_run_result"]
          triggered_by: Database["public"]["Enums"]["qa_run_trigger"]
        }
        Update: {
          completed_at?: string | null
          id?: string
          initiated_at?: string
          listing_id?: string
          overall_result?: Database["public"]["Enums"]["qa_run_result"]
          triggered_by?: Database["public"]["Enums"]["qa_run_trigger"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge_if_eligible: {
        Args: {
          p_check_type: Database["public"]["Enums"]["check_type"]
          p_listing_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  backoffice: {
    Enums: {},
  },
  builder: {
    Enums: {},
  },
  catalog: {
    Enums: {},
  },
  community: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      check_result: ["pass", "fail", "skip"],
      check_type: ["functional", "security", "taste_test"],
      content_status: ["draft", "published", "archived"],
      editorial_type: ["review", "deep_dive", "news"],
      flag_severity: ["low", "medium", "high", "critical"],
      grace_period_resolution: ["resolved", "expired", "revoked"],
      listing_status: ["draft", "pending_review", "live", "suspended"],
      pricing_model: ["free", "paid", "freemium", "contact"],
      qa_run_result: ["pass", "fail", "pending"],
      qa_run_trigger: ["scheduled", "manual", "resubmission"],
      qa_status: [
        "unverified",
        "passing",
        "grace_period",
        "failing",
        "revoked",
      ],
      taste_verdict_result: ["pass", "fail"],
      taster_app_status: ["pending", "approved", "rejected"],
      taster_status: ["active", "suspended", "retired"],
      user_role: ["user", "lister", "backoffice"],
      voucher_status: [
        "available",
        "reserved",
        "redeemed",
        "expired",
        "revoked",
      ],
    },
  },
  rewards: {
    Enums: {},
  },
  trust: {
    Enums: {},
  },
} as const

