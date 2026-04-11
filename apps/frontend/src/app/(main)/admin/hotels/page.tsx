'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  star_rating: number;
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  owner_id: string;
  created_at: string;
}

export default function AdminHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError('');

      const userRole = localStorage.getItem('user_role') || '';
      setUserRole(userRole);
      // Admin voit tous les hôtels, hotel_owner voit uniquement les siens
      const endpoint = userRole === 'admin' ? '/hotels/admin/all' : '/hotels/my-hotels';
      const response = await apiClient.get(endpoint);
      setHotels(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Vous devez être connecté');
        router.push('/login');
      } else if (err.response?.status === 403) {
        setError('Accès non autorisé');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des hôtels');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteHotel = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver l'hôtel "${name}" ?`)) {
      return;
    }

    try {
      await apiClient.delete(`/hotels/${id}`);
      alert('Hôtel désactivé avec succès');
      fetchHotels();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la désactivation');
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    if (filterStatus === 'active') return hotel.is_active;
    if (filterStatus === 'inactive') return !hotel.is_active;
    return true;
  });

  const stats = {
    total: hotels.length,
    active: hotels.filter(h => h.is_active).length,
    inactive: hotels.filter(h => !h.is_active).length,
    featured: hotels.filter(h => h.is_featured).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Hôtels
              </h1>
              <p className="text-gray-600 mt-1">
                {userRole === 'admin' ? 'Gérez tous les hôtels de la plateforme' : 'Gérez vos hôtels'}
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/hotels/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nouvel Hôtel
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Actifs</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Inactifs</div>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">En vedette</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Actifs ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inactifs ({stats.inactive})
            </button>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Table des hôtels */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hôtel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étoiles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
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
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun hôtel trouvé
                  </td>
                </tr>
              ) : (
                filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.name}
                        </div>
                        <div className="text-xs text-gray-500">{hotel.slug}</div>
                        {hotel.is_featured && (
                          <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                            ⭐ Vedette
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {hotel.city}, {hotel.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-yellow-500">
                      {'⭐'.repeat(hotel.star_rating)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {hotel.average_rating > 0 ? (
                        <div>
                          <span className="font-semibold text-blue-600">
                            {hotel.average_rating.toFixed(1)}
                          </span>
                          /5
                          <div className="text-xs text-gray-500">
                            ({hotel.total_reviews} avis)
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucun avis</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                          hotel.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {hotel.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/hotels/${hotel.slug}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => router.push(`/admin/hotels/${hotel.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => router.push(`/admin/hotels/${hotel.id}/rooms`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Chambres
                      </button>
                      {hotel.is_active && (
                        <button
                          onClick={() => deleteHotel(hotel.id, hotel.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Désactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (à implémenter) */}
        {filteredHotels.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            {filteredHotels.length} hôtel{filteredHotels.length > 1 ? 's' : ''} affiché{filteredHotels.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
