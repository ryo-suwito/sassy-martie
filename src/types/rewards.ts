import { Database } from '@/utils/supabase/database.types'

export type VoucherStatus = Database['public']['Enums']['voucher_status']

export interface RewardItem {
  id: string
  name: string
  description: string | null
  cost_points: number
  is_active: boolean
  created_at: string
}

export interface Voucher {
  id: string
  reward_item_id: string
  bearer_id: string | null
  status: VoucherStatus
  code: string
  expires_at: string | null
  created_at: string
}

export interface Redemption {
  id: string
  voucher_id: string
  user_id: string
  redeemed_at: string
}

export interface EarnPolicy {
  id: string
  action_type: string
  points: number
  is_active: boolean
  created_at: string
}
