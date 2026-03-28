/**
 * Script pour ajouter 2-3 chambres par hôtel
 * Ce script ajoute différents types de chambres à chaque hôtel existant
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement SUPABASE manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types de chambres possibles
const ROOM_TYPES = {
  single: { name: 'Chambre Simple', capacity: 1, basePrice: 80 },
  double: { name: 'Chambre Double', capacity: 2, basePrice: 120 },
  twin: { name: 'Chambre Twin', capacity: 2, basePrice: 130 },
  triple: { name: 'Chambre Triple', capacity: 3, basePrice: 180 },
  suite: { name: 'Suite', capacity: 2, basePrice: 250 },
  deluxe: { name: 'Chambre Deluxe', capacity: 2, basePrice: 200 },
  family: { name: 'Chambre Familiale', capacity: 4, basePrice: 220 },
};

const VIEW_TYPES = ['city', 'sea', 'mountain', 'garden', 'pool'];

const AMENITIES = [
  'WiFi Gratuit',
  'Télévision écran plat',
  'Mini-bar',
  'Climatisation',
  'Coffre-fort',
  'Sèche-cheveux',
  'Peignoirs',
  'Lit king-size',
  'Bureau',
  'Machine à café',
];

/**
 * Génère des chambres pour un hôtel donné
 */
function generateRoomsForHotel(hotel, hotelIndex) {
  const rooms = [];
  const stars = hotel.stars;

  // Déterminer le nombre de chambres selon le standing
  let roomCount = stars >= 4 ? 3 : 2;

  // Sélectionner les types de chambres en fonction du standing
  let selectedTypes = [];
  if (stars === 5) {
    selectedTypes = ['double', 'deluxe', 'suite'];
  } else if (stars === 4) {
    selectedTypes = ['double', 'deluxe', 'family'];
  } else if (stars === 3) {
    selectedTypes = ['single', 'double', 'triple'];
  } else {
    selectedTypes = ['single', 'double'];
  }

  // Générer les chambres
  selectedTypes.slice(0, roomCount).forEach((type, index) => {
    const roomType = ROOM_TYPES[type];
    const roomNumber = `${hotelIndex + 1}0${index + 1}`;

    // Calculer le prix en fonction du standing de l'hôtel
    const priceMultiplier = stars / 3;
    const basePrice = Math.round(roomType.basePrice * priceMultiplier);

    // Sélectionner des équipements en fonction du standing
    const amenityCount = stars >= 4 ? 8 : stars >= 3 ? 6 : 4;
    const roomAmenities = AMENITIES.slice(0, amenityCount);

    // Vue aléatoire
    const viewType = VIEW_TYPES[Math.floor(Math.random() * VIEW_TYPES.length)];

    rooms.push({
      hotel_id: hotel.id,
      room_number: roomNumber,
      room_type: type,
      description: `${roomType.name} confortable avec vue ${viewType === 'city' ? 'sur la ville' : viewType === 'sea' ? 'sur la mer' : viewType === 'mountain' ? 'sur les montagnes' : viewType === 'garden' ? 'sur le jardin' : 'sur la piscine'}`,
      base_price: basePrice,
      capacity_adults: roomType.capacity,
      capacity_children: roomType.capacity >= 3 ? 2 : roomType.capacity >= 2 ? 1 : 0,
      capacity_infants: 1,
      amenities: roomAmenities,
      is_active: true,
      view_type: viewType,
      surface_m2: type === 'suite' ? 45 : type === 'family' ? 35 : type === 'deluxe' ? 30 : type === 'triple' ? 28 : type === 'double' ? 25 : type === 'twin' ? 25 : 20,
    });
  });

  return rooms;
}

async function main() {
  try {
    console.log('🏨 Début de l\'ajout des chambres pour tous les hôtels...\n');

    // 1. Récupérer tous les hôtels
    console.log('📋 Récupération de tous les hôtels...');
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .order('name');

    if (hotelsError) {
      throw new Error(`Erreur lors de la récupération des hôtels: ${hotelsError.message}`);
    }

    if (!hotels || hotels.length === 0) {
      console.log('⚠️  Aucun hôtel trouvé dans la base de données');
      return;
    }

    console.log(`✅ ${hotels.length} hôtels trouvés\n`);

    // 2. Vérifier les chambres existantes
    const { data: existingRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('hotel_id');

    if (roomsError) {
      throw new Error(`Erreur lors de la vérification des chambres: ${roomsError.message}`);
    }

    const hotelsWithRooms = new Set(existingRooms?.map(r => r.hotel_id) || []);

    // 3. Générer et insérer les chambres pour chaque hôtel
    let totalRoomsAdded = 0;
    let hotelsProcessed = 0;

    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];

      // Skip si l'hôtel a déjà des chambres
      if (hotelsWithRooms.has(hotel.id)) {
        console.log(`⏭️  ${hotel.name} (${hotel.stars}⭐) - Chambres déjà existantes, ignoré`);
        continue;
      }

      console.log(`🔨 Traitement: ${hotel.name} (${hotel.stars}⭐) - ${hotel.city}`);

      const rooms = generateRoomsForHotel(hotel, i);

      // Insérer les chambres
      const { data: insertedRooms, error: insertError } = await supabase
        .from('rooms')
        .insert(rooms)
        .select();

      if (insertError) {
        console.error(`   ❌ Erreur pour ${hotel.name}: ${insertError.message}`);
        continue;
      }

      console.log(`   ✅ ${insertedRooms.length} chambres ajoutées:`);
      insertedRooms.forEach(room => {
        console.log(`      - Chambre ${room.room_number}: ${ROOM_TYPES[room.room_type].name} - ${room.base_price}€/nuit`);
      });

      totalRoomsAdded += insertedRooms.length;
      hotelsProcessed++;
      console.log('');
    }

    // 4. Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Hôtels traités: ${hotelsProcessed}`);
    console.log(`✅ Total chambres ajoutées: ${totalRoomsAdded}`);
    console.log(`⏭️  Hôtels ignorés (déjà des chambres): ${hotels.length - hotelsProcessed}`);
    console.log('='.repeat(60));

    // 5. Afficher un échantillon
    console.log('\n📋 Vérification - Chambres par hôtel:');
    const { data: verification, error: verifyError } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        room_type,
        base_price,
        hotel:hotels(name, stars)
      `)
      .order('hotel_id')
      .limit(20);

    if (!verifyError && verification) {
      verification.forEach(room => {
        console.log(`   ${room.hotel.name} (${room.hotel.stars}⭐) - Chambre ${room.room_number}: ${ROOM_TYPES[room.room_type]?.name || room.room_type} - ${room.base_price}€`);
      });
    }

    console.log('\n🎉 Script terminé avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main();
