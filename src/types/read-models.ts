import { QAStatus } from './catalog'

export interface ListingTrustSummary {
  listing_id: string
  qa_status: QAStatus
  active_badges: string[]
  active_grace_deadline: string | null
}

export interface ListingCard {
  id: string
  slug: string
  name: string
  tagline: string
  pricing_model: string
  qa_status: QAStatus
  active_badges: string[]
  lister_display_name: string | null
}

export interface BuilderPortfolioItem {
  id: string
  slug: string
  name: string
  tagline: string
  qa_status: QAStatus
  published_at: string | null
}

export interface TasterWalletItem {
  taster_id: string
  status: string
  vote_count: number
  reputation_score: number
  joined_at: string
  verdicts_participated_in: number
}

export interface BackofficeWorkQueueItem {
  task_type: 'pending_listing' | 'open_flag' | 'pending_taster_app'
  target_id: string
  created_at: string
  description: string
}
