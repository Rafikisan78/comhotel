'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

// Interface pour l'utilisateur connecté
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  avatarUrl?: string;
}

// Interface pour les réservations existantes (pour le calendrier)
interface BookingPeriod {
  check_in: string;
  check_out: string;
}

interface Hotel {
  id: string;
  name: string;
  description: string;
  description_en?: string;
  short_description?: string;
  address: string;
  city: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  check_in_time?: string;
  check_out_time?: string;
  reception_24h?: boolean;
  stars: number;
  chain_name?: string;
  is_independent?: boolean;
  labels?: string[];
  certifications?: string[];
  images?: string[];
  cover_image?: string;
  amenities?: string[];
  slug: string;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
}

interface Room {
  id: string;
  hotel_id: string;
  room_number: string;
  room_type: string;
  description?: string;
  base_price: number;
  capacity_adults: number;
  capacity_children?: number;
  capacity_infants?: number;
  images?: string[];
  amenities?: string[];
  is_active: boolean;
  view_type?: string;
  surface_m2?: number;
}

export default function HotelDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dates de recherche pour afficher les chambres disponibles
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');
  const [searchAdults, setSearchAdults] = useState(2);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // État pour le calendrier de disponibilité
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookingPeriod[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Erreurs de validation des dates
  const [dateError, setDateError] = useState('');

  // Dates de réservation pour le modal
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // État pour le verrouillage / confirmation
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchHotel();
  }, [params.slug]);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const response = await apiClient.get('/users/me');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Si erreur 401, token invalide
        if ((err as any)?.response?.status === 401) {
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
        }
      }
    }
  };

  // Charger les réservations existantes pour le calendrier
  const fetchBookedDates = useCallback(async (hotelId: string) => {
    setCalendarLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/bookings/hotel/${hotelId}/calendar`);
      if (response.ok) {
        const data = await response.json();
        setBookedDates(data);
      }
    } catch (err) {
      console.error('Error fetching booked dates:', err);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  // Valider les dates de recherche
  const validateDates = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      return "La date d'arrivée ne peut pas être dans le passé";
    }

    if (checkOutDate <= checkInDate) {
      return "La date de départ doit être après la date d'arrivée";
    }

    const diffDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      return "La durée du séjour ne peut pas dépasser 30 jours";
    }

    return '';
  };

  // Vérifier si une date est réservée
  const isDateBooked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.some(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const currentDate = new Date(dateStr);
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  // Générer les jours du calendrier
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date | null; isBooked: boolean; isPast: boolean }[] = [];

    // Jours vides avant le premier jour du mois
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isBooked: false, isPast: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthIndex, day);
      days.push({
        date,
        isBooked: isDateBooked(date),
        isPast: date < today
      });
    }

    return days;
  };

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const hotelResponse = await fetch(`${API_URL}/hotels/slug/${params.slug}`);

      if (!hotelResponse.ok) {
        if (hotelResponse.status === 404) {
          setError('Hôtel non trouvé');
        } else {
          setError('Erreur lors de la récupération de l\'hôtel');
        }
        return;
      }

      const hotelData = await hotelResponse.json();
      setHotel(hotelData);

      // Récupérer les chambres de cet hôtel
      const roomsResponse = await fetch(`${API_URL}/rooms`);
      if (roomsResponse.ok) {
        const allRooms = await roomsResponse.json();
        const hotelRooms = allRooms.filter((room: Room) => room.hotel_id === hotelData.id && room.is_active);
        setRooms(hotelRooms);
      }

      // Charger les dates réservées pour le calendrier
      fetchBookedDates(hotelData.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableRooms = async () => {
    if (!searchCheckIn || !searchCheckOut || !hotel) {
      return;
    }

    // Validation des dates
    const validationError = validateDates(searchCheckIn, searchCheckOut);
    if (validationError) {
      setDateError(validationError);
      return;
    }
    setDateError('');

    try {
      setSearchLoading(true);
      setSearchPerformed(true);

      // Filtrer les chambres disponibles pour cet hôtel
      const hotelRooms = rooms.filter((room) => room.hotel_id === hotel.id && room.is_active);

      // Vérifier la disponibilité via l'API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const availabilityPromises = hotelRooms.map(async (room) => {
        try {
          const response = await fetch(
            `${API_URL}/bookings/check-availability?room_id=${room.id}&check_in=${searchCheckIn}&check_out=${searchCheckOut}`
          );

          if (response.ok) {
            const data = await response.json();
            return data.available ? room : null;
          }
          return null;
        } catch (error) {
          console.error(`Error checking availability for room ${room.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(availabilityPromises);
      const available = results.filter((room): room is Room => room !== null);
      setAvailableRooms(available);
    } catch (err: any) {
      console.error('Error searching available rooms:', err);
      setAvailableRooms([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    const subtotal = selectedRoom.base_price * nights;
    const taxes = subtotal * 0.1; // 10% de taxes
    return subtotal + taxes;
  };

  const openBookingModal = (room: Room) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
    setBookingError('');

    // Utiliser les dates de recherche si disponibles, sinon dates par défaut
    if (searchCheckIn && searchCheckOut) {
      setCheckInDate(searchCheckIn);
      setCheckOutDate(searchCheckOut);
      setAdults(searchAdults);
    } else {
      // Définir les dates par défaut
      const today = new Date();
      today.setDate(today.getDate() + 1); // Demain
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Après-demain

      setCheckInDate(today.toISOString().split('T')[0]);
      setCheckOutDate(tomorrow.toISOString().split('T')[0]);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    setBookingError('');
    setSpecialRequests('');
  };

  // Étape 1 : Créer la réservation (verrouillage pendant 15 min)
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !hotel) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      const bookingData = {
        room_id: selectedRoom.id,
        hotel_id: hotel.id,
        check_in: checkInDate,
        check_out: checkOutDate,
        adults,
        children,
        infants,
        special_requests: specialRequests,
      };

      const response = await apiClient.post('/bookings', bookingData);
      setPendingBooking(response.data);

      // Démarrer le compte à rebours (15 minutes = 900 secondes)
      const lockedUntil = new Date(response.data.locked_until);
      const remainingSeconds = Math.max(0, Math.floor((lockedUntil.getTime() - Date.now()) / 1000));
      setLockCountdown(remainingSeconds);
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError(
        err.response?.data?.message ||
        'Erreur lors de la réservation. Veuillez réessayer.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Étape 2 : Confirmer la réservation
  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    setConfirmLoading(true);
    setBookingError('');

    try {
      await apiClient.patch(`/bookings/${pendingBooking.id}/confirm`);
      alert('Réservation confirmée avec succès !');
      setPendingBooking(null);
      setLockCountdown(0);
      closeBookingModal();
      router.push('/bookings/my-bookings');
    } catch (err: any) {
      console.error('Confirm error:', err);
      setBookingError(
        err.response?.data?.message ||
        'Erreur lors de la confirmation. Veuillez réessayer.'
      );
      // Si expiré, reset
      if (err.response?.data?.message?.includes('expiré')) {
        setPendingBooking(null);
        setLockCountdown(0);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  // Compte à rebours
  useEffect(() => {
    if (lockCountdown <= 0) return;

    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPendingBooking(null);
          setBookingError('Le délai de confirmation a expiré. Veuillez refaire une réservation.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockCountdown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
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

  const formatViewType = (view?: string) => {
    if (!view) return null;
    const views: { [key: string]: string } = {
      city: 'Vue ville',
      sea: 'Vue mer',
      mountain: 'Vue montagne',
      garden: 'Vue jardin',
      pool: 'Vue piscine',
    };
    return views[view] || view;
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

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">❌</h1>
          <p className="text-xl text-gray-700 mb-6">{error || 'Hôtel non trouvé'}</p>
          <button
            onClick={() => router.push('/hotels')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barre de navigation avec bouton retour et utilisateur connecté */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/hotels')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Retour à la liste
          </button>

          {/* Widget utilisateur connecté */}
          {isLoggedIn && currentUser ? (
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Avatar - image personnalisée ou initiales */}
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={`Avatar de ${currentUser.firstName || currentUser.email}`}
                  className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-blue-100"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {currentUser.firstName && currentUser.lastName
                    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
                    : currentUser.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                {/* Nom complet */}
                <p className="font-semibold text-gray-900 text-base">
                  {currentUser.firstName && currentUser.lastName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : currentUser.email.split('@')[0]}
                </p>
                {/* Email si différent du nom affiché */}
                {currentUser.firstName && currentUser.lastName && (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {currentUser.email}
                  </p>
                )}
                {/* Badge de statut */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connecte
                  </span>
                  {currentUser.loyaltyTier && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      currentUser.loyaltyTier === 'gold'
                        ? 'bg-yellow-100 text-yellow-700'
                        : currentUser.loyaltyTier === 'silver'
                        ? 'bg-gray-100 text-gray-700'
                        : currentUser.loyaltyTier === 'platinum'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {currentUser.loyaltyTier.charAt(0).toUpperCase() + currentUser.loyaltyTier.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              {/* Menu déroulant (optionnel) */}
              <button
                onClick={() => router.push('/profile')}
                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition"
                title="Mon profil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Se connecter</span>
            </button>
          )}
        </div>

        {/* Image de couverture */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="h-96 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-6xl">
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
        </div>

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {hotel.name}
              </h1>
              <div className="text-yellow-500 text-2xl mb-3">
                {renderStars(hotel.stars)}
              </div>
            </div>
            {hotel.average_rating && hotel.average_rating > 0 && (
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {hotel.average_rating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">/ 5</div>
                {hotel.total_reviews && (
                  <div className="text-xs text-gray-500 mt-1">
                    {hotel.total_reviews} avis
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="flex items-start space-x-2 text-gray-700 mb-2">
            <span className="text-xl">📍</span>
            <div>
              <p className="font-semibold">{hotel.address}</p>
              <p>{hotel.zip_code} {hotel.city}, {hotel.country}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {hotel.phone && (
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <a href={`tel:${hotel.phone}`} className="text-blue-600 hover:underline">
                  {hotel.phone}
                </a>
              </div>
            )}
            {hotel.email && (
              <div className="flex items-center space-x-2">
                <span>✉️</span>
                <a href={`mailto:${hotel.email}`} className="text-blue-600 hover:underline">
                  {hotel.email}
                </a>
              </div>
            )}
            {hotel.website && (
              <div className="flex items-center space-x-2">
                <span>🌐</span>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Site web
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {hotel.description}
          </p>
        </div>

        {/* Formulaire de recherche et calendrier de disponibilité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Formulaire de recherche */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vérifier la disponibilité</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Conseil :</strong> Sélectionnez vos dates pour voir les chambres disponibles
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchAvailableRooms();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    value={searchCheckIn}
                    onChange={(e) => {
                      setSearchCheckIn(e.target.value);
                      setDateError('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={searchCheckOut}
                    onChange={(e) => {
                      setSearchCheckOut(e.target.value);
                      setDateError('');
                    }}
                    min={searchCheckIn || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'adultes
                  </label>
                  <select
                    value={searchAdults}
                    onChange={(e) => setSearchAdults(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'adulte' : 'adultes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Affichage des erreurs de validation */}
              {dateError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{dateError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={searchLoading || !searchCheckIn || !searchCheckOut}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Recherche en cours...' : 'Rechercher des chambres'}
              </button>
            </form>
          </div>

          {/* Calendrier de disponibilité */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Calendrier de disponibilité</h3>

            {/* Navigation du mois */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <span className="font-medium text-gray-900">
                {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>

            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du calendrier */}
            {calendarLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays(calendarMonth).map((day, index) => (
                  <div
                    key={index}
                    className={`text-center py-2 text-sm rounded-md ${
                      !day.date
                        ? 'bg-transparent'
                        : day.isPast
                        ? 'bg-gray-100 text-gray-400'
                        : day.isBooked
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {day.date?.getDate() || ''}
                  </div>
                ))}
              </div>
            )}

            {/* Légende */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-600">Disponible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span className="text-gray-600">Réservé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Passé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chambres disponibles - Affichées uniquement après une recherche */}
        {searchPerformed ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Chambres disponibles pour vos dates
              {searchCheckIn && searchCheckOut && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({new Date(searchCheckIn).toLocaleDateString('fr-FR')} - {new Date(searchCheckOut).toLocaleDateString('fr-FR')})
                </span>
              )}
            </h2>

            {searchLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Vérification de la disponibilité...</p>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xl text-gray-600 mb-4">Aucune chambre disponible pour ces dates</p>
                <p className="text-gray-500 mb-6">Essayez de modifier vos dates de séjour</p>
                <button
                  onClick={() => {
                    setSearchPerformed(false);
                    setSearchCheckIn('');
                    setSearchCheckOut('');
                    setDateError('');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Nouvelle recherche
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {availableRooms.length} chambre{availableRooms.length > 1 ? 's' : ''} disponible{availableRooms.length > 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {formatRoomType(room.room_type)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Chambre {room.room_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {room.base_price}€
                          </p>
                          <p className="text-xs text-gray-600">par nuit</p>
                        </div>
                      </div>

                      {room.description && (
                        <p className="text-gray-700 text-sm mb-4">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>👥 {room.capacity_adults} adultes</span>
                        {room.capacity_children && room.capacity_children > 0 && (
                          <span>👶 {room.capacity_children} enfants</span>
                        )}
                        {room.view_type && (
                          <span>🪟 {formatViewType(room.view_type)}</span>
                        )}
                        {room.surface_m2 && (
                          <span>📐 {room.surface_m2}m²</span>
                        )}
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Équipements:</p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 5).map((amenity, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 5 && (
                              <span className="text-xs text-gray-500">
                                +{room.amenities.length - 5} autres
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => openBookingModal(room)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                      >
                        Réserver
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Message d'invitation à rechercher quand pas de recherche effectuée */
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trouvez votre chambre idéale</h2>
              <p className="text-gray-600 mb-2">
                Sélectionnez vos dates de séjour ci-dessus pour voir les chambres disponibles.
              </p>
              <p className="text-sm text-gray-500">
                {rooms.length} chambre{rooms.length > 1 ? 's' : ''} dans cet hôtel
              </p>
            </div>
          </div>
        )}

        {/* Équipements de l'hôtel */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Équipements de l'hôtel</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotel.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <span className="text-green-500">✓</span>
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de réservation */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Réserver une chambre
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {formatRoomType(selectedRoom.room_type)} - Chambre {selectedRoom.room_number}
                  </p>
                </div>
                <button
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {bookingError}
                </div>
              )}

              {/* Étape 2 : Confirmation avec compte à rebours */}
              {pendingBooking ? (
                <div className="space-y-4">
                  {/* Compte à rebours */}
                  <div className={`p-4 rounded-md text-center ${lockCountdown > 60 ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${lockCountdown > 60 ? 'text-orange-700' : 'text-red-700'}`}>
                      Chambre verrouillée pour vous pendant
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${lockCountdown > 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Confirmez avant l'expiration du delai
                    </p>
                  </div>

                  {/* Récapitulatif */}
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-semibold text-gray-900 mb-2">Recapitulatif</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference :</span>
                        <span className="font-mono font-semibold">{pendingBooking.booking_reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chambre :</span>
                        <span>{formatRoomType(selectedRoom.room_type)} - N°{selectedRoom.room_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrivee :</span>
                        <span>{new Date(pendingBooking.check_in).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Depart :</span>
                        <span>{new Date(pendingBooking.check_out).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nuits :</span>
                        <span>{pendingBooking.total_nights}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total :</span>
                          <span className="text-lg font-bold text-blue-600">
                            {Number(pendingBooking.total_price).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => { setPendingBooking(null); setLockCountdown(0); closeBookingModal(); }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={confirmLoading || lockCountdown === 0}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {confirmLoading ? 'Confirmation...' : 'Confirmer et payer'}
                    </button>
                  </div>
                </div>
              ) : (
              /* Étape 1 : Formulaire de réservation */
              <form onSubmit={handleBooking}>
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'arrivée
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de départ
                      </label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Nombre de personnes */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adultes
                      </label>
                      <input
                        type="number"
                        value={adults}
                        onChange={(e) => setAdults(parseInt(e.target.value))}
                        min="1"
                        max={selectedRoom.capacity_adults}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enfants
                      </label>
                      <input
                        type="number"
                        value={children}
                        onChange={(e) => setChildren(parseInt(e.target.value))}
                        min="0"
                        max={selectedRoom.capacity_children || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bébés
                      </label>
                      <input
                        type="number"
                        value={infants}
                        onChange={(e) => setInfants(parseInt(e.target.value))}
                        min="0"
                        max={selectedRoom.capacity_infants || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Demandes spéciales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Demandes spéciales (optionnel)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Ex: Lit bébé, chambre au calme, arrivée tardive..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Résumé du prix */}
                  {calculateNights() > 0 && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Prix par nuit:</span>
                        <span className="font-semibold">{selectedRoom.base_price}€</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Nombre de nuits:</span>
                        <span className="font-semibold">{calculateNights()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Sous-total:</span>
                        <span className="font-semibold">
                          {(selectedRoom.base_price * calculateNights()).toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Taxes (10%):</span>
                        <span className="font-semibold">
                          {(selectedRoom.base_price * calculateNights() * 0.1).toFixed(2)}€
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {calculateTotalPrice().toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading || calculateNights() === 0}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? 'Verrouillage...' : 'Reserver cette chambre'}
                    </button>
                  </div>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
