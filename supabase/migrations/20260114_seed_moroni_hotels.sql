-- Seed: Hôtels de Moroni (Comores) avec chambres
-- Date: 2026-01-14

-- 1. GOLDEN TULIP GRANDE COMORE MORONI
INSERT INTO hotels (
  id,
  name,
  slug,
  description,
  description_en,
  short_description,
  address,
  city,
  zip_code,
  country,
  latitude,
  longitude,
  phone,
  email,
  website,
  check_in_time,
  check_out_time,
  reception_24h,
  stars,
  chain_name,
  is_independent,
  labels,
  certifications,
  images,
  cover_image,
  amenities,
  is_active,
  is_featured,
  average_rating,
  total_reviews,
  commission_rate,
  owner_id,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Golden Tulip Grande Comore Moroni',
  'golden-tulip-grande-comore-moroni',
  'Hôtel 4 étoiles situé face à l''océan Indien avec piscine et restaurant. Le Golden Tulip offre une vue imprenable sur la mer et des chambres climatisées luxueuses.',
  '4-star hotel facing the Indian Ocean with pool and restaurant. Golden Tulip offers stunning sea views and luxurious air-conditioned rooms.',
  'Hôtel 4 étoiles face à l''océan avec piscine et restaurant',
  'Route de l''Aéroport, BP 4041',
  'Moroni',
  'BP 4041',
  'Comores',
  -11.7042,
  43.2551,
  '+269 773 10 08',
  'contact@goldentulipmoroni.com',
  'https://goldentulipmoroni.com',
  '14:00:00',
  '12:00:00',
  true,
  4,
  'Golden Tulip',
  false,
  ARRAY['Vue mer', 'Business', 'Luxe'],
  ARRAY['ISO 9001', 'Écolabel'],
  ARRAY['https://example.com/golden-tulip-1.jpg', 'https://example.com/golden-tulip-2.jpg'],
  'https://example.com/golden-tulip-cover.jpg',
  ARRAY['WiFi gratuit', 'Piscine', 'Restaurant', 'Bar', 'Spa', 'Salle de sport', 'Parking gratuit', 'Service en chambre', 'Climatisation', 'Coffre-fort'],
  true,
  true,
  4.5,
  127,
  12.0,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
);

