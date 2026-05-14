import React from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireAnyRole } from '@/lib/auth/guards'

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  await requireAnyRole(supabase, ['backoffice_admin', 'backoffice_reviewer'])

  const navItems = [
    { label: 'Work Queue', href: '/backoffice/queue' },
    { label: 'Listings', href: '/backoffice/listings' },
    { label: 'Builders', href: '/backoffice/builders' },
    { label: 'QA Runs', href: '/backoffice/qa/runs' },
    { label: 'Tasters', href: '/backoffice/tasters' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/backoffice" className="text-xl font-bold text-indigo-600">
                  Martie Admin
                </Link>
              </div>
              <nav className="ml-8 flex space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
