'use server'

import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/lib/auth/guards'
import { revalidatePath } from 'next/cache'

export async function redeemVoucher(voucherId: string) {
  const supabase = await createClient()
  const claims = await requireAuth(supabase)

  const { error } = await supabase.schema('rewards').rpc('redeem_voucher', {
    p_user_id: claims.sub,
    p_voucher_id: voucherId
  })

  if (error) {
    let message = 'Something went sideways during redemption.'
    
    if (error.message.includes('UNAUTHORIZED')) {
      message = "This one's not yours, friend."
    } else if (error.message.includes('INVALID')) {
      message = "This voucher's already been used."
    } else if (error.message.includes('EXPIRED')) {
      message = "This one slipped through your fingers. It's expired."
    }
    
    return { error: message }
  }

  revalidatePath('/dashboard/taster/wallet')
  
  // We need to fetch the redemption result for external codes
  const { data: redemption } = await supabase
    .schema('rewards')
    .from('redemptions')
    .select('activation_result, activation_type')
    .eq('voucher_id', voucherId)
    .single()

  return { 
    success: true, 
    result: redemption?.activation_result,
    type: redemption?.activation_type 
  }
}
