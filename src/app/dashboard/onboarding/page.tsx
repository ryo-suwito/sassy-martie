import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingStep } from '@/components/builder/OnboardingStep'
import { claimUsername } from '@/actions/builder/claim-username'
import Link from 'next/link'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) redirect('/auth/login')

  const { data: profile } = await supabase
    .schema('builder')
    .from('lister_profiles')
    .select('*')
    .eq('id', claims.sub)
    .single()

  // Step 1: Claim username
  if (!profile || !profile.username || profile.username.startsWith('user-')) {
    return (
      <OnboardingStep 
        step={1} totalSteps={3} 
        title="Claim Your Identity" 
        description="Pick a username that builders will recognize. This is your brand."
      >
        <form action={claimUsername} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">sassymartie.com/</span>
              <input name="username" required className="flex-1 border rounded p-2" placeholder="your-name" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 font-medium">
            Claim Username
          </button>
        </form>
      </OnboardingStep>
    )
  }

  // Check if they have any listings
  const { count } = await supabase
    .schema('catalog')
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('lister_id', claims.sub)

  // Step 2: Submit first tool
  if (count === 0) {
    return (
      <OnboardingStep 
        step={2} totalSteps={3} 
        title="Your First Tool" 
        description="Time to show the world what you've built. Submit your first listing."
      >
        <div className="text-center space-y-6">
          <div className="p-8 border-2 border-dashed rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-2">No tools listed yet</h3>
            <p className="text-gray-500 mb-6">Builders with live tools get 5x more profile views.</p>
            <Link 
              href="/dashboard/listings/new" 
              className="inline-block bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Your First Tool
            </Link>
          </div>
        </div>
      </OnboardingStep>
    )
  }

  // Step 3: Pending state
  return (
    <OnboardingStep 
      step={3} totalSteps={3} 
      title="Verification in Progress" 
      description="Martie is reviewing your first submission. We hold high standards to build high trust."
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h3 className="text-xl font-bold">You&apos;re all set!</h3>
        <p className="text-gray-600">
          We&apos;ve received your submission. Our team (and Martie) will review it within 48 hours. 
          In the meantime, you can polish your profile.
        </p>
        <Link 
          href="/dashboard/listings" 
          className="inline-block border border-gray-300 rounded-lg px-6 py-2 font-medium hover:bg-gray-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </OnboardingStep>
  )
}
