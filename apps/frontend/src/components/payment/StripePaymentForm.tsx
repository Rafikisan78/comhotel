'use client'

import { useState } from 'react'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#9ca3af' },
      backgroundColor: '#eff6ff',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
}

interface CheckoutFormProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

function CheckoutForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  loading,
  setLoading,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [saveCard, setSaveCard] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setLoading(true)
    setCardError(null)

    try {
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
        ...(saveCard && { setup_future_usage: 'on_session' }),
      })

      if (error) {
        const msg = error.message || 'Erreur lors du paiement'
        setCardError(msg)
        onError(msg)
        setLoading(false)
      } else {
        onSuccess()
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur inattendue'
      setCardError(msg)
      onError(msg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💳</span> Paiement sécurisé
        </h3>

        {/* Champs CB : numéro, expiration, CVC */}
        <div className="rounded-md border border-gray-300 bg-blue-50 px-4 py-3 focus-within:border-blue-500 transition">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) =>
              setCardError(e.error ? e.error.message : null)
            }
          />
        </div>

        {cardError && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span>⚠️</span> {cardError}
          </p>
        )}

        {/* Case à cocher : sauvegarder la carte */}
        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition">
            Sauvegarder ma carte pour mes prochaines réservations
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Paiement en cours...
          </span>
        ) : (
          `Payer ${amount.toFixed(2)} €`
        )}
      </button>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <span>🔒</span> Paiement sécurisé par Stripe — vos données bancaires ne transitent pas par nos serveurs
      </p>
    </form>
  )
}

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [loading, setLoading] = useState(false)

  if (!clientSecret) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-gray-500 mt-2">
          Initialisation du paiement...
        </p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            borderRadius: '8px',
            colorBackground: '#eff6ff',
          },
        },
        locale: 'fr',
      }}
    >
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  )
}