-- Chambres Golden Tulip
INSERT INTO rooms (hotel_id, room_number, type, capacity, price_per_night, description, amenities, is_available) VALUES
('11111111-1111-1111-1111-111111111111', '101', 'Chambre Standard', 2, 85.00, 'Chambre standard avec vue jardin, lit double', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('11111111-1111-1111-1111-111111111111', '102', 'Chambre Standard', 2, 85.00, 'Chambre standard avec vue jardin, lits jumeaux', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('11111111-1111-1111-1111-111111111111', '201', 'Chambre Deluxe Vue Mer', 2, 120.00, 'Chambre deluxe avec vue mer, lit king size', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], true),
('11111111-1111-1111-1111-111111111111', '202', 'Chambre Deluxe Vue Mer', 2, 120.00, 'Chambre deluxe avec vue mer, lit king size', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort'], true),
('11111111-1111-1111-1111-111111111111', '301', 'Suite Junior', 3, 175.00, 'Suite junior avec salon, vue mer panoramique', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Balcon', 'Coffre-fort', 'Salon'], true),
('11111111-1111-1111-1111-111111111111', '401', 'Suite Présidentielle', 4, 300.00, 'Suite présidentielle avec 2 chambres, terrasse privée', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Salon', 'Jacuzzi'], true);

-- 2. RETAJ MORONI HOTEL
INSERT INTO hotels (
  id, name, slug, description, description_en, short_description,
  address, city, zip_code, country, latitude, longitude,
  phone, email, website,
  check_in_time, check_out_time, reception_24h,
  stars, chain_name, is_independent, labels, certifications,
  images, cover_image, amenities,
  is_active, is_featured, average_rating, total_reviews, commission_rate,
  owner_id, created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Retaj Moroni Hotel',
  'retaj-moroni-hotel',
  'Hôtel moderne 3 étoiles au cœur de Moroni, proche du centre-ville et des commerces. Parfait pour les voyageurs d''affaires et les touristes.',
  'Modern 3-star hotel in the heart of Moroni, close to downtown and shops. Perfect for business travelers and tourists.',
  'Hôtel moderne 3 étoiles au centre de Moroni',
  'Boulevard de la Corniche',
  'Moroni',
  'BP 2567',
  'Comores',
  -11.7056,
  43.2547,
  '+269 773 25 30',
  'info@retajmoroni.com',
  'https://retajmoroni.com',
  '15:00:00',
  '11:00:00',
  true,
  3,
  'Retaj Hotels',
  false,
  ARRAY['Business', 'Centre-ville'],
  ARRAY['Halal'],
  ARRAY['https://example.com/retaj-1.jpg', 'https://example.com/retaj-2.jpg'],
  'https://example.com/retaj-cover.jpg',
  ARRAY['WiFi gratuit', 'Restaurant', 'Bar', 'Salle de réunion', 'Parking', 'Service en chambre', 'Climatisation', 'Blanchisserie'],
  true,
  false,
  4.2,
  89,
  15.0,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
);

-- Chambres Retaj
INSERT INTO rooms (hotel_id, room_number, type, capacity, price_per_night, description, amenities, is_available) VALUES
('22222222-2222-2222-2222-222222222222', '101', 'Chambre Simple', 1, 55.00, 'Chambre simple confortable, lit simple', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau'], true),
('22222222-2222-2222-2222-222222222222', '102', 'Chambre Double', 2, 70.00, 'Chambre double avec lit queen', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('22222222-2222-2222-2222-222222222222', '103', 'Chambre Double', 2, 70.00, 'Chambre double avec lits jumeaux', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar'], true),
('22222222-2222-2222-2222-222222222222', '201', 'Chambre Triple', 3, 95.00, 'Chambre triple familiale', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Réfrigérateur'], true),
('22222222-2222-2222-2222-222222222222', '301', 'Suite Business', 2, 130.00, 'Suite avec espace bureau et salon', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Bureau', 'Salon'], true);

-- 3. HOTEL MORONI PRINCE
INSERT INTO hotels (
  id, name, slug, description, description_en, short_description,
  address, city, zip_code, country, latitude, longitude,
  phone, email, website,
  check_in_time, check_out_time, reception_24h,
  stars, is_independent, labels,
  images, cover_image, amenities,
  is_active, is_featured, average_rating, total_reviews, commission_rate,
  owner_id, created_at, updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Hôtel Moroni Prince',
  'hotel-moroni-prince',
  'Hôtel boutique 2 étoiles offrant un excellent rapport qualité-prix. Idéal pour les budgets moyens avec un service personnalisé.',
  'Boutique 2-star hotel offering excellent value for money. Ideal for medium budgets with personalized service.',
  'Hôtel boutique 2 étoiles, excellent rapport qualité-prix',
  'Rue du Marché, Centre-ville',
  'Moroni',
  'BP 1234',
  'Comores',
  -11.7022,
  43.2562,
  '+269 773 18 45',
  'contact@moroniprince.com',
  NULL,
  '14:00:00',
  '11:00:00',
  false,
  2,
  true,
  ARRAY['Budget', 'Centre-ville', 'Familial'],
  ARRAY['https://example.com/prince-1.jpg'],
  'https://example.com/prince-cover.jpg',
  ARRAY['WiFi gratuit', 'Petit-déjeuner inclus', 'Parking', 'Ventilateur', 'Terrasse commune'],
  true,
  false,
  3.8,
  45,
  18.0,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
);

-- Chambres Moroni Prince
INSERT INTO rooms (hotel_id, room_number, type, capacity, price_per_night, description, amenities, is_available) VALUES
('33333333-3333-3333-3333-333333333333', '1', 'Chambre Économique', 1, 30.00, 'Chambre simple avec ventilateur', ARRAY['WiFi', 'Ventilateur', 'Moustiquaire'], true),
('33333333-3333-3333-3333-333333333333', '2', 'Chambre Standard', 2, 45.00, 'Chambre double avec ventilateur', ARRAY['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], true),
('33333333-3333-3333-3333-333333333333', '3', 'Chambre Standard', 2, 45.00, 'Chambre double avec ventilateur', ARRAY['WiFi', 'Ventilateur', 'Moustiquaire', 'TV'], true),
('33333333-3333-3333-3333-333333333333', '4', 'Chambre Familiale', 4, 70.00, 'Chambre familiale avec 2 lits doubles', ARRAY['WiFi', 'Ventilateur', 'Moustiquaire', 'TV', 'Réfrigérateur'], true);

-- 4. ITSANDRA BEACH HOTEL
INSERT INTO hotels (
  id, name, slug, description, description_en, short_description,
  address, city, zip_code, country, latitude, longitude,
  phone, email, website,
  check_in_time, check_out_time, reception_24h,
  stars, is_independent, labels, certifications,
  images, cover_image, amenities,
  is_active, is_featured, average_rating, total_reviews, commission_rate,
  owner_id, created_at, updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Itsandra Beach Hotel',
  'itsandra-beach-hotel',
  'Resort 4 étoiles sur la plage d''Itsandra, à 5km de Moroni. Bungalows avec accès direct à la plage, activités nautiques et restaurant les pieds dans le sable.',
  '4-star beach resort in Itsandra, 5km from Moroni. Bungalows with direct beach access, water sports and beachfront restaurant.',
  'Resort 4 étoiles sur la plage avec bungalows',
  'Plage d''Itsandra',
  'Moroni',
  'BP 3890',
  'Comores',
  -11.6789,
  43.2634,
  '+269 773 42 67',
  'reservation@itsandrabeach.com',
  'https://itsandrabeach.com',
  '15:00:00',
  '12:00:00',
  true,
  4,
  true,
  ARRAY['Plage', 'Resort', 'Sports nautiques', 'Romantique'],
  ARRAY['Green Key'],
  ARRAY['https://example.com/itsandra-1.jpg', 'https://example.com/itsandra-2.jpg', 'https://example.com/itsandra-3.jpg'],
  'https://example.com/itsandra-cover.jpg',
  ARRAY['WiFi gratuit', 'Piscine', 'Restaurant', 'Bar de plage', 'Sports nautiques', 'Plongée', 'Parking gratuit', 'Service en chambre', 'Climatisation', 'Spa'],
  true,
  true,
  4.7,
  156,
  10.0,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
);

-- Chambres Itsandra Beach
INSERT INTO rooms (hotel_id, room_number, type, capacity, price_per_night, description, amenities, is_available) VALUES
('44444444-4444-4444-4444-444444444444', 'B1', 'Bungalow Jardin', 2, 110.00, 'Bungalow avec vue jardin tropical', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], true),
('44444444-4444-4444-4444-444444444444', 'B2', 'Bungalow Jardin', 2, 110.00, 'Bungalow avec vue jardin tropical', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort'], true),
('44444444-4444-4444-4444-444444444444', 'B3', 'Bungalow Vue Mer', 2, 145.00, 'Bungalow face à la mer avec terrasse', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], true),
('44444444-4444-4444-4444-444444444444', 'B4', 'Bungalow Vue Mer', 2, 145.00, 'Bungalow face à la mer avec terrasse', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Hamac'], true),
('44444444-4444-4444-4444-444444444444', 'B5', 'Bungalow Familial', 4, 210.00, 'Grand bungalow avec 2 chambres', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Cuisine équipée'], true),
('44444444-4444-4444-4444-444444444444', 'B10', 'Bungalow Lune de Miel', 2, 195.00, 'Bungalow romantique avec jacuzzi privé', ARRAY['WiFi', 'TV', 'Climatisation', 'Minibar', 'Terrasse privée', 'Coffre-fort', 'Jacuzzi', 'Champagne offert'], true);

-- 5. AL AMAL HOTEL
INSERT INTO hotels (
  id, name, slug, description, description_en, short_description,
  address, city, zip_code, country, latitude, longitude,
  phone, email,
  check_in_time, check_out_time, reception_24h,
  stars, is_independent, labels,
  images, cover_image, amenities,
  is_active, is_featured, average_rating, total_reviews, commission_rate,
  owner_id, created_at, updated_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Al Amal Hotel',
  'al-amal-hotel',
  'Hôtel 3 étoiles près de l''aéroport international de Moroni. Idéal pour les escales et courts séjours avec navette aéroport gratuite.',
  '3-star hotel near Moroni International Airport. Ideal for stopovers and short stays with free airport shuttle.',
  'Hôtel 3 étoiles proche aéroport avec navette gratuite',
  'Route de l''Aéroport Prince Said Ibrahim',
  'Moroni',
  'BP 5678',
  'Comores',
  -11.7145,
  43.2718,
  '+269 773 55 12',
  'info@alamalhotel.km',
  '00:00:00',
  '13:00:00',
  true,
  3,
  true,
  ARRAY['Aéroport', 'Transit', 'Business'],
  ARRAY['https://example.com/alamal-1.jpg'],
  'https://example.com/alamal-cover.jpg',
  ARRAY['WiFi gratuit', 'Restaurant', 'Navette aéroport gratuite', 'Parking gratuit', 'Service en chambre 24h', 'Climatisation', 'Bureau', 'Petit-déjeuner 24h'],
  true,
  false,
  4.0,
  67,
  15.0,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW(),
  NOW()
);

-- Chambres Al Amal
INSERT INTO rooms (hotel_id, room_number, type, capacity, price_per_night, description, amenities, is_available) VALUES
('55555555-5555-5555-5555-555555555555', '101', 'Chambre Transit Simple', 1, 50.00, 'Chambre pour escale rapide, lit simple', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], true),
('55555555-5555-5555-5555-555555555555', '102', 'Chambre Transit Double', 2, 65.00, 'Chambre pour escale, lit double', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau', 'Réveil garanti'], true),
('55555555-5555-5555-5555-555555555555', '201', 'Chambre Business', 2, 80.00, 'Chambre avec grand bureau et fauteuil confort', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], true),
('55555555-5555-5555-5555-555555555555', '202', 'Chambre Business', 2, 80.00, 'Chambre avec grand bureau et fauteuil confort', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau XXL', 'Imprimante', 'Coffre-fort'], true),
('55555555-5555-5555-5555-555555555555', '301', 'Suite Executive', 2, 120.00, 'Suite avec salon et espace bureau séparé', ARRAY['WiFi', 'TV', 'Climatisation', 'Bureau', 'Salon', 'Minibar', 'Coffre-fort', 'Peignoirs'], true);

-- Afficher un résumé
SELECT
  'Hôtels créés' as type,
  COUNT(*) as total
FROM hotels
WHERE city = 'Moroni'
UNION ALL
SELECT
  'Chambres créées' as type,
  COUNT(*) as total
FROM rooms
WHERE hotel_id IN (
  SELECT id FROM hotels WHERE city = 'Moroni'
);
