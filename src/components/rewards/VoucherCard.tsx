import Link from 'next/link'

interface VoucherCardProps {
  voucher: {
    id: string
    display_name: string
    description: string
    status: string
    expires_at: string | null
    is_redeemable: boolean
  }
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const isRedeemed = voucher.status === 'redeemed'
  
  return (
    <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${
      voucher.is_redeemable ? 'border-gray-200 hover:shadow-md' : 'border-gray-100 opacity-75'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{voucher.display_name}</h3>
          <p className="text-gray-500 text-sm mt-1">{voucher.description}</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          voucher.status === 'available' ? 'bg-green-100 text-green-800' :
          voucher.status === 'redeemed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {voucher.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="text-xs text-gray-400">
          {voucher.expires_at ? (
            <span>Expires: {new Date(voucher.expires_at).toLocaleDateString()}</span>
          ) : (
            <span>No Expiry</span>
          )}
        </div>
        
        {voucher.is_redeemable && (
          <Link 
            href={`/dashboard/taster/redeem/${voucher.id}`}
            className="py-2 px-6 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
          >
            Redeem
          </Link>
        )}
        
        {isRedeemed && (
          <span className="text-sm font-medium text-blue-600">✓ Claimed</span>
        )}
      </div>
    </div>
  )
}
