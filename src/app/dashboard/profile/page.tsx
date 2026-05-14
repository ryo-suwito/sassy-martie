import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { updateProfile } from '@/actions/builder/update-profile'
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
      
      <form action={updateProfile} className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input name="display_name" defaultValue={profile.display_name || ''} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username (Immutable)</label>
            <input name="username" defaultValue={profile.username} disabled className="w-full border rounded p-2 bg-gray-50 text-gray-500" />
            <input type="hidden" name="username" value={profile.username} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea name="bio" defaultValue={profile.bio || ''} rows={4} className="w-full border rounded p-2" maxLength={300} placeholder="Tell us about yourself..." />
          <p className="text-xs text-gray-400 mt-1">Max 300 characters.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input name="website_url" type="url" defaultValue={profile.website_url || ''} className="w-full border rounded p-2" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Twitter Handle</label>
            <input name="twitter_handle" defaultValue={profile.twitter_handle || ''} className="w-full border rounded p-2" placeholder="@username" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input name="avatar_url" type="url" defaultValue={profile.avatar_url || ''} className="w-full border rounded p-2" placeholder="https://..." />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  )
}
