import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async () => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  // Fetch live listings
  // In a real scenario, we'd use pagination to avoid timeouts
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id')
    .eq('status', 'live')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = []
  for (const listing of listings) {
    const { data: run, error: runError } = await supabase
      .from('qa_runs')
      .insert({
        listing_id: listing.id,
        triggered_by: 'scheduled',
        initiated_at: new Date().toISOString(),
        overall_result: 'pending'
      })
      .select()
      .single()

    if (runError) {
      results.push({ listing_id: listing.id, error: runError.message })
    } else {
      results.push({ listing_id: listing.id, run_id: run.id })
      
      // Trigger individual checks (simulated as separate calls or async logic)
      // In Phase 1, we might just call them or they might be triggered by DB hooks
    }
  }

  return new Response(JSON.stringify({ processed: listings.length, results }), {
    headers: { "Content-Type": "application/json" },
  })
})
