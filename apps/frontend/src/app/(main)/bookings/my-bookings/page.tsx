'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Booking {
  id: string;
  room_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  total_price: number;
  total_nights: number;
  room_price_per_night: number;
  status: string;
  booking_reference: string;
  special_requests?: string;
  created_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  room: {
    room_number: string;
    room_type: string;
    base_price: number;
    view_type?: string;
  };
  hotel: {
    name: string;
    city: string;
    address: string;
    phone?: string;
    stars: number;
  };
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError('Erreur lors de la récupération de vos réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);
      await apiClient.delete(`/bookings/${id}`);
      alert('Réservation annulée avec succès');
      fetchBookings(); // Recharger la liste
    } catch (err: any) {
      console.error('Cancel error:', err);
      alert(
        err.response?.data?.message ||
        'Erreur lors de l\'annulation. Veuillez réessayer.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Check-in effectué' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Complétée' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatRoomType = (type: string) => {
    const types: { [key: string]: string } = {
      single: 'Simple',
      double: 'Double',
      twin: 'Twin',
      triple: 'Triple',
      quad: 'Quadruple',
      suite: 'Suite',
      deluxe: 'Deluxe',
      presidential: 'Présidentielle',
      studio: 'Studio',
      family: 'Familiale',
      accessible: 'Accessible PMR',
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'checked_out') {
      return false;
    }

    const checkInDate = new Date(booking.check_in);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilCheckIn >= 24;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['pending', 'confirmed', 'checked_in'].includes(booking.status);
    if (filterStatus === 'past') return ['completed', 'checked_out'].includes(booking.status);
    if (filterStatus === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['pending', 'confirmed', 'checked_in'].includes(b.status)).length,
    completed: bookings.filter(b => ['completed', 'checked_out'].includes(b.status)).length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Réservations</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Actives</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Complétées</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Annulées</p>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actives ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('past')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Passées ({stats.completed})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annulées ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Liste des réservations */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucune réservation
            </h2>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? 'Vous n\'avez pas encore de réservation'
                : `Aucune réservation ${filterStatus === 'active' ? 'active' : filterStatus === 'past' ? 'passée' : 'annulée'}`}
            </p>
            <button
              onClick={() => router.push('/hotels')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Découvrir nos hôtels
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.hotel.name}
                        </h3>
                        <span className="text-yellow-500">
                          {'⭐'.repeat(booking.hotel.stars)}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        📍 {booking.hotel.city} · {booking.hotel.address}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Réf: {booking.booking_reference}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-sm text-gray-500 mt-2">
                        Réservé le {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Chambre</p>
                      <p className="font-semibold text-gray-900">
                        {formatRoomType(booking.room.room_type)} #{booking.room.room_number}
                      </p>
                      {booking.room.view_type && (
                        <p className="text-sm text-gray-600">Vue {booking.room.view_type}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Dates</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_in)}
                      </p>
                      <p className="text-sm text-gray-600">
                        au {formatDate(booking.check_out)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.total_nights} nuit{booking.total_nights > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Voyageurs</p>
                      <p className="font-semibold text-gray-900">
                        {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                        {booking.children > 0 && `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`}
                        {booking.infants > 0 && `, ${booking.infants} bébé${booking.infants > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Demandes spéciales:
                      </p>
                      <p className="text-sm text-gray-700">{booking.special_requests}</p>
                    </div>
                  )}

                  {booking.status === 'cancelled' && booking.cancellation_reason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Raison de l'annulation:
                      </p>
                      <p className="text-sm text-red-700">{booking.cancellation_reason}</p>
                      {booking.cancelled_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Annulée le {formatDate(booking.cancelled_at)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Prix total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {booking.total_price.toFixed(2)}€
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.room_price_per_night}€/nuit + taxes
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {booking.hotel.phone && (
                        <a
                          href={`tel:${booking.hotel.phone}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                        >
                          📞 Contacter
                        </a>
                      )}
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
