import { ReactNode } from 'react'

interface OnboardingStepProps {
  step: number
  totalSteps: number
  title: string
  description: string
  children: ReactNode
}

export function OnboardingStep({ step, totalSteps, title, description, children }: OnboardingStepProps) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Step {step} of {totalSteps}</span>
          <span className="text-sm font-medium text-blue-600">{title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}
