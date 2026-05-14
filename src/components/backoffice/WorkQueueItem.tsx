import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface WorkQueueItemProps {
  task_type: string
  target_id: string
  created_at: string
  description: string
}

export function WorkQueueItem({ task_type, target_id, created_at, description }: WorkQueueItemProps) {
  const getHref = () => {
    switch (task_type) {
      case 'pending_listing':
      case 'expiring_grace_period':
      case 'open_flag':
        return `/backoffice/listings/${target_id}`
      case 'pending_taster_app':
        return `/backoffice/tasters`
      case 'pending_taste_test':
        return `/backoffice/qa/runs` // Or a more specific page if we had one
      default:
        return '#'
    }
  }

  const getBadgeColor = () => {
    switch (task_type) {
      case 'expiring_grace_period':
        return 'bg-red-100 text-red-700'
      case 'open_flag':
        return 'bg-orange-100 text-orange-700'
      case 'pending_listing':
        return 'bg-blue-100 text-blue-700'
      case 'pending_taster_app':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getBadgeColor()}`}>
            {task_type.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-gray-900 font-medium">{description}</p>
      </div>
      <Link 
        href={getHref()}
        className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Action
      </Link>
    </div>
  )
}
