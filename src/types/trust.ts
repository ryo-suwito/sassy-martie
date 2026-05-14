import { Database } from '@/utils/supabase/database.types'

export type QARunTrigger = Database['public']['Enums']['qa_run_trigger']
export type QARunResult = Database['public']['Enums']['qa_run_result']
export type CheckType = Database['public']['Enums']['check_type']
export type CheckResult = Database['public']['Enums']['check_result']
export type GracePeriodResolution = Database['public']['Enums']['grace_period_resolution']

export interface QARun {
  id: string
  listing_id: string
  triggered_by: QARunTrigger
  initiated_at: string
  completed_at: string | null
  overall_result: QARunResult
}

export interface QACheck {
  id: string
  run_id: string
  check_type: CheckType
  result: CheckResult
  notes: string | null
  checked_at: string
}

export interface Badge {
  id: string
  code: string
  display_name: string
  description: string | null
  icon_url: string | null
}

export interface BadgeGrant {
  id: string
  listing_id: string
  badge_id: string
  granted_at: string
  revoked_at: string | null
  revoked_by: string | null
}

export interface GracePeriod {
  id: string
  listing_id: string
  qa_run_id: string
  opened_at: string
  deadline_at: string
  closed_at: string | null
  resolution: GracePeriodResolution | null
  notes: string | null
}
