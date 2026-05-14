'use client'

import { useState, useActionState } from 'react'
import { OnboardingStep } from './OnboardingStep'
import { saveDraft } from '@/actions/builder/save-draft'
import { submitListing } from '@/actions/builder/submit-listing'
import { Listing } from '@/types/catalog'
import { useRouter } from 'next/navigation'

interface SubmissionWizardProps {
  initialListing?: Listing & { media?: { url: string; type: string }[] }
}

type ActionState = { 
  error?: string; 
  success?: boolean; 
  id?: string; 
  fieldErrors?: Record<string, string[]> 
} | null;

export function SubmissionWizard({ initialListing }: SubmissionWizardProps) {
  const [step, setStep] = useState(1)
  const [listingId, setListingId] = useState<string | undefined>(initialListing?.id)
  const router = useRouter()

  const [saveState, saveAction, isPending] = useActionState(
    saveDraft as (state: ActionState, payload: FormData) => Promise<ActionState>, 
    null as ActionState
  )
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitListing as (state: ActionState, payload: FormData) => Promise<ActionState>, 
    null as ActionState
  )

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSave = async (formData: FormData) => {
    if (listingId) formData.append('id', listingId)
    await saveAction(formData)
    nextStep()
  }

  // Update listingId if save succeeds
  if (saveState?.success && saveState.id && saveState.id !== listingId) {
    setListingId(saveState.id)
  }

  if (submitState?.success) {
    router.push('/dashboard/listings')
  }

  return (
    <div>
      {step === 1 && (
        <OnboardingStep 
          step={1} totalSteps={4} 
          title="Tool Identity" 
          description="Tell us about your tool. Martie loves details."
        >
          <form action={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tool Name</label>
              <input name="name" defaultValue={initialListing?.name} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline (Max 160 chars)</label>
              <input name="tagline" defaultValue={initialListing?.tagline} required maxLength={160} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">External URL</label>
              <input name="external_url" type="url" defaultValue={initialListing?.external_url} required className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL identifier)</label>
              <input name="slug" defaultValue={initialListing?.slug} required className="w-full border rounded p-2" />
            </div>
            <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white rounded p-2 font-medium">
              {isPending ? 'Saving...' : 'Next: Pricing & Audience'}
            </button>
          </form>
        </OnboardingStep>
      )}

      {step === 2 && (
        <OnboardingStep 
          step={2} totalSteps={4} 
          title="Pricing & Audience" 
          description="Who is this for and how much does it cost?"
        >
          <form action={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pricing Model</label>
              <select name="pricing_model" defaultValue={initialListing?.pricing_model} className="w-full border rounded p-2">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="freemium">Freemium</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <textarea name="target_audience_description" defaultValue={initialListing?.target_audience_description || ''} className="w-full border rounded p-2" rows={3} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={prevStep} className="flex-1 border rounded p-2">Back</button>
              <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 text-white rounded p-2 font-medium">
                {isPending ? 'Saving...' : 'Next: Media'}
              </button>
            </div>
          </form>
        </OnboardingStep>
      )}

      {step === 3 && (
        <OnboardingStep 
          step={3} totalSteps={4} 
          title="Media & Screenshots" 
          description="Show off your tool's best side."
        >
          <form action={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Screenshot URL</label>
              <input name="media.0.url" type="url" defaultValue={initialListing?.media?.[0]?.url} className="w-full border rounded p-2" />
              <input type="hidden" name="media.0.type" value="screenshot" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={prevStep} className="flex-1 border rounded p-2">Back</button>
              <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 text-white rounded p-2 font-medium">
                {isPending ? 'Saving...' : 'Next: Review'}
              </button>
            </div>
          </form>
        </OnboardingStep>
      )}

      {step === 4 && (
        <OnboardingStep 
          step={4} totalSteps={4} 
          title="Review & Submit" 
          description="Double check everything before Martie takes a look."
        >
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500">Identity</p>
              <p className="font-medium">{initialListing?.name || 'Incomplete'}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500">Pricing</p>
              <p className="font-medium capitalize">{initialListing?.pricing_model || 'Incomplete'}</p>
            </div>
            
            {(saveState?.error || submitState?.error) && (
              <p className="text-red-600 text-sm font-medium">{saveState?.error || submitState?.error}</p>
            )}

            <div className="flex gap-2 pt-4">
              <button type="button" onClick={prevStep} className="flex-1 border rounded p-2">Back</button>
              <form action={async (formData) => {
                if (listingId) formData.append('id', listingId)
                await submitAction(formData)
              }} className="flex-1">
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white rounded p-2 font-medium">
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </form>
            </div>
          </div>
        </OnboardingStep>
      )}
    </div>
  )
}
