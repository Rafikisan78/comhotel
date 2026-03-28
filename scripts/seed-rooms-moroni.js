const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../apps/backend/.env' });

// Configuration Supabase via variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🛏️  Démarrage du seed des chambres de Moroni...\n');

  try {
    const rooms = [
      // Golden Tulip (11111111-1111-1111-1111-111111111111)
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '101', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 85.00, description: 'Chambre standard avec vue jardin, lit double', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '102', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 85.00, description: 'Chambre standard avec vue jardin, lits jumeaux', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '201', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 120.00, description: 'Chambre deluxe avec vue mer, lit king size', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], is_active: true, view: 'sea' },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '202', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 120.00, description: 'Chambre deluxe avec vue mer, lit king size', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], is_active: true, view: 'sea' },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '301', room_type: 'suite', capacity_adults: 2, capacity_children: 2, base_price: 175.00, description: 'Suite junior avec salon, vue mer panoramique', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort', 'Salon'], is_active: true, view: 'sea' },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '401', room_type: 'suite', capacity_adults: 4, capacity_children: 2, base_price: 300.00, description: 'Suite présidentielle avec 2 chambres, terrasse privée', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Salon', 'Jacuzzi'], is_active: true, view: 'sea' },

      // Retaj Moroni (22222222-2222-2222-2222-222222222222)
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '101', room_type: 'single', capacity_adults: 1, capacity_children: 0, base_price: 55.00, description: 'Chambre simple confortable, lit simple', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau'], is_active: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '102', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 70.00, description: 'Chambre double avec lit queen', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '103', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 70.00, description: 'Chambre double avec lits jumeaux', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '201', room_type: 'triple', capacity_adults: 3, capacity_children: 1, base_price: 95.00, description: 'Chambre triple familiale', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Réfrigérateur'], is_active: true },
      { hotel_id: '22222222-2222-2222-2222-222222222222', room_number: '301', room_type: 'suite', capacity_adults: 2, capacity_children: 1, base_price: 130.00, description: 'Suite avec espace bureau et salon', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Bureau', 'Salon'], is_active: true },

      // Moroni Prince (33333333-3333-3333-3333-333333333333)
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '1', room_type: 'single', capacity_adults: 1, capacity_children: 0, base_price: 30.00, description: 'Chambre simple avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire'], is_active: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '2', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_active: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '3', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_active: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '4', room_type: 'family', capacity_adults: 4, capacity_children: 2, base_price: 70.00, description: 'Chambre familiale avec 2 lits doubles', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV', 'Réfrigérateur'], is_active: true },

      // Itsandra Beach (44444444-4444-4444-4444-444444444444)
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B1', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 110.00, description: 'Bungalow avec vue jardin tropical', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], is_active: true, view: 'garden' },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B2', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 110.00, description: 'Bungalow avec vue jardin tropical', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], is_active: true, view: 'garden' },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B3', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 145.00, description: 'Bungalow face à la mer avec terrasse', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], is_active: true, view: 'sea' },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B4', room_type: 'deluxe', capacity_adults: 2, capacity_children: 1, base_price: 145.00, description: 'Bungalow face à la mer avec terrasse', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], is_active: true, view: 'sea' },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B5', room_type: 'family', capacity_adults: 4, capacity_children: 2, base_price: 210.00, description: 'Grand bungalow avec 2 chambres', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Cuisine équipée'], is_active: true },
      { hotel_id: '44444444-4444-4444-4444-444444444444', room_number: 'B10', room_type: 'suite', capacity_adults: 2, capacity_children: 0, base_price: 195.00, description: 'Bungalow romantique avec jacuzzi privé', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Jacuzzi', 'Champagne offert'], is_active: true, view: 'sea' },

      // Al Amal (55555555-5555-5555-5555-555555555555)
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '101', room_type: 'single', capacity_adults: 1, capacity_children: 0, base_price: 50.00, description: 'Chambre pour escale rapide, lit simple', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], is_active: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '102', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 65.00, description: 'Chambre pour escale, lit double', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], is_active: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '201', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_active: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '202', room_type: 'standard', capacity_adults: 2, capacity_children: 0, base_price: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_active: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '301', room_type: 'suite', capacity_adults: 2, capacity_children: 1, base_price: 120.00, description: 'Suite avec salon et espace bureau séparé', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau', 'Salon', 'Minibar', 'Coffre-fort', 'Peignoirs'], is_active: true }
    ];

    console.log(`📝 Insertion de ${rooms.length} chambres...`);
    let successCount = 0;
    let errorCount = 0;

    for (const room of rooms) {
      const { error } = await supabase.from('rooms').insert(room);
      if (error) {
        console.error(`❌ Chambre ${room.room_number}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Chambre ${room.room_number} créée`);
        successCount++;
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`✅ ${successCount} chambres créées avec succès`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }

    // Vérification finale
    const { count: totalRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .in('hotel_id', [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
      ]);

    console.log(`\n🎉 Total chambres dans la base: ${totalRooms || 0}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
