import Link from 'next/link'

interface VoteCardProps {
  listing: {
    id: string
    name: string
    tagline: string
    qa_run_id: string
  }
}

export function VoteCard({ listing }: VoteCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{listing.name}</h3>
        <p className="text-gray-500">{listing.tagline}</p>
      </div>
      
      <Link 
        href={`/dashboard/taster/vote/${listing.id}?runId=${listing.qa_run_id}`}
        className="inline-block py-2 px-6 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-colors text-center"
      >
        Vote Now
      </Link>
    </div>
  )
}
