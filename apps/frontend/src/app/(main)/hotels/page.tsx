'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Hotel {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  city: string;
  country: string;
  star_rating: number;
  cover_image?: string;
  images?: string[];
  slug: string;
  average_rating?: number;
  total_reviews?: number;
  is_featured?: boolean;
}

export default function HotelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    // Récupérer le paramètre de recherche de l'URL
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchCity(searchQuery);
      searchByCity(searchQuery);
    } else {
      fetchHotels();
    }
  }, [searchParams]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/hotels`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des hôtels');
      }

      const data = await response.json();
      setHotels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async (query?: string) => {
    const cityQuery = query || searchCity;

    if (!cityQuery.trim()) {
      fetchHotels();
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_URL}/hotels/search/city/${encodeURIComponent(cityQuery)}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      setHotels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des hôtels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nos Hôtels
          </h1>
          <p className="text-gray-600">
            Découvrez notre sélection d'hôtels de qualité
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rechercher par ville (ex: Paris)"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchByCity()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => searchByCity()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
            {searchCity && (
              <button
                onClick={() => {
                  setSearchCity('');
                  fetchHotels();
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Liste des hôtels */}
        {hotels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">Aucun hôtel trouvé</p>
            {searchCity && (
              <button
                onClick={() => {
                  setSearchCity('');
                  fetchHotels();
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Voir tous les hôtels
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/hotels/${hotel.slug}`)}
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl">
                  {hotel.cover_image ? (
                    <img
                      src={hotel.cover_image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '🏨'
                  )}
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Badge Featured */}
                  {hotel.is_featured && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
                      ⭐ En vedette
                    </span>
                  )}

                  {/* Nom et étoiles */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h3>
                  <div className="text-yellow-500 mb-2">
                    {renderStars(hotel.star_rating)}
                  </div>

                  {/* Localisation */}
                  <p className="text-gray-600 text-sm mb-3">
                    📍 {hotel.city}, {hotel.country}
                  </p>

                  {/* Description courte */}
                  {hotel.short_description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {hotel.short_description}
                    </p>
                  )}

                  {/* Note moyenne */}
                  {hotel.average_rating && hotel.average_rating > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span className="font-semibold text-blue-600 mr-1">
                        {hotel.average_rating.toFixed(1)}
                      </span>
                      <span>/ 5</span>
                      {hotel.total_reviews && hotel.total_reviews > 0 && (
                        <span className="ml-2">
                          ({hotel.total_reviews} avis)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bouton */}
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {hotels.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            {hotels.length} hôtel{hotels.length > 1 ? 's' : ''} trouvé{hotels.length > 1 ? 's' : ''}
            {searchCity && ` à ${searchCity}`}
          </div>
        )}
      </div>
    </div>
  );
}
