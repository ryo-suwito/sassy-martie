import { createClient } from '@/utils/supabase/server'
import { requireTaster } from '@/lib/auth/guards'
import { WalletView } from '@/components/rewards/WalletView'

export default async function WalletPage() {
  const supabase = await createClient()
  const claims = await requireTaster(supabase)

  const { data: vouchers } = await supabase
    .schema('rewards')
    .from('voucher_wallet')
    .select('*')
    .eq('bearer_id', claims.sub)
    .order('issued_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Your Rewards</h1>
        <p className="text-gray-500 mt-2">
          Your contributions to the community earn you exclusive rewards. 
          Redeem them here for features, access, and partner deals.
        </p>
      </div>

      <WalletView vouchers={vouchers || []} />
    </div>
  )
}
