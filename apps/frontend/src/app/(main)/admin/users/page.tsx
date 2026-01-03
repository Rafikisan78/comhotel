'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deletedBy?: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'deleted'>('active')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      // Charger tous les utilisateurs (y compris supprimés)
      const response = await apiClient.get('/users/admin/all')
      setUsers(response.data)
      setLoading(false)
    } catch (err: any) {
      console.error('Erreur chargement utilisateurs:', err)
      setError('Impossible de charger les utilisateurs')
      setLoading(false)

      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/profile')
      }
    }
  }

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      await apiClient.delete(`/users/${userToDelete.id}`)
      setSuccess(`Utilisateur ${userToDelete.firstName} ${userToDelete.lastName} supprimé avec succès`)
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
      setShowDeleteConfirm(false)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleRestoreUser = async (user: User) => {
    try {
      await apiClient.post(`/users/${user.id}/restore`)
      setSuccess(`Utilisateur ${user.firstName} ${user.lastName} restauré avec succès`)
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la restauration')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const idsToDelete = Array.from(selectedUsers)
      const response = await apiClient.delete('/users/bulk/delete', {
        data: { ids: idsToDelete }
      })

      setSuccess(`${response.data.deleted} utilisateur(s) supprimé(s) avec succès`)
      if (response.data.errors.length > 0) {
        setError(`Erreurs: ${response.data.errors.join(', ')}`)
      }

      setShowBulkDeleteConfirm(false)
      setSelectedUsers(new Set())
      loadUsers()
      setTimeout(() => { setSuccess(''); setError('') }, 5000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression multiple')
      setShowBulkDeleteConfirm(false)
      setTimeout(() => setError(''), 5000)
    }
  }

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      const allIds = new Set(filteredUsers.map(u => u.id))
      setSelectedUsers(allIds)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'active') return !user.deletedAt
    if (filter === 'deleted') return !!user.deletedAt
    return true // 'all'
  })

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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs (Admin)</h1>
            <div className="flex gap-3">
              <a
                href="/profile"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
              >
                Mon profil
              </a>
              <a
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            ✗ {error}
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Actifs ({users.filter(u => !u.deletedAt).length})
              </button>
              <button
                onClick={() => setFilter('deleted')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'deleted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Supprimés ({users.filter(u => u.deletedAt).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tous ({users.length})
              </button>
            </div>

            {selectedUsers.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Supprimer {selectedUsers.size} utilisateur(s)
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.deletedAt ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      disabled={user.role === 'admin'}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'hotel_owner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.deletedAt ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Supprimé
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.deletedAt ? (
                      <button
                        onClick={() => handleRestoreUser(user)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Restaurer
                      </button>
                    ) : (
                      <>
                        <a
                          href={`/admin/users/${user.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Modifier
                        </a>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.role === 'admin'}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> ?
              <br />
              Cette action peut être annulée en restaurant l'utilisateur.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setUserToDelete(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression multiple
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedUsers.size}</strong> utilisateur(s) ?
              <br />
              Cette action peut être annulée en restaurant les utilisateurs.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
