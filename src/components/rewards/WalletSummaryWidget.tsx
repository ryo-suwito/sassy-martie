import Link from 'next/link'

interface WalletSummaryWidgetProps {
  availableCount: number
}

export function WalletSummaryWidget({ availableCount }: WalletSummaryWidgetProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Voucher Wallet</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-primary">{availableCount}</p>
          <p className="text-sm text-gray-500">Available Vouchers</p>
        </div>
        <Link 
          href="/dashboard/taster/wallet"
          className="py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          View Wallet
        </Link>
      </div>
    </div>
  )
}
