'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/actions/builder/update-profile'
import { ListerProfile } from '@/types/builder'

export function ProfileForm({ profile }: { profile: ListerProfile }) {
  const [state, action, isPending] = useActionState(updateProfile, null)

  return (
    <form action={action} className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input 
            name="display_name" 
            defaultValue={profile.display_name || ''} 
            className="w-full border rounded p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username (Immutable)</label>
          <input 
            name="username" 
            defaultValue={profile.username} 
            disabled 
            className="w-full border rounded p-2 bg-gray-50 text-gray-500" 
          />
          <input type="hidden" name="username" value={profile.username} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea 
          name="bio" 
          defaultValue={profile.bio || ''} 
          rows={4} 
          className="w-full border rounded p-2" 
          maxLength={300} 
          placeholder="Tell us about yourself..." 
        />
        <p className="text-xs text-gray-400 mt-1">Max 300 characters.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input 
            name="website_url" 
            type="url" 
            defaultValue={profile.website_url || ''} 
            className="w-full border rounded p-2" 
            placeholder="https://..." 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Twitter Handle</label>
          <input 
            name="twitter_handle" 
            defaultValue={profile.twitter_handle || ''} 
            className="w-full border rounded p-2" 
            placeholder="@username" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Avatar URL</label>
        <input 
          name="avatar_url" 
          type="url" 
          defaultValue={profile.avatar_url || ''} 
          className="w-full border rounded p-2" 
          placeholder="https://..." 
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 font-medium">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 font-medium">Profile updated successfully!</p>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
