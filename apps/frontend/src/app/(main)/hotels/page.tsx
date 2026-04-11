'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HotelSearchChat from '@/components/HotelSearchChat';
import { Breadcrumb, Alert, HotelCardSkeleton } from '@/components/ui';

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
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (query?: string) => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = query && query.trim()
        ? `${API_URL}/hotels/search?q=${encodeURIComponent(query.trim())}`
        : `${API_URL}/hotels`;
      const response = await fetch(url);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchHotels(value);
    }, 400);
    setSearchTimeout(timeout);
  };

  const renderStars = (rating: number) => {
    return (
      <span aria-label={`${rating} étoiles`}>
        {'⭐'.repeat(rating)}
      </span>
    );
  };

  // Skeleton pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Hôtels' },
            ]}
            className="mb-6"
          />

          {/* Header skeleton */}
          <div className="mb-8">
            <div className="skeleton skeleton-title w-48 h-9 mb-2" />
            <div className="skeleton skeleton-text w-72" />
          </div>

          {/* Grille de skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Guidage */}
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Hôtels' },
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Nos Hôtels
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Découvrez notre sélection d'hôtels de qualité
            </p>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn btn-primary"
            aria-pressed={showChat}
          >
            {showChat ? '📋 Voir la liste complète' : '💬 Assistant de recherche'}
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher par nom d'hôtel, ville, pays, description..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              aria-label="Rechercher un hôtel"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); fetchHotels(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chatbot de recherche sécurisé */}
        {showChat ? (
          <div className="mb-8 animate-fade-in">
            <HotelSearchChat />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Utilisez l'assistant pour rechercher des hôtels par ville, étoiles, équipements...
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Messages d'erreur - Gestion des erreurs */}
            {error && (
              <Alert
                type="error"
                title="Erreur de chargement"
                onClose={() => setError('')}
                className="mb-6"
              >
                {error}
                <button
                  onClick={() => fetchHotels(searchQuery)}
                  className="ml-2 underline hover:no-underline"
                >
                  Réessayer
                </button>
              </Alert>
            )}

            {/* Liste des hôtels */}
            {hotels.length === 0 ? (
              <div className="text-center py-12 card">
                <div className="card-body">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    Aucun hôtel trouvé
                  </p>
                  <button
                    onClick={() => setShowChat(true)}
                    className="btn btn-primary"
                  >
                    Utiliser l'assistant de recherche
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Liste des hôtels"
              >
                {hotels.map((hotel) => (
                  <article
                    key={hotel.id}
                    className="card card-interactive cursor-pointer"
                    onClick={() => router.push(`/hotels/${hotel.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/hotels/${hotel.slug}`);
                      }
                    }}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`${hotel.name}, ${hotel.star_rating} étoiles, ${hotel.city}`}
                  >
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl">
                      {hotel.cover_image ? (
                        <img
                          src={hotel.cover_image}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span aria-hidden="true">🏨</span>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="card-body">
                      {/* Badge Featured */}
                      {hotel.is_featured && (
                        <span className="badge badge-warning mb-2">
                          En vedette
                        </span>
                      )}

                      {/* Nom et étoiles */}
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {hotel.name}
                      </h2>
                      <div className="text-yellow-500 mb-2">
                        {renderStars(hotel.star_rating)}
                      </div>

                      {/* Localisation */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        <span aria-hidden="true">📍</span>{' '}
                        {hotel.city}, {hotel.country}
                      </p>

                      {/* Description courte */}
                      {hotel.short_description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {hotel.short_description}
                        </p>
                      )}

                      {/* Note moyenne */}
                      {hotel.average_rating && hotel.average_rating > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1">
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

                      {/* Bouton - WCAG 2.2 zone de clic */}
                      <button
                        className="btn btn-primary w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/hotels/${hotel.slug}`);
                        }}
                      >
                        Voir les détails
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Stats */}
            {hotels.length > 0 && (
              <p
                className="mt-8 text-center text-gray-600 dark:text-gray-400"
                aria-live="polite"
              >
                {hotels.length} hôtel{hotels.length > 1 ? 's' : ''} disponible
                {hotels.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
