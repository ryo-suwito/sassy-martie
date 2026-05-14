'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const ResolveFlagSchema = z.object({
  flagId: z.string().uuid(),
  listingId: z.string().uuid(),
})

export async function resolveFlag(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || !['backoffice_admin', 'backoffice_reviewer'].includes(claims.user_role as string)) {
    return { error: 'Unauthorized' }
  }

  const result = ResolveFlagSchema.safeParse({
    flagId: formData.get('flagId'),
    listingId: formData.get('listingId'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { flagId, listingId } = result.data

  const { error } = await supabase
    .from('flags')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', flagId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'listing.resolve_flag',
    target_type: 'listing',
    target_id: listingId,
    payload: { flag_id: flagId }
  })

  revalidatePath(`/backoffice/listings/${listingId}`)
  revalidatePath('/backoffice/queue')
  return { success: true }
}
