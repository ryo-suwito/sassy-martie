import { SubmissionWizard } from '@/components/builder/SubmissionWizard'

export default function NewListingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Submit a New Tool</h1>
      <SubmissionWizard />
    </div>
  )
}
