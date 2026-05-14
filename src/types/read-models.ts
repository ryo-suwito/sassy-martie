import { QAStatus, PricingModel } from './catalog'
export type { QAStatus, PricingModel }

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
  pricing_model: PricingModel
  qa_status: QAStatus
  active_badges: string[]
  active_grace_deadline: string | null
  lister_display_name?: string | null
  lister_username?: string
}

export interface ListerProfileModel {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  website_url: string | null
  twitter_handle: string | null
  avatar_url: string | null
  tool_count: number
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
