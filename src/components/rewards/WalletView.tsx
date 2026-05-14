import { VoucherCard } from './VoucherCard'

interface WalletViewProps {
  vouchers: {
    id: string
    display_name: string
    description: string
    status: string
    expires_at: string | null
    is_redeemable: boolean
  }[]
}

export function WalletView({ vouchers }: WalletViewProps) {
  const available = vouchers.filter(v => v.status === 'available')
  const redeemed = vouchers.filter(v => v.status === 'redeemed')
  const others = vouchers.filter(v => v.status !== 'available' && v.status !== 'redeemed')

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Available Rewards <span className="bg-primary text-white text-sm px-2 py-0.5 rounded-full">{available.length}</span>
        </h2>
        {available.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {available.map(v => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic py-8 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-200">
            No vouchers available right now. Keep voting to earn more!
          </div>
        )}
      </section>

      {redeemed.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-700">Redeemed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {redeemed.map(v => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-700">Past Vouchers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {others.map(v => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
