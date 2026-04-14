'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getSupabase } from '@/lib/supabase';

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

  // US-3.2 : Notifications temps réel pour les réservations
  interface BookingNotification {
    id: string;
    hotelName: string;
    roomNumber: string;
    status: string;
    checkIn: string;
    checkOut: string;
    timestamp: Date;
  }
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  // US-3.2 : Abonnement Realtime sur les réservations des hôtels du propriétaire
  useEffect(() => {
    if (hotels.length === 0) return;

    const hotelIds = hotels.map((h) => h.id);
    const channels = hotelIds.map((hotelId) => {
      const hotelName = hotels.find((h) => h.id === hotelId)?.name || '';
      return getSupabase()
        .channel(`owner-bookings-${hotelId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `hotel_id=eq.${hotelId}`,
          },
          async (payload) => {
            const booking = payload.new as any;
            if (!booking || !booking.status) return;

            // Notifier seulement pour confirmed, cancelled, pending_payment
            const notifyStatuses = ['confirmed', 'cancelled', 'pending_payment'];
            if (!notifyStatuses.includes(booking.status)) return;

            // Récupérer le numéro de chambre
            let roomNumber = '';
            try {
              const { data: room } = await getSupabase()
                .from('rooms')
                .select('room_number')
                .eq('id', booking.room_id)
                .single();
              roomNumber = room?.room_number || '';
            } catch {}

            const statusLabels: Record<string, string> = {
              confirmed: 'Réservation confirmée',
              cancelled: 'Réservation annulée',
              pending_payment: 'Nouvelle réservation (en attente)',
            };

            const notification: BookingNotification = {
              id: booking.id,
              hotelName,
              roomNumber,
              status: booking.status,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              timestamp: new Date(),
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 20));
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach((ch) => getSupabase().removeChannel(ch));
    };
  }, [hotels]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="min-h-screen bg-blue-50 py-8">
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
            <div className="flex items-center gap-3">
              {/* US-3.2 : Cloche de notifications temps réel */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative bg-white text-gray-700 p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Notifications de réservations"
                >
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Tout effacer
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif, i) => (
                        <div
                          key={`${notif.id}-${i}`}
                          className={`p-3 border-b border-gray-100 hover:bg-blue-50 ${
                            notif.status === 'confirmed'
                              ? 'border-l-4 border-l-green-500'
                              : notif.status === 'cancelled'
                                ? 'border-l-4 border-l-red-500'
                                : 'border-l-4 border-l-yellow-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span>
                              {notif.status === 'confirmed' ? '✅' : notif.status === 'cancelled' ? '❌' : '⏳'}
                            </span>
                            <span className="font-medium text-sm text-gray-900">
                              {notif.status === 'confirmed'
                                ? 'Réservation confirmée'
                                : notif.status === 'cancelled'
                                  ? 'Réservation annulée'
                                  : 'Nouvelle réservation'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {notif.hotelName} — Chambre {notif.roomNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notif.checkIn} → {notif.checkOut}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {notif.timestamp.toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/admin/hotels/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Nouvel Hôtel
              </button>
            </div>
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
            <thead className="bg-blue-50">
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
                  <tr key={hotel.id} className="hover:bg-blue-50">
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
                      <button
                        onClick={() => router.push(`/admin/hotels/${hotel.id}/bookings`)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Reservations
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
