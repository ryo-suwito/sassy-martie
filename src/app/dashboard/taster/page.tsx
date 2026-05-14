import { createClient } from '@/utils/supabase/server'
import { requireTaster } from '@/lib/auth/guards'
import { TasterStatusBanner } from '@/components/community/TasterStatusBanner'
import { WalletSummaryWidget } from '@/components/rewards/WalletSummaryWidget'
import Link from 'next/link'

export default async function TasterDashboardPage() {
  const supabase = await createClient()
  const claims = await requireTaster(supabase)

  // Fetch Taster Wallet Stats
  const { data: wallet } = await supabase
    .schema('community')
    .from('taster_wallet')
    .select('*')
    .eq('taster_id', claims.sub)
    .single()

  // Fetch Available Vouchers Count
  const { count: availableVouchers } = await supabase
    .schema('rewards')
    .from('vouchers')
    .select('*', { count: 'exact', head: true })
    .eq('bearer_id', claims.sub)
    .eq('status', 'available')

  // Fetch Vote Queue Count
  // First, get all pending qa_runs
  const { data: pendingRuns } = await supabase
    .schema('trust')
    .from('qa_runs')
    .select('id, listing_id')
    .eq('overall_result', 'pending')

  // Then, get runs the taster has already voted on
  const { data: votedRunIds } = await supabase
    .schema('community')
    .from('taste_votes')
    .select('qa_run_id')
    .eq('taster_id', claims.sub)

  const votedIds = new Set(votedRunIds?.map(v => v.qa_run_id) || [])
  const queueCount = pendingRuns?.filter(run => !votedIds.has(run.id)).length || 0

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Taster Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, {claims.email}. Martie appreciates your refined palate.</p>
      </div>

      <TasterStatusBanner 
        voteCount={wallet?.vote_count || 0}
        reputationScore={Number(wallet?.reputation_score || 0)}
        status={wallet?.status || 'active'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vote Queue Widget */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Taste Test Queue</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">{queueCount}</p>
              <p className="text-sm text-gray-500">Listings Awaiting Your Vote</p>
            </div>
            <Link 
              href="/dashboard/taster/vote"
              className="py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
            >
              Start Voting
            </Link>
          </div>
        </div>

        <WalletSummaryWidget availableCount={availableVouchers || 0} />
      </div>

      {/* Quick Links / Recent Activity could go here */}
    </div>
  )
}
