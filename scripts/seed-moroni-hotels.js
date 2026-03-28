const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend/.env') });

// Configuration Supabase via variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Démarrage du seed des hôtels de Moroni...\n');

  try {
    // 1. Récupérer l'ID d'un admin existant
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error('❌ Aucun utilisateur admin trouvé. Créez d\'abord un admin.');
      process.exit(1);
    }

    const ownerId = adminUser.id;
    console.log(`✅ Admin trouvé: ${ownerId}\n`);

    // 2. Créer les hôtels
    const hotels = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Golden Tulip Grande Comore Moroni',
        slug: 'golden-tulip-grande-comore-moroni',
        description: 'Hôtel 4 étoiles situé face à l\'océan Indien avec piscine et restaurant. Le Golden Tulip offre une vue imprenable sur la mer et des chambres climatisées luxueuses.',
        description_en: '4-star hotel facing the Indian Ocean with pool and restaurant. Golden Tulip offers stunning sea views and luxurious air-conditioned rooms.',
        short_description: 'Hôtel 4 étoiles face à l\'océan avec piscine et restaurant',
        address: 'Route de l\'Aéroport, BP 4041',
        city: 'Moroni',
        zip_code: 'BP 4041',
        country: 'Comores',
        latitude: -11.7042,
        longitude: 43.2551,
        phone: '+269 773 10 08',
        email: 'contact@goldentulipmoroni.com',
        website: 'https://goldentulipmoroni.com',
        check_in_time: '14:00:00',
        check_out_time: '12:00:00',
        reception_24h: true,
        stars: 4,
        chain_name: 'Golden Tulip',
        is_independent: false,
        labels: ['Vue mer', 'Business', 'Luxe'],
        certifications: ['ISO 9001', 'Écolabel'],
        images: ['https://example.com/golden-tulip-1.jpg', 'https://example.com/golden-tulip-2.jpg'],
        cover_image: 'https://example.com/golden-tulip-cover.jpg',
        amenities: ['WiFi gratuit', 'Piscine', 'Restaurant', 'Bar', 'Spa', 'Salle de sport', 'Parking gratuit', 'Service en chambre', 'Climatisation', 'Coffre-fort'],
        is_active: true,
        is_featured: true,
        average_rating: 4.5,
        total_reviews: 127,
        commission_rate: 12.0,
        owner_id: ownerId
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Retaj Moroni Hotel',
        slug: 'retaj-moroni-hotel',
        description: 'Hôtel moderne 3 étoiles au cœur de Moroni, proche du centre-ville et des commerces. Parfait pour les voyageurs d\'affaires et les touristes.',
        description_en: 'Modern 3-star hotel in the heart of Moroni, close to downtown and shops. Perfect for business travelers and tourists.',
        short_description: 'Hôtel moderne 3 étoiles au centre de Moroni',
        address: 'Boulevard de la Corniche',
        city: 'Moroni',
        zip_code: 'BP 2567',
        country: 'Comores',
        latitude: -11.7056,
        longitude: 43.2547,
        phone: '+269 773 25 30',
        email: 'info@retajmoroni.com',
        website: 'https://retajmoroni.com',
        check_in_time: '15:00:00',
        check_out_time: '11:00:00',
        reception_24h: true,
        stars: 3,
        chain_name: 'Retaj Hotels',
        is_independent: false,
        labels: ['Business', 'Centre-ville'],
        certifications: ['Halal'],
        images: ['https://example.com/retaj-1.jpg', 'https://example.com/retaj-2.jpg'],
        cover_image: 'https://example.com/retaj-cover.jpg',
        amenities: ['WiFi gratuit', 'Restaurant', 'Bar', 'Salle de réunion', 'Parking', 'Service en chambre', 'Climatisation', 'Blanchisserie'],
        is_active: true,
        is_featured: false,
        average_rating: 4.2,
        total_reviews: 89,
        commission_rate: 15.0,
        owner_id: ownerId
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Hôtel Moroni Prince',
        slug: 'hotel-moroni-prince',
        description: 'Hôtel boutique 2 étoiles offrant un excellent rapport qualité-prix. Idéal pour les budgets moyens avec un service personnalisé.',
        description_en: 'Boutique 2-star hotel offering excellent value for money. Ideal for medium budgets with personalized service.',
        short_description: 'Hôtel boutique 2 étoiles, excellent rapport qualité-prix',
        address: 'Rue du Marché, Centre-ville',
        city: 'Moroni',
        zip_code: 'BP 1234',
        country: 'Comores',
        latitude: -11.7022,
        longitude: 43.2562,
        phone: '+269 773 18 45',
        email: 'contact@moroniprince.com',
        check_in_time: '14:00:00',
        check_out_time: '11:00:00',
        reception_24h: false,
        stars: 2,
        is_independent: true,
        labels: ['Budget', 'Centre-ville', 'Familial'],
        images: ['https://example.com/prince-1.jpg'],
        cover_image: 'https://example.com/prince-cover.jpg',
        amenities: ['WiFi gratuit', 'Petit-déjeuner inclus', 'Parking', 'Ventilateur', 'Terrasse commune'],
        is_active: true,
        is_featured: false,
        average_rating: 3.8,
        total_reviews: 45,
        commission_rate: 18.0,
        owner_id: ownerId
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Itsandra Beach Hotel',
        slug: 'itsandra-beach-hotel',
        description: 'Resort 4 étoiles sur la plage d\'Itsandra, à 5km de Moroni. Bungalows avec accès direct à la plage, activités nautiques et restaurant les pieds dans le sable.',
        description_en: '4-star beach resort in Itsandra, 5km from Moroni. Bungalows with direct beach access, water sports and beachfront restaurant.',
        short_description: 'Resort 4 étoiles sur la plage avec bungalows',
        address: 'Plage d\'Itsandra',
        city: 'Moroni',
        zip_code: 'BP 3890',
        country: 'Comores',
        latitude: -11.6789,
        longitude: 43.2634,
        phone: '+269 773 42 67',
        email: 'reservation@itsandrabeach.com',
        website: 'https://itsandrabeach.com',
        check_in_time: '15:00:00',
        check_out_time: '12:00:00',
        reception_24h: true,
        stars: 4,
        is_independent: true,
        labels: ['Plage', 'Resort', 'Sports nautiques', 'Romantique'],
        certifications: ['Green Key'],
        images: ['https://example.com/itsandra-1.jpg', 'https://example.com/itsandra-2.jpg', 'https://example.com/itsandra-3.jpg'],
        cover_image: 'https://example.com/itsandra-cover.jpg',
        amenities: ['WiFi gratuit', 'Piscine', 'Restaurant', 'Bar de plage', 'Sports nautiques', 'Plongée', 'Parking gratuit', 'Service en chambre', 'Climatisation', 'Spa'],
        is_active: true,
        is_featured: true,
        average_rating: 4.7,
        total_reviews: 156,
        commission_rate: 10.0,
        owner_id: ownerId
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Al Amal Hotel',
        slug: 'al-amal-hotel',
        description: 'Hôtel 3 étoiles près de l\'aéroport international de Moroni. Idéal pour les escales et courts séjours avec navette aéroport gratuite.',
        description_en: '3-star hotel near Moroni International Airport. Ideal for stopovers and short stays with free airport shuttle.',
        short_description: 'Hôtel 3 étoiles proche aéroport avec navette gratuite',
        address: 'Route de l\'Aéroport Prince Said Ibrahim',
        city: 'Moroni',
        zip_code: 'BP 5678',
        country: 'Comores',
        latitude: -11.7145,
        longitude: 43.2718,
        phone: '+269 773 55 12',
        email: 'info@alamalhotel.km',
        check_in_time: '00:00:00',
        check_out_time: '13:00:00',
        reception_24h: true,
        stars: 3,
        is_independent: true,
        labels: ['Aéroport', 'Transit', 'Business'],
        images: ['https://example.com/alamal-1.jpg'],
        cover_image: 'https://example.com/alamal-cover.jpg',
        amenities: ['WiFi gratuit', 'Restaurant', 'Navette aéroport gratuite', 'Parking gratuit', 'Service en chambre 24h', 'Climatisation', 'Bureau', 'Petit-déjeuner 24h'],
        is_active: true,
        is_featured: false,
        average_rating: 4.0,
        total_reviews: 67,
        commission_rate: 15.0,
        owner_id: ownerId
      }
    ];

    console.log('📍 Insertion des hôtels...');
    for (const hotel of hotels) {
      const { error } = await supabase.from('hotels').insert(hotel);
      if (error) {
        console.error(`❌ Erreur insertion ${hotel.name}:`, error.message);
      } else {
        console.log(`✅ ${hotel.name} créé`);
      }
    }

    // 3. Créer les chambres
    console.log('\n🛏️  Insertion des chambres...');

    const rooms = [
      // Golden Tulip
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '101', type: 'Chambre Standard', capacity: 2, price_per_night: 85.00, description: 'Chambre standard avec vue jardin, lit double', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_available: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '102', type: 'Chambre Standard', capacity: 2, price_per_night: 85.00, description: 'Chambre standard avec vue jardin, lits jumeaux', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_available: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '201', type: 'Chambre Deluxe Vue Mer', capacity: 2, price_per_night: 120.00, description: 'Chambre deluxe avec vue mer, lit king size', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], is_available: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '202', type: 'Chambre Deluxe Vue Mer', capacity: 2, price_per_night: 120.00, description: 'Chambre deluxe avec vue mer, lit king size', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], is_available: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '301', type: 'Suite Junior', capacity: 3, price_per_night: 175.00, description: 'Suite junior avec salon, vue mer panoramique', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort', 'Salon'], is_available: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '401', type: 'Suite Présidentielle', capacity: 4, price_per_night: 300.00, description: 'Suite présidentielle avec 2 chambres, terrasse privée', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Salon', 'Jacuzzi'], is_available: true },

      // Retaj Moroni
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '101', type: 'Chambre Simple', capacity: 1, price_per_night: 55.00, description: 'Chambre simple confortable, lit simple', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau'], is_available: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '102', type: 'Chambre Double', capacity: 2, price_per_night: 70.00, description: 'Chambre double avec lit queen', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_available: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '103', type: 'Chambre Double', capacity: 2, price_per_night: 70.00, description: 'Chambre double avec lits jumeaux', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_available: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '201', type: 'Chambre Triple', capacity: 3, price_per_night: 95.00, description: 'Chambre triple familiale', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Réfrigérateur'], is_available: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '301', type: 'Suite Business', capacity: 2, price_per_night: 130.00, description: 'Suite avec espace bureau et salon', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Bureau', 'Salon'], is_available: true },

      // Moroni Prince
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '1', type: 'Chambre Économique', capacity: 1, price_per_night: 30.00, description: 'Chambre simple avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire'], is_available: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '2', type: 'Chambre Standard', capacity: 2, price_per_night: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_available: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '3', type: 'Chambre Standard', capacity: 2, price_per_night: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_available: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '4', type: 'Chambre Familiale', capacity: 4, price_per_night: 70.00, description: 'Chambre familiale avec 2 lits doubles', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV', 'Réfrigérateur'], is_available: true },

      // Itsandra Beach
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B1', type: 'Bungalow Jardin', capacity: 2, price_per_night: 110.00, description: 'Bungalow avec vue jardin tropical', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], is_available: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B2', type: 'Bungalow Jardin', capacity: 2, price_per_night: 110.00, description: 'Bungalow avec vue jardin tropical', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], is_available: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B3', type: 'Bungalow Vue Mer', capacity: 2, price_per_night: 145.00, description: 'Bungalow face à la mer avec terrasse', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], is_available: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B4', type: 'Bungalow Vue Mer', capacity: 2, price_per_night: 145.00, description: 'Bungalow face à la mer avec terrasse', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], is_available: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B5', type: 'Bungalow Familial', capacity: 4, price_per_night: 210.00, description: 'Grand bungalow avec 2 chambres', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Cuisine équipée'], is_available: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B10', type: 'Bungalow Lune de Miel', capacity: 2, price_per_night: 195.00, description: 'Bungalow romantique avec jacuzzi privé', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Jacuzzi', 'Champagne offert'], is_available: true },

      // Al Amal
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '101', type: 'Chambre Transit Simple', capacity: 1, price_per_night: 50.00, description: 'Chambre pour escale rapide, lit simple', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], is_available: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '102', type: 'Chambre Transit Double', capacity: 2, price_per_night: 65.00, description: 'Chambre pour escale, lit double', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], is_available: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '201', type: 'Chambre Business', capacity: 2, price_per_night: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_available: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '202', type: 'Chambre Business', capacity: 2, price_per_night: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_available: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '301', type: 'Suite Executive', capacity: 2, price_per_night: 120.00, description: 'Suite avec salon et espace bureau séparé', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Salon', 'Minibar', 'Coffre-fort', 'Peignoirs'], is_available: true }
    ];

    for (const room of rooms) {
      const { error } = await supabase.from('rooms').insert(room);
      if (error) {
        console.error(`❌ Erreur insertion chambre ${room.room_number}:`, error.message);
      } else {
        console.log(`✅ Chambre ${room.room_number} créée`);
      }
    }

    // 4. Résumé
    console.log('\n📊 Résumé:');
    const { count: hotelCount } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true })
      .eq('city', 'Moroni');

    const { count: roomCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .in('hotel_id', hotels.map(h => h.id));

    console.log(`✅ ${hotelCount || 0} hôtels créés à Moroni`);
    console.log(`✅ ${roomCount || 0} chambres créées\n`);

    console.log('🎉 Seed terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
