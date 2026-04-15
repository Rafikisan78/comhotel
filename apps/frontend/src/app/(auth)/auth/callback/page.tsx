'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (token && userId && role) {
      // Stocker les informations d'authentification
      localStorage.setItem('access_token', token)
      localStorage.setItem('user_id', userId)
      localStorage.setItem('user_role', role)

      // Rediriger vers le profil
      router.push('/profile')
    } else {
      setError('Erreur lors de la connexion avec Google. Veuillez réessayer.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }, [searchParams, router])

  if (error) {
    return (
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">!</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion en cours...</h2>
      <p className="text-gray-600">Veuillez patienter pendant que nous vous connectons.</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center py-12 px-4">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chargement...</h2>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  )
}
