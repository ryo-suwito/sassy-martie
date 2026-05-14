import Link from 'next/link'

export default function TasterConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6 text-primary">Application Received!</h1>
      <p className="text-xl mb-12">
        Martie has received your application to join the Taster Committee. 
        We&apos;ll review your motivation and get back to you soon.
      </p>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          In the meantime, feel free to keep exploring our catalog.
        </p>
        <Link 
          href="/dashboard"
          className="inline-block py-3 px-8 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
