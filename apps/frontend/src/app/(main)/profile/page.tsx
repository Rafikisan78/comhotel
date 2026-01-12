'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        router.push('/login')
        return
      }

      const response = await apiClient.get('/users/me')
      const userData = response.data

      // Stocker l'ID utilisateur si pas déjà fait
      localStorage.setItem('user_id', userData.id)

      setUser(userData)
      setFirstName(userData.firstName)
      setLastName(userData.lastName)
      setEmail(userData.email)
      setPhone(userData.phone || '')
      setLoading(false)
    } catch (err: any) {
      console.error('Erreur chargement profil:', err)
      setError('Impossible de charger le profil')
      setLoading(false)

      if (err.response?.status === 401) {
        router.push('/login')
      }
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation password
    if (password && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setUpdating(true)

    try {
      const updateData: any = {}

      // Only send changed fields
      if (firstName !== user?.firstName) updateData.firstName = firstName
      if (lastName !== user?.lastName) updateData.lastName = lastName
      if (email !== user?.email) updateData.email = email
      if (phone !== user?.phone) updateData.phone = phone
      if (password) updateData.password = password

      if (Object.keys(updateData).length === 0) {
        setError('Aucune modification détectée')
        setUpdating(false)
        return
      }

      const response = await apiClient.patch('/users/me', updateData)

      setUser(response.data)
      setSuccess('Profil mis à jour avec succès !')
      setPassword('')
      setConfirmPassword('')

      // Update email in form if changed
      setEmail(response.data.email)
      setFirstName(response.data.firstName)
      setLastName(response.data.lastName)
      setPhone(response.data.phone || '')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Erreur mise à jour:', err)
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            <div className="flex gap-3">
              <a
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
              >
                Accueil
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin/users"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Gérer les utilisateurs
                </a>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* User info card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Rôle: {user?.role}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Membre depuis</p>
              <p className="font-medium">{new Date(user?.createdAt || '').toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              ✓ {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              ✗ {error}
            </div>
          )}

          {/* Update form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone (optionnel)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Modifier le mot de passe (optionnel)
              </h3>

              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  {password && password.length < 8 && (
                    <p className="mt-1 text-xs text-red-600">Minimum 8 caractères requis</p>
                  )}
                </div>

                {/* Confirm Password */}
                {password && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le nouveau mot de passe"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {updating ? 'Mise à jour en cours...' : 'Mettre à jour le profil'}
              </button>
            </div>
          </form>
        </div>

        {/* Additional info */}
        <div className="text-center text-sm text-gray-500">
          <p>Dernière mise à jour: {new Date(user?.updatedAt || '').toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}
