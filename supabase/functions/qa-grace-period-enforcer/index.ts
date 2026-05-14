import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async () => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  // Find expired grace periods
  const { data: expired, error } = await supabase
    .from('grace_periods')
    .select('id, listing_id')
    .is('closed_at', null)
    .lt('deadline_at', new Date().toISOString())

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const results = []
  for (const gp of expired) {
    // 1. Close the grace period
    await supabase
      .from('grace_periods')
      .update({ 
        closed_at: new Date().toISOString(),
        resolution: 'expired'
      })
      .eq('id', gp.id)

    // 2. Set listing status to failing
    await supabase
      .from('listings')
      .update({ qa_status: 'failing' })
      .eq('id', gp.listing_id)

    // 3. Write audit log
    await supabase.from('audit_log').insert({
      action: 'grace_period.expire',
      target_type: 'listing',
      target_id: gp.listing_id,
      payload: { grace_period_id: gp.id }
    })

    results.push(gp.id)
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  })
})
