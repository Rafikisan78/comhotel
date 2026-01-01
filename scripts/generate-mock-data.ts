/**
 * Script pour générer des données de test
 */

interface MockUser {
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'hotel_owner' | 'admin';
}

interface MockHotel {
  name: string;
  city: string;
  country: string;
  starRating: number;
}

export const generateMockUsers = (count: number): MockUser[] => {
  const users: MockUser[] = [];
  const roles: Array<'guest' | 'hotel_owner' | 'admin'> = ['guest', 'hotel_owner', 'admin'];

  for (let i = 0; i < count; i++) {
    users.push({
      email: `user${i}@example.com`,
      firstName: `FirstName${i}`,
      lastName: `LastName${i}`,
      role: roles[i % 3],
    });
  }

  return users;
};

export const generateMockHotels = (count: number): MockHotel[] => {
  const hotels: MockHotel[] = [];
  const cities = ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux'];
  const names = ['Grand Hotel', 'Hotel Moderne', 'Hotel de Luxe', 'Hotel Central'];

  for (let i = 0; i < count; i++) {
    hotels.push({
      name: `${names[i % names.length]} ${cities[i % cities.length]}`,
      city: cities[i % cities.length],
      country: 'France',
      starRating: (i % 5) + 1,
    });
  }

  return hotels;
};

// Exécution du script
if (require.main === module) {
  console.log('Génération de données de test...');
  const users = generateMockUsers(10);
  const hotels = generateMockHotels(20);

  console.log(`✅ ${users.length} utilisateurs générés`);
  console.log(`✅ ${hotels.length} hôtels générés`);
}
