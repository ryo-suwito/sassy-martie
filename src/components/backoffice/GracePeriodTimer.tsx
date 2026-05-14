'use client'

import React, { useEffect, useState } from 'react'
import { formatDistanceToNow, isAfter } from 'date-fns'

interface GracePeriodTimerProps {
  deadline: string
}

export function GracePeriodTimer({ deadline }: GracePeriodTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const target = new Date(deadline)
    
    const update = () => {
      const expired = isAfter(new Date(), target)
      setIsExpired(expired)
      if (expired) {
        setTimeLeft('EXPIRED')
      } else {
        setTimeLeft(formatDistanceToNow(target, { addSuffix: true }))
      }
    }

    update()
    const interval = setInterval(update, 1000 * 60) // Update every minute
    return () => clearInterval(interval)
  }, [deadline])

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between ${
      isExpired ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider">Grace Period</p>
        <p className="text-sm font-medium">Expires {timeLeft}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Deadline</p>
        <p className="text-sm font-mono">{new Date(deadline).toLocaleString()}</p>
      </div>
    </div>
  )
}
