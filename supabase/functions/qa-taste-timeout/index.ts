import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async () => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  // Fetch system config for taste_vote_window_days
  const { data: config } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'taste_vote_window_days')
    .single()

  const windowDays = parseInt(config?.value || '7')
  const timeoutDate = new Date()
  timeoutDate.setDate(timeoutDate.getDate() - windowDays)

  // Find pending taste checks that are past the timeout
  // Note: We're assuming 'skip' means it timed out without quorum in Phase 1
  // In a real Phase 2, we'd check for result = 'pending' or similar.
  // Currently our schema has pass|fail|skip.
  // For now, let's just implement the logic to find old runs that don't have a taste check yet.
  
  const { data: runs, error } = await supabase
    .from('qa_runs')
    .select('id')
    .is('completed_at', null)
    .lt('initiated_at', timeoutDate.toISOString())

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const results = []
  for (const run of runs) {
    // Check if taste_test check already exists
    const { data: existing } = await supabase
      .from('qa_checks')
      .select('id')
      .eq('run_id', run.id)
      .eq('check_type', 'taste_test')
      .maybeSingle()

    if (!existing) {
      await supabase
        .from('qa_checks')
        .insert({
          run_id: run.id,
          check_type: 'taste_test',
          result: 'skip',
          notes: 'Taste check timed out without quorum (Phase 1)',
          checked_at: new Date().toISOString()
        })
      results.push(run.id)
    }
  }

  return new Response(JSON.stringify({ processed: runs.length, results }), {
    headers: { "Content-Type": "application/json" },
  })
})
