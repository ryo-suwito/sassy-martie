import { Listing } from '@/types/catalog'
import { ListingStatusBadge } from './ListingStatusBadge'
import Link from 'next/link'
import { Edit3, Eye } from 'lucide-react'

export function DraftCard({ listing }: { listing: Listing }) {
  const isDraft = listing.status === 'draft'

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{listing.name}</h3>
        <ListingStatusBadge status={listing.status} />
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{listing.tagline}</p>
      
      <div className="flex gap-2 mt-auto">
        {isDraft ? (
          <Link
            href={`/dashboard/listings/${listing.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <Edit3 size={16} />
            Continue Draft
          </Link>
        ) : (
          <Link
            href={`/dashboard/listings/${listing.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            <Eye size={16} />
            View Details
          </Link>
        )}
      </div>
    </div>
  )
}
