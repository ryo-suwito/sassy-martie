import { Database } from '@/utils/supabase/database.types'

export type FlagSeverity = Database['public']['Enums']['flag_severity']

export interface Flag {
  id: string
  listing_id: string
  flagged_by: string
  reason: string
  severity: FlagSeverity
  resolved_at: string | null
  created_at: string
}

export interface AuditLogEntry {
  id: string
  actor_id: string | null
  action: string
  target_type: string
  target_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}
