import { Database } from '@/utils/supabase/database.types'

export type TasterAppStatus = Database['public']['Enums']['taster_app_status']
export type TasterStatus = Database['public']['Enums']['taster_status']
export type TasteVerdictResult = Database['public']['Enums']['taste_verdict_result']

export interface TasterApplication {
  id: string
  applicant_id: string
  motivation: string
  status: TasterAppStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface Taster {
  id: string
  application_id: string
  status: TasterStatus
  vote_count: number
  reputation_score: number
  suspended_at: string | null
  suspended_reason: string | null
  joined_at: string
}

export interface TasteVote {
  id: string
  listing_id: string
  taster_id: string
  qa_run_id: string
  score: number
  rationale: string | null
  voted_at: string
}

export interface TasteVerdict {
  id: string
  listing_id: string
  qa_run_id: string
  quorum_reached_at: string
  vote_count: number
  weighted_avg_score: number
  verdict: TasteVerdictResult
}
