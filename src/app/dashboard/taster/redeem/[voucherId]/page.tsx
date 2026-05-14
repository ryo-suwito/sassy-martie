'use client'

import { useState, useEffect, use } from 'react'
import { redeemVoucher } from '@/actions/rewards/redeem-voucher'
import Link from 'next/link'

export default function RedeemPage({ params }: { params: Promise<{ voucherId: string }> }) {
  const { voucherId } = use(params)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<{ type: string; result: Record<string, unknown> | null } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function performRedemption() {
      const res = await redeemVoucher(voucherId)
      if (res.error) {
        setStatus('error')
        setError(res.error)
      } else {
        setStatus('success')
        setResult({ type: res.type as string, result: res.result })
      }
    }
    performRedemption()
  }, [voucherId])

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold">Redeeming your reward...</h1>
        <p className="text-gray-500 mt-2">Martie is making the arrangements.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-red-600">Redemption Failed</h1>
        <p className="text-lg mt-4 text-gray-700">{error}</p>
        <div className="mt-8">
          <Link 
            href="/dashboard/taster/wallet"
            className="py-2 px-6 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
          >
            Back to Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center">
      <div className="text-5xl mb-6">✨</div>
      <h1 className="text-3xl font-bold text-primary mb-4">Reward Activated!</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm my-8 text-left">
        {result && result.type === 'external_code' ? (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Your One-Time Code</p>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <code className="text-2xl font-mono font-bold text-gray-900 flex-1">
                {(result.result?.code as string) || 'ERROR_NO_CODE'}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText((result.result?.code as string) || '')
                  alert('Code copied to clipboard!')
                }}
                className="text-xs bg-white border border-gray-300 py-1 px-2 rounded hover:bg-gray-50"
              >
                Copy
              </button>
            </div>
            <p className="mt-4 text-sm text-red-600 font-medium">
              ⚠️ Write this down! This code is shown once and will not be displayed again.
            </p>
          </div>
        ) : result && result.type === 'manual_fulfillment' ? (
          <div>
            <p className="text-lg text-gray-800">
              Martie has been notified! Your reward requires manual fulfillment. 
              Check your email in the next 24-48 hours.
            </p>
            <p className="mt-2 text-sm text-gray-500">Task ID: {result.result?.task_id as string}</p>
          </div>
        ) : result ? (
          <div>
            <p className="text-lg text-gray-800">
              Your reward has been applied to your account. Enjoy!
            </p>
          </div>
        ) : null}
      </div>

      <Link 
        href="/dashboard/taster/wallet"
        className="inline-block py-3 px-8 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
      >
        Return to Wallet
      </Link>
    </div>
  )
}
