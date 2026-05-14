'use client'

interface RedemptionResultModalProps {
  isOpen: boolean
  onClose: () => void
  type: string
  result: Record<string, unknown> | null
}

export function RedemptionResultModal({ isOpen, onClose, type, result }: RedemptionResultModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-gray-900">Reward Activated!</h2>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          {type === 'external_code' ? (
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 text-center">Your One-Time Code</p>
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <code className="text-2xl font-mono font-bold text-gray-900 flex-1 text-center">
                  {(result?.code as string) || 'ERROR'}
                </code>
              </div>
              <p className="mt-4 text-xs text-red-600 font-medium text-center">
                ⚠️ Write this down! It will not be shown again.
              </p>
            </div>
          ) : type === 'manual_fulfillment' ? (
            <p className="text-gray-700 text-center">
              Martie has been notified. Check your email in 24-48 hours for your reward details.
            </p>
          ) : (
            <p className="text-gray-700 text-center">
              Your reward has been applied successfully. Enjoy the new perks!
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  )
}
