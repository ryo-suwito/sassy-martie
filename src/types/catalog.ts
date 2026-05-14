import { Database } from '@/utils/supabase/database.types'

export type ListingStatus = Database['public']['Enums']['listing_status']
export type QAStatus = Database['public']['Enums']['qa_status']
export type PricingModel = Database['public']['Enums']['pricing_model']
export type ContentStatus = Database['public']['Enums']['content_status']
export type EditorialType = Database['public']['Enums']['editorial_type']

export interface Listing {
  id: string
  lister_id: string
  slug: string
  name: string
  tagline: string
  external_url: string
  pricing_model: PricingModel
  status: ListingStatus
  qa_status: QAStatus
  target_audience_description: string | null
  submitted_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ListingMedia {
  id: string
  listing_id: string
  url: string
  type: string
  display_order: number
  created_at: string
}

export interface Utility {
  id: string
  slug: string
  name: string
  description: string | null
  runtime_config: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export interface Editorial {
  id: string
  listing_id: string
  author_id: string | null
  type: EditorialType
  title: string
  body_mdx: string
  status: ContentStatus
  published_at: string | null
  created_at: string
}
