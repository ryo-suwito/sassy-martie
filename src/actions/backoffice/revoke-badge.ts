'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const RevokeBadgeSchema = z.object({
  grantId: z.string().uuid(),
  listingId: z.string().uuid(),
  reason: z.string().min(1),
})

export async function revokeBadge(formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || claims.user_role !== 'backoffice_admin') {
    return { error: 'Unauthorized - Admin only' }
  }

  const result = RevokeBadgeSchema.safeParse({
    grantId: formData.get('grantId'),
    listingId: formData.get('listingId'),
    reason: formData.get('reason'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { grantId, listingId, reason } = result.data

  const { error } = await supabase
    .from('badge_grants')
    .update({ 
      revoked_at: new Date().toISOString(),
      revoked_by: claims.sub
    })
    .eq('id', grantId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'badge.revoke',
    target_type: 'badge_grant',
    target_id: grantId,
    payload: { listing_id: listingId, reason }
  })

  revalidatePath(`/backoffice/listings/${listingId}`)
  return { success: true }
}
