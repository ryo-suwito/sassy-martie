import { createClient } from '@/utils/supabase/server'
import { requireTaster } from '@/lib/auth/guards'
import { notFound, redirect } from 'next/navigation'
import VoteForm from './VoteForm'

export default async function VoteDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ listingId: string }>,
  searchParams: Promise<{ runId?: string }>
}) {
  const { listingId } = await params
  const { runId } = await searchParams
  
  if (!runId) {
    redirect('/dashboard/taster/vote')
  }

  const supabase = await createClient()
  await requireTaster(supabase)

  // Fetch listing details
  const { data: listing } = await supabase
    .schema('catalog')
    .from('listings')
    .select('id, name, tagline, external_url')
    .eq('id', listingId)
    .single()

  if (!listing) {
    notFound()
  }

  // Fetch QA run to ensure it's still pending
  const { data: run } = await supabase
    .schema('trust')
    .from('qa_runs')
    .select('id, overall_result')
    .eq('id', runId)
    .single()

  if (!run || run.overall_result !== 'pending') {
    // If it's already finished, go back to queue
    redirect('/dashboard/taster/vote')
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
        <p className="text-xl text-gray-500 mt-2">{listing.tagline}</p>
        <div className="mt-4">
          <a 
            href={listing.external_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Visit Website ↗
          </a>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Cast Your Vote</h2>
        <VoteForm listingId={listing.id} qaRunId={run.id} />
      </div>
    </div>
  )
}
