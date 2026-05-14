import Link from 'next/link'

export function VoteQueueEmpty() {
  return (
    <div className="text-center py-20 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <div className="text-5xl mb-6">🏜️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">The Queue is Empty!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        You&apos;ve caught up on all pending taste tests. Martie is impressed! 
        Check back later when new tools arrive for inspection.
      </p>
      <Link 
        href="/dashboard/taster"
        className="inline-block py-2 px-6 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
