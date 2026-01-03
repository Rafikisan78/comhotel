'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await apiClient.get(`/users/${userId}`)
      const user = response.data

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
      })
      setLoading(false)
    } catch (err: any) {
      console.error('Erreur chargement utilisateur:', err)
      setError('Impossible de charger les informations de l\'utilisateur')
      setLoading(false)

      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation côté client
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Prénom, nom et email sont requis')
      return
    }

    // Si mot de passe fourni, valider OWASP 2024
    if (formData.password && formData.password.length > 0) {
      if (formData.password.length < 12) {
        setError('Le mot de passe doit contenir au moins 12 caractères')
        return
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$/
      if (!passwordRegex.test(formData.password)) {
        setError('Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&._-+=#)')
        return
      }
    }

    setSubmitting(true)

    try {
      // Construire le body en excluant le password si vide
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      await apiClient.patch(`/users/${userId}`, updateData)

      setSuccess('Utilisateur modifié avec succès')
      setFormData(prev => ({ ...prev, password: '' })) // Vider le champ password
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (err: any) {
      console.error('Erreur mise à jour:', err)
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Modifier l'utilisateur</h1>
            <div className="flex gap-3">
              <a
                href="/admin/users"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
              >
                ← Retour à la liste
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe (optionnel)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Laisser vide pour ne pas modifier"
              />
              <p className="mt-1 text-xs text-gray-500">
                Min 12 caractères (1 maj, 1 min, 1 chiffre, 1 spécial: @$!%*?&._-+=#)
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <a
                href="/admin/users"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Annuler
              </a>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">ℹ️ Informations</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Les champs marqués d'un * sont obligatoires</li>
            <li>• Le mot de passe n'est modifié que si vous en saisissez un nouveau</li>
            <li>• L'email doit être unique dans le système</li>
            <li>• Les modifications sont appliquées immédiatement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
