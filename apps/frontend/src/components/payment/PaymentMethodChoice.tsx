'use client'

interface PaymentMethodChoiceProps {
  onChooseStripe: () => void
  onChooseOnSite: () => void
  loading: boolean
  disabled: boolean
}

export default function PaymentMethodChoice({
  onChooseStripe,
  onChooseOnSite,
  loading,
  disabled,
}: PaymentMethodChoiceProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-center">
        Comment souhaitez-vous payer ?
      </h3>

      <button
        type="button"
        onClick={onChooseStripe}
        disabled={loading || disabled}
        className="w-full flex items-center gap-3 px-4 py-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-2xl">💳</span>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900">Payer en ligne</p>
          <p className="text-sm text-gray-500">Paiement sécurisé par carte bancaire via Stripe</p>
        </div>
        <span className="text-blue-500 text-sm font-medium">Recommandé</span>
      </button>

      <button
        type="button"
        onClick={onChooseOnSite}
        disabled={loading || disabled}
        className="w-full flex items-center gap-3 px-4 py-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-2xl">🏨</span>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900">Payer sur place</p>
          <p className="text-sm text-gray-500">Réglez à votre arrivée à l'hôtel</p>
        </div>
      </button>

      {loading && (
        <p className="text-center text-sm text-gray-500">Chargement...</p>
      )}
    </div>
  )
}
