import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/builder/ProfileForm'
import { ListerProfile } from '@/types/builder'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) redirect('/auth/login')

  const { data: profile } = await supabase
    .schema('builder')
    .from('lister_profiles')
    .select('*')
    .eq('id', claims.sub)
    .single()

  if (!profile) return <div>Profile not found.</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <ProfileForm profile={profile as ListerProfile} />
    </div>
  )
}
