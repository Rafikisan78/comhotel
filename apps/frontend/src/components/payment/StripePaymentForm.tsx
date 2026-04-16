'use client'

import { useState, useEffect } from 'react'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import apiClient from '@/lib/api-client'

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
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
  hidePostalCode: true,
}

const BRAND_ICON: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
}

interface SavedCard {
  id: string
  stripe_payment_method_id: string
  card_brand: string
  card_last4: string
  card_exp_month: number
  card_exp_year: number
  is_default: boolean
}

interface CheckoutFormProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  savedCards: SavedCard[]
  onCardSaved: () => void
}

function CheckoutForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  loading,
  setLoading,
  savedCards,
  onCardSaved,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  // 'new' | pm_xxx (ID d'une carte sauvegardée)
  const defaultCard = savedCards.find((c) => c.is_default)
  const [selectedMethod, setSelectedMethod] = useState<string>(
    defaultCard ? defaultCard.stripe_payment_method_id : 'new'
  )
  const [saveCard, setSaveCard] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const isNewCard = selectedMethod === 'new'
  const [cardReady, setCardReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe) return

    setLoading(true)
    setCardError(null)

    try {
      let error

      if (isNewCard) {
        // ── Paiement avec nouvelle carte ──────────────────────────────────
        if (!elements) return
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) return

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        })
        error = result.error

        // Sauvegarder la carte si demandé et paiement réussi
        if (!error && saveCard && result.paymentIntent?.payment_method) {
          const pmId =
            typeof result.paymentIntent.payment_method === 'string'
              ? result.paymentIntent.payment_method
              : result.paymentIntent.payment_method.id
          try {
            await apiClient.post('/payments/save-card', {
              paymentMethodId: pmId,
            })
            onCardSaved()
          } catch {
            // La sauvegarde n'est pas bloquante
          }
        }
      } else {
        // ── Paiement avec carte sauvegardée ───────────────────────────────
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedMethod,
        })
        error = result.error
      }

      if (error) {
        const msg = error.message || 'Erreur lors du paiement'
        setCardError(msg)
        onError(msg)
        setLoading(false)
      } else {
        onSuccess()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue'
      setCardError(msg)
      onError(msg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>💳</span> Paiement sécurisé
        </h3>

        {/* ── Cartes sauvegardées ── */}
        {savedCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Mes cartes</p>
            {savedCards.map((card) => (
              <label
                key={card.stripe_payment_method_id}
                className={`flex items-center justify-between gap-3 p-3 rounded-md border cursor-pointer transition ${
                  selectedMethod === card.stripe_payment_method_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={card.stripe_payment_method_id}
                    checked={selectedMethod === card.stripe_payment_method_id}
                    onChange={() =>
                      setSelectedMethod(card.stripe_payment_method_id)
                    }
                    className="text-blue-600"
                  />
                  <span className="text-lg">
                    {BRAND_ICON[card.card_brand] ?? '💳'}
                  </span>
                  <span className="text-sm text-gray-800">
                    <span className="capitalize">{card.card_brand}</span>
                    {' '}•••• {card.card_last4}
                    <span className="text-gray-400 ml-2 text-xs">
                      {String(card.card_exp_month).padStart(2, '0')}/
                      {String(card.card_exp_year).slice(-2)}
                    </span>
                  </span>
                </div>
                {card.is_default && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Défaut
                  </span>
                )}
              </label>
            ))}

            {/* Option "Nouvelle carte" */}
            <label
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition ${
                selectedMethod === 'new'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="new"
                checked={selectedMethod === 'new'}
                onChange={() => setSelectedMethod('new')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">
                + Utiliser une nouvelle carte
              </span>
            </label>
          </div>
        )}

        {/* ── Formulaire nouvelle carte ── */}
        {isNewCard && (
          <div className="space-y-3 pt-1">
            <div className="rounded-md border border-gray-300 bg-blue-50 px-4 py-3 focus-within:border-blue-500 transition">
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onReady={() => setCardReady(true)}
                onChange={(e) =>
                  setCardError(e.error ? e.error.message : null)
                }
              />
            </div>

            {/* Case à cocher sauvegarde */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
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
        )}

        {cardError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span> {cardError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || (isNewCard && !cardReady)}
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
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])

  const fetchSavedCards = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return
      const res = await apiClient.get('/payments/saved-cards')
      setSavedCards(res.data || [])
    } catch {
      // Non bloquant — l'utilisateur peut toujours entrer une nouvelle carte
    }
  }

  useEffect(() => {
    fetchSavedCards()
  }, [])

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
        // Ne pas passer clientSecret ici : CardElement ne fonctionne pas
        // en "Payment Intent mode". Le clientSecret est passé directement
        // à confirmCardPayment() dans le formulaire.
        locale: 'fr',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            borderRadius: '8px',
            colorBackground: '#eff6ff',
          },
        },
      }}
    >
      <CheckoutForm
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        setLoading={setLoading}
        savedCards={savedCards}
        onCardSaved={fetchSavedCards}
      />
    </Elements>
  )
}
