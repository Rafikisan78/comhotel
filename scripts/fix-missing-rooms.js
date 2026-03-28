const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qbmmmkceevwbifvwnlfx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFibW1ta2NlZXZ3YmlmdndubGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzExMzM4OCwiZXhwIjoyMDgyNjg5Mzg4fQ.X1jL44bBFcMTTN4-Aii6TyBPCUAdumJ4lrrQdHaY8Ao';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔧 Correction des chambres manquantes...\n');

  try {
    const missingRooms = [
      // Golden Tulip - changé "standard" vers "twin"
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '101', room_type: 'twin', capacity_adults: 2, capacity_children: 0, base_price: 85.00, description: 'Chambre standard avec vue jardin, lit double', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },
      { hotel_id: '11111111-1111-1111-1111-111111111111', room_number: '102', room_type: 'twin', capacity_adults: 2, capacity_children: 0, base_price: 85.00, description: 'Chambre standard avec vue jardin, lits jumeaux', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], is_active: true },

      // Moroni Prince - changé "standard" vers "double"
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '2', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_active: true },
      { hotel_id: '33333333-3333-3333-3333-333333333333', room_number: '3', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 45.00, description: 'Chambre double avec ventilateur', amenities: ['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], is_active: true },

      // Al Amal - changé "standard" vers "double"
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '201', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_active: true },
      { hotel_id: '55555555-5555-5555-5555-555555555555', room_number: '202', room_type: 'double', capacity_adults: 2, capacity_children: 0, base_price: 80.00, description: 'Chambre avec grand bureau et fauteuil confort', amenities: ['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], is_active: true }
    ];

    console.log(`📝 Insertion de ${missingRooms.length} chambres manquantes...`);
    let successCount = 0;

    for (const room of missingRooms) {
      const { error } = await supabase.from('rooms').insert(room);
      if (error) {
        console.error(`❌ Chambre ${room.room_number}:`, error.message);
      } else {
        console.log(`✅ Chambre ${room.room_number} créée`);
        successCount++;
      }
    }

    console.log(`\n📊 Résumé: ${successCount}/${missingRooms.length} chambres créées`);

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

    console.log(`\n🎉 Total chambres dans la base: ${totalRooms || 0}/26`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
