'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface BookingUser {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface BookingRoom {
  room_number: string;
  room_type: string;
  base_price: number;
  view_type?: string;
}

interface HotelBooking {
  id: string;
  user_id: string;
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
  payment_method?: string;
  payment_id?: string;
  special_requests?: string;
  arrival_time?: string;
  early_checkin?: boolean;
  late_checkout?: boolean;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  room: BookingRoom;
  user: BookingUser;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
}

export default function HotelBookingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [hotelRes, bookingsRes] = await Promise.all([
        apiClient.get(`/hotels/${params.id}`),
        apiClient.get(`/bookings/hotel/${params.id}/all`),
      ]);

      setHotel(hotelRes.data);
      setBookings(bookingsRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Erreur lors de la recuperation des donnees');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (bookingId: string) => {
    if (!confirm('Confirmer la capture du paiement ? Le montant sera debite du client.')) return;

    try {
      setActionLoading(bookingId);
      await apiClient.patch(`/payments/${bookingId}/capture`);
      alert('Paiement capture avec succes');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la capture');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelPayment = async (bookingId: string) => {
    if (!confirm('Confirmer l\'annulation de cette reservation ? L\'autorisation Stripe sera liberee.')) return;

    try {
      setActionLoading(bookingId);
      await apiClient.patch(`/payments/${bookingId}/cancel`);
      alert('Reservation annulee avec succes');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending_payment: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Attente paiement' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmee' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulee' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Expiree' },
      checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Check-in' },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Check-out' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completee' },
      no_show: { bg: 'bg-red-100', text: 'text-red-600', label: 'No show' },
    };
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getPaymentBadge = (method?: string) => {
    if (!method) return <span className="text-xs text-gray-400">-</span>;
    if (method === 'stripe') {
      return (
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Stripe
        </span>
      );
    }
    if (method === 'on_site') {
      return (
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
          Sur place
        </span>
      );
    }
    return <span className="text-xs text-gray-500">{method}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRoomType = (type: string) => {
    const types: Record<string, string> = {
      single: 'Simple', double: 'Double', twin: 'Twin', triple: 'Triple',
      quad: 'Quad', suite: 'Suite', deluxe: 'Deluxe', presidential: 'Presidentielle',
      studio: 'Studio', family: 'Familiale', accessible: 'Accessible PMR',
    };
    return types[type] || type;
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['pending_payment', 'confirmed', 'checked_in'].includes(b.status);
    if (filterStatus === 'past') return ['completed', 'checked_out'].includes(b.status);
    if (filterStatus === 'cancelled') return ['cancelled', 'expired', 'no_show'].includes(b.status);
    if (filterStatus === 'stripe') return b.payment_method === 'stripe';
    if (filterStatus === 'on_site') return b.payment_method === 'on_site';
    return true;
  });

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['pending_payment', 'confirmed', 'checked_in'].includes(b.status)).length,
    stripe: bookings.filter(b => b.payment_method === 'stripe').length,
    onSite: bookings.filter(b => b.payment_method === 'on_site').length,
    revenue: bookings
      .filter(b => ['confirmed', 'checked_in', 'checked_out', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.total_price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/hotels')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            &larr; Retour aux hotels
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Reservations - {hotel?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gerez les reservations et les paiements de votre hotel
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Actives</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Paiement Stripe</p>
            <p className="text-2xl font-bold text-purple-600">{stats.stripe}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Paiement sur place</p>
            <p className="text-2xl font-bold text-teal-600">{stats.onSite}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-blue-600">{stats.revenue.toFixed(2)}&euro;</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: `Toutes (${bookings.length})` },
              { key: 'active', label: `Actives (${stats.active})` },
              { key: 'stripe', label: `Stripe (${stats.stripe})` },
              { key: 'on_site', label: `Sur place (${stats.onSite})` },
              { key: 'past', label: 'Passees' },
              { key: 'cancelled', label: 'Annulees' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-4 py-2 rounded-md font-medium transition text-sm ${
                  filterStatus === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voyageurs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      Aucune reservation trouvee
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {booking.booking_reference}
                        </span>
                        <div className="text-xs text-gray-400">
                          {formatDate(booking.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.first_name || ''} {booking.user?.last_name || ''}
                        </div>
                        <div className="text-xs text-gray-500">{booking.user?.email}</div>
                        {booking.user?.phone && (
                          <div className="text-xs text-gray-400">{booking.user.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          #{booking.room?.room_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatRoomType(booking.room?.room_type)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.check_in)}
                        </div>
                        <div className="text-xs text-gray-500">
                          au {formatDate(booking.check_out)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.total_nights} nuit{booking.total_nights > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.adults}A
                        {booking.children > 0 && ` ${booking.children}E`}
                        {booking.infants > 0 && ` ${booking.infants}B`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-blue-600">
                          {booking.total_price.toFixed(2)}&euro;
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getPaymentBadge(booking.payment_method)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {/* Capturer le paiement Stripe */}
                          {booking.status === 'confirmed' &&
                            booking.payment_method === 'stripe' &&
                            booking.payment_id && (
                              <button
                                onClick={() => handleCapture(booking.id)}
                                disabled={actionLoading === booking.id}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                              >
                                {actionLoading === booking.id ? '...' : 'Capturer'}
                              </button>
                            )}
                          {/* Annuler une reservation confirmee */}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelPayment(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                            >
                              {actionLoading === booking.id ? '...' : 'Annuler'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
