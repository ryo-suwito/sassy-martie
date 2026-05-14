import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

serve(async (req) => {
  try {
    const { record, table, type } = await req.json()

    // We only care about new taste votes
    if (table !== 'taste_votes' || type !== 'INSERT') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const tasterId = record.taster_id

    // 1. Fetch Taster stats
    const { data: taster } = await supabase
      .from('tasters')
      .select('vote_count, reputation_score')
      .eq('id', tasterId)
      .single()

    if (!taster) {
      return new Response(JSON.stringify({ error: 'Taster not found' }), { status: 404 })
    }

    // 2. Fetch active earn policies
    const { data: policies } = await supabase
      .from('earn_policies')
      .select('*')
      .eq('is_active', true)

    if (!policies || policies.length === 0) {
      return new Response(JSON.stringify({ message: 'No active policies' }), { status: 200 })
    }

    const results = []

    for (const policy of policies) {
      let triggered = false
      let reason = ''

      if (policy.action_type === 'taste_vote_milestone' && taster.vote_count >= policy.points) {
        triggered = true
        reason = `milestone_${policy.points}_votes`
      } else if (policy.action_type === 'reputation_tier' && taster.reputation_score >= policy.points) {
        triggered = true
        reason = `reputation_tier_${policy.points}`
      }

      if (triggered) {
        // Check if already earned (if not repeatable)
        const { data: existing } = await supabase
          .from('vouchers')
          .select('id')
          .eq('bearer_id', tasterId)
          .eq('reward_item_id', policy.reward_item_id)
          .eq('issued_reason', reason)
          .maybeSingle()

        if (!existing) {
          // Issue voucher via RPC
          const { data: voucherId, error: issueError } = await supabase.rpc('issue_voucher', {
            p_bearer_id: tasterId,
            p_reward_item_id: policy.reward_item_id,
            p_reason: reason
          })

          if (issueError) {
            console.error(`Error issuing voucher for policy ${policy.id}:`, issueError)
          } else {
            results.push({ policy: policy.id, voucherId })
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), { status: 200 })

  } catch (error) {
    console.error('Earn Policy Enforcer Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
