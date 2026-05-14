interface TasterStatusBannerProps {
  voteCount: number
  reputationScore: number
  status: string
}

export function TasterStatusBanner({ voteCount, reputationScore, status }: TasterStatusBannerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Taster Status</h2>
        <div className="mt-1 flex items-center">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="flex gap-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Votes Cast</h2>
          <p className="mt-1 text-2xl font-bold text-gray-900">{voteCount}</p>
        </div>
        
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reputation</h2>
          <p className="mt-1 text-2xl font-bold text-gray-900">{reputationScore}</p>
        </div>
      </div>
    </div>
  )
}
