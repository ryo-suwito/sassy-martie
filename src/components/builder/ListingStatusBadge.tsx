import { ListingStatus } from '@/types/catalog'

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const config: Record<ListingStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    pending_review: { label: 'Pending Review', className: 'bg-blue-100 text-blue-800' },
    live: { label: 'Live', className: 'bg-green-100 text-green-800' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800' },
  }

  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
