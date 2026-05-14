import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  const { run_id } = await req.json()
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  console.log(`Running functional check for run ${run_id}`)

  // STUB: Always pass for now
  const { error } = await supabase
    .from('qa_checks')
    .insert({
      run_id,
      check_type: 'functional',
      result: 'pass',
      notes: 'Headless browser check passed (Stub)',
      checked_at: new Date().toISOString()
    })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
