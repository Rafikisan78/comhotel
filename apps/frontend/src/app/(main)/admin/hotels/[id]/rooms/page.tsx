'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Room {
  id: string;
  hotel_id: string;
  room_number: string;
  room_type: string;
  capacity_adults: number;
  capacity_children: number;
  base_price: number;
  description?: string;
  amenities?: string[];
  view?: string;
  is_active: boolean;
  created_at: string;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
}

export default function AdminHotelRoomsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotelAndRooms();
  }, [params.id]);

  const fetchHotelAndRooms = async () => {
    try {
      setLoading(true);
      setError('');

      // Récupérer les infos de l'hôtel
      const hotelResponse = await apiClient.get(`/hotels/${params.id}`);
      setHotel(hotelResponse.data);

      // Récupérer toutes les chambres et filtrer par hotel_id
      const roomsResponse = await apiClient.get('/rooms');
      const hotelRooms = roomsResponse.data.filter(
        (room: Room) => room.hotel_id === params.id
      );
      setRooms(hotelRooms);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: string, roomNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la chambre ${roomNumber} ?`)) {
      return;
    }

    try {
      await apiClient.delete(`/rooms/${id}`);
      alert('Chambre supprimée avec succès');
      fetchHotelAndRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const formatRoomType = (type: string) => {
    const types: Record<string, string> = {
      single: 'Simple',
      double: 'Double',
      twin: 'Twin',
      triple: 'Triple',
      quad: 'Quad',
      suite: 'Suite',
      deluxe: 'Deluxe',
      presidential: 'Présidentielle',
      studio: 'Studio',
      family: 'Familiale',
      accessible: 'Accessible PMR',
    };
    return types[type] || type;
  };

  const formatView = (view?: string) => {
    if (!view) return '-';
    const views: Record<string, string> = {
      city: 'Ville',
      sea: 'Mer',
      mountain: 'Montagne',
      garden: 'Jardin',
      pool: 'Piscine',
      courtyard: 'Cour',
      street: 'Rue',
      interior: 'Intérieure',
    };
    return views[view] || view;
  };

  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.is_active).length,
    inactive: rooms.filter(r => !r.is_active).length,
    avgPrice: rooms.length > 0
      ? (rooms.reduce((sum, r) => sum + r.base_price, 0) / rooms.length).toFixed(2)
      : '0',
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
          <button
            onClick={() => router.push('/admin/hotels')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Retour aux hôtels
          </button>

          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chambres - {hotel?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les chambres de cet hôtel
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/hotels/${params.id}/rooms/new`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nouvelle Chambre
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Chambres</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Disponibles</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Indisponibles</div>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Prix Moyen/Nuit</div>
              <div className="text-2xl font-bold text-blue-600">{stats.avgPrice}€</div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Table des chambres */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Chambre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix/Nuit
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
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucune chambre trouvée
                    <div className="mt-4">
                      <button
                        onClick={() => router.push(`/admin/hotels/${params.id}/rooms/new`)}
                        className="text-blue-600 hover:underline"
                      >
                        Ajouter la première chambre
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {room.room_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatRoomType(room.room_type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        👤 {room.capacity_adults} adulte{room.capacity_adults > 1 ? 's' : ''}
                      </div>
                      {room.capacity_children > 0 && (
                        <div className="text-xs text-gray-500">
                          👶 {room.capacity_children} enfant{room.capacity_children > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatView(room.view)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {room.base_price.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                          room.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {room.is_active ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/admin/hotels/${params.id}/rooms/${room.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteRoom(room.id, room.room_number)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Description des équipements */}
        {rooms.length > 0 && rooms.some(r => r.amenities && r.amenities.length > 0) && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Équipements disponibles dans les chambres :
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(
                  rooms.flatMap(r => r.amenities || [])
                )
              ).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-white text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
