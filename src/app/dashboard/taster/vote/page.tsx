import { createClient } from '@/utils/supabase/server'
import { requireTaster } from '@/lib/auth/guards'
import { VoteCard } from '@/components/community/VoteCard'
import { VoteQueueEmpty } from '@/components/community/VoteQueueEmpty'

export default async function VoteQueuePage() {
  const supabase = await createClient()
  const claims = await requireTaster(supabase)

  // Fetch pending qa_runs with listing info
  const { data: pendingRuns } = await supabase
    .schema('trust')
    .from('qa_runs')
    .select(`
      id,
      listing_id
    `)
    .eq('overall_result', 'pending')

  // Fetch listing details from catalog schema
  const { data: listings } = await supabase
    .schema('catalog')
    .from('listings')
    .select('id, name, tagline')
    .in('id', pendingRuns?.map(r => r.listing_id) || [])

  // Fetch runs the taster has already voted on
  const { data: votedRunIds } = await supabase
    .schema('community')
    .from('taste_votes')
    .select('qa_run_id')
    .eq('taster_id', claims.sub)

  const votedIds = new Set(votedRunIds?.map(v => v.qa_run_id) || [])
  
  const listingMap = new Map(listings?.map(l => [l.id, l]) || [])
  
  const queue = pendingRuns?.filter(run => !votedIds.has(run.id)).map(run => {
    const listing = listingMap.get(run.listing_id)
    return {
      id: listing?.id || '',
      name: listing?.name || 'Unknown',
      tagline: listing?.tagline || '',
      qa_run_id: run.id
    }
  }).filter(item => item.id !== '') || []

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Taste Test Queue</h1>
        <p className="text-gray-500 mt-2">
          Your honest feedback helps Martie keep the catalog pure. 
          Votes are blind until a consensus is reached.
        </p>
      </div>

      {queue.length > 0 ? (
        <div className="space-y-4">
          {queue.map(item => (
            <VoteCard key={item.qa_run_id} listing={item} />
          ))}
        </div>
      ) : (
        <VoteQueueEmpty />
      )}
    </div>
  )
}
