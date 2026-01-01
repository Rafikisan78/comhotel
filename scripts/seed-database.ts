import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Seed users
    const { error: usersError } = await supabase.from('users').insert([
      {
        email: 'admin@comhotel.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      },
      {
        email: 'owner@comhotel.com',
        first_name: 'Hotel',
        last_name: 'Owner',
        role: 'hotel_owner',
      },
      {
        email: 'guest@comhotel.com',
        first_name: 'Guest',
        last_name: 'User',
        role: 'guest',
      },
    ]);

    if (usersError) throw usersError;
    console.log('✅ Users seeded');

    // Seed hotels
    const { error: hotelsError } = await supabase.from('hotels').insert([
      {
        name: 'Grand Hotel Paris',
        description: 'Luxurious hotel in the heart of Paris',
        address: '123 Champs-Élysées',
        city: 'Paris',
        country: 'France',
        zip_code: '75008',
        star_rating: 5,
      },
      {
        name: 'Hotel Moderne Lyon',
        description: 'Modern hotel with great amenities',
        address: '45 Rue de la République',
        city: 'Lyon',
        country: 'France',
        zip_code: '69002',
        star_rating: 4,
      },
    ]);

    if (hotelsError) throw hotelsError;
    console.log('✅ Hotels seeded');

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
