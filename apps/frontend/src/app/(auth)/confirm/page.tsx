'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import apiClient from '@/lib/api-client'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Récupérer les paramètres de l'URL de confirmation Supabase
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type') || 'signup'

        if (!token_hash) {
          setStatus('error')
          setMessage('Lien de confirmation invalide. Paramètre token_hash manquant.')
          return
        }

        // Appeler l'API backend pour vérifier l'email
        const response = await apiClient.post('/auth/email/verify', {
          token_hash,
          type,
        })

        if (response.data && response.data.user) {
          setStatus('success')
          setMessage('Votre email a été confirmé avec succès ! Vous pouvez maintenant vous connecter.')

          // Rediriger vers la page de login après 3 secondes
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage('Une erreur est survenue lors de la confirmation de votre email.')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')

        if (error.response?.status === 400) {
          setMessage('Le lien de confirmation est invalide ou a expiré.')
        } else if (error.response?.status === 422) {
          setMessage('Email déjà confirmé.')
        } else {
          setMessage('Une erreur est survenue. Veuillez réessayer.')
        }
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Confirmation en cours...</h2>
            <p className="text-gray-600">Veuillez patienter pendant que nous confirmons votre email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email confirmé !</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirection vers la page de connexion dans 3 secondes...</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
            >
              Se connecter maintenant
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur de confirmation</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Aller à la page de connexion
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Créer un nouveau compte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
