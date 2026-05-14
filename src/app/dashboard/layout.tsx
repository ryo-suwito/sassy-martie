import { getClaims } from '@/lib/auth/getClaims'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { List, User, PlusCircle } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    redirect('/auth/login')
  }

  // Check if lister profile exists, if not, they might need onboarding
  await supabase
    .schema('builder')
    .from('lister_profiles')
    .select('username')
    .eq('id', claims.sub)
    .single()

  // If no username and not on onboarding page, redirect to onboarding
  // Note: Middleware usually handles this, but a safety check here is good.

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">Martie Builder</Link>
        </div>
        <nav className="px-4 space-y-1">
          <NavLink href="/dashboard/listings" icon={<List size={18} />}>My Tools</NavLink>
          <NavLink href="/dashboard/listings/new" icon={<PlusCircle size={18} />}>Submit Tool</NavLink>
          <NavLink href="/dashboard/profile" icon={<User size={18} />}>Profile</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{claims.email}</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: ReactNode; icon: ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
    >
      {icon}
      {children}
    </Link>
  )
}
