'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

// Interface alignée avec le schéma réel de Supabase
interface Room {
  id: string;
  hotel_id: string;
  room_number: string;
  room_type: string;
  description?: string;
  base_price: number;
  capacity_adults: number;
  capacity_children: number;
  capacity_infants: number;
  surface_m2?: number;
  floor?: number;
  view_type?: string;
  amenities?: string[];
  images?: string[];
  is_active: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  accessible_pmr: boolean;
}

interface Hotel {
  id: string;
  name: string;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Simple' },
  { value: 'double', label: 'Double' },
  { value: 'twin', label: 'Twin' },
  { value: 'triple', label: 'Triple' },
  { value: 'quad', label: 'Quadruple' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'presidential', label: 'Presidentielle' },
  { value: 'studio', label: 'Studio' },
  { value: 'family', label: 'Familiale' },
  { value: 'accessible', label: 'Accessible PMR' },
];

const VIEW_TYPES = [
  { value: 'city', label: 'Vue ville' },
  { value: 'sea', label: 'Vue mer' },
  { value: 'mountain', label: 'Vue montagne' },
  { value: 'garden', label: 'Vue jardin' },
  { value: 'pool', label: 'Vue piscine' },
  { value: 'courtyard', label: 'Vue cour' },
  { value: 'street', label: 'Vue rue' },
];

const AMENITIES_OPTIONS = [
  'wifi', 'tv', 'climatisation', 'minibar', 'coffre_fort', 'bureau',
  'seche_cheveux', 'fer_a_repasser', 'machine_cafe', 'bouilloire',
  'balcon', 'terrasse', 'baignoire', 'douche_italienne', 'jacuzzi'
];

export default function EditRoomPage({ params }: { params: { id: string; roomId: string } }) {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<Partial<Room>>({
    room_number: '',
    room_type: 'double',
    description: '',
    base_price: 0,
    capacity_adults: 2,
    capacity_children: 0,
    capacity_infants: 0,
    surface_m2: undefined,
    floor: undefined,
    view_type: '',
    amenities: [],
    is_active: true,
    smoking_allowed: false,
    pets_allowed: false,
    accessible_pmr: false,
  });

  useEffect(() => {
    fetchData();
  }, [params.id, params.roomId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Recuperer l'hotel
      const hotelResponse = await apiClient.get(`/hotels/${params.id}`);
      setHotel(hotelResponse.data);

      // Recuperer la chambre
      const roomResponse = await apiClient.get(`/rooms/${params.roomId}`);
      setFormData(roomResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return {
          ...prev,
          amenities: currentAmenities.filter(a => a !== amenity)
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenity]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Ne garder que les champs valides du schéma Supabase
      const updateData = {
        room_number: formData.room_number,
        room_type: formData.room_type,
        description: formData.description || null,
        base_price: formData.base_price,
        capacity_adults: formData.capacity_adults,
        capacity_children: formData.capacity_children || 0,
        capacity_infants: formData.capacity_infants || 0,
        surface_m2: formData.surface_m2 || null,
        floor: formData.floor || null,
        view_type: formData.view_type || null,
        amenities: formData.amenities || [],
        is_active: formData.is_active,
        smoking_allowed: formData.smoking_allowed || false,
        pets_allowed: formData.pets_allowed || false,
        accessible_pmr: formData.accessible_pmr || false,
      };

      await apiClient.patch(`/rooms/${params.roomId}`, updateData);
      setSuccess('Chambre mise a jour avec succes !');
      setTimeout(() => {
        router.push(`/admin/hotels/${params.id}/rooms`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise a jour');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/admin/hotels/${params.id}/rooms`)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Retour aux chambres
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier la chambre
          </h1>
          <p className="text-gray-600 mt-1">
            {hotel?.name} - Chambre {formData.room_number}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations generales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations generales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de chambre *
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de chambre *
                </label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par nuit (EUR) *
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Capacite */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Capacite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adultes *
                </label>
                <input
                  type="number"
                  name="capacity_adults"
                  value={formData.capacity_adults}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfants
                </label>
                <input
                  type="number"
                  name="capacity_children"
                  value={formData.capacity_children || 0}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bebes
                </label>
                <input
                  type="number"
                  name="capacity_infants"
                  value={formData.capacity_infants || 0}
                  onChange={handleChange}
                  min="0"
                  max="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Caracteristiques */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Caracteristiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface (m2)
                </label>
                <input
                  type="number"
                  name="surface_m2"
                  value={formData.surface_m2 || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etage
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vue
                </label>
                <select
                  name="view_type"
                  value={formData.view_type || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Aucune --</option>
                  {VIEW_TYPES.map(view => (
                    <option key={view.value} value={view.value}>{view.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Equipements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Equipements de la chambre
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {AMENITIES_OPTIONS.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.amenities || []).includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {amenity.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Statut et Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Statut et Options
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Chambre disponible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="smoking_allowed"
                  checked={formData.smoking_allowed || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">Fumeur autorise</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="pets_allowed"
                  checked={formData.pets_allowed || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">Animaux acceptes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="accessible_pmr"
                  checked={formData.accessible_pmr || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <span className="text-sm text-gray-700">Accessible PMR</span>
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/hotels/${params.id}/rooms`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
