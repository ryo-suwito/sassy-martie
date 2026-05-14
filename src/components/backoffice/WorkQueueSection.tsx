import React from 'react'

interface WorkQueueSectionProps {
  title: string
  count: number
  children: React.ReactNode
}

export function WorkQueueSection({ title, count, children }: WorkQueueSectionProps) {
  if (count === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  )
}
