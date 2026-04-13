'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

interface CheckoutFormProps {
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

function CheckoutForm({ amount, onSuccess, onError, loading, setLoading }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || 'Erreur lors du paiement')
        setLoading(false)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      onError(err.message || 'Erreur inattendue')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>💳</span> Paiement sécurisé
        </h3>
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading || !ready}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Paiement en cours...
          </span>
        ) : (
          `Payer ${amount.toFixed(2)}€`
        )}
      </button>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <span>🔒</span> Paiement sécurisé par Stripe — Vos données bancaires ne transitent pas par nos serveurs
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
        <p className="text-sm text-gray-500 mt-2">Initialisation du paiement...</p>
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
          },
        },
        locale: 'fr',
      }}
    >
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  )
}
