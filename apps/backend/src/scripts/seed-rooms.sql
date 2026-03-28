-- Script SQL pour créer des chambres pour chaque hôtel
-- À exécuter dans Supabase SQL Editor

-- Chambres pour Le Bristol Paris (Palace 5 étoiles)
INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '101' as room_number,
  'deluxe' as room_type,
  'Chambre Deluxe avec vue sur la ville, lit king size et salle de bain en marbre' as description,
  450 as base_price,
  2 as capacity_adults,
  1 as capacity_children,
  0 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso'] as amenities,
  'city' as view_type,
  35 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '102' as room_number,
  'deluxe' as room_type,
  'Chambre Deluxe avec vue jardin, décoration élégante' as description,
  480 as base_price,
  2 as capacity_adults,
  1 as capacity_children,
  0 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso'] as amenities,
  'garden' as view_type,
  38 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '201' as room_number,
  'suite' as room_type,
  'Suite Junior avec salon séparé et vue panoramique' as description,
  750 as base_price,
  2 as capacity_adults,
  2 as capacity_children,
  1 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Bureau'] as amenities,
  'city' as view_type,
  55 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '202' as room_number,
  'suite' as room_type,
  'Suite Junior avec balcon privé' as description,
  780 as base_price,
  2 as capacity_adults,
  2 as capacity_children,
  1 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Balcon'] as amenities,
  'city' as view_type,
  58 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '301' as room_number,
  'suite' as room_type,
  'Suite Exécutive avec salon, salle à manger et vue exceptionnelle' as description,
  1200 as base_price,
  3 as capacity_adults,
  2 as capacity_children,
  1 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Salle à manger', 'Bureau', 'Terrasse'] as amenities,
  'city' as view_type,
  85 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
SELECT
  id as hotel_id,
  '401' as room_number,
  'presidential' as room_type,
  'Suite Présidentielle avec 2 chambres, salon, salle à manger et terrasse privée' as description,
  2500 as base_price,
  4 as capacity_adults,
  2 as capacity_children,
  1 as capacity_infants,
  ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Salle à manger', 'Bureau', 'Terrasse', 'Jacuzzi', 'Majordome'] as amenities,
  'city' as view_type,
  150 as surface_m2,
  true as is_active
FROM hotels WHERE slug = 'le-bristol-paris';

-- Répéter pour les autres hôtels de luxe (5 étoiles)
-- Pour générer automatiquement pour tous les hôtels 5 étoiles, voici une fonction:

DO $$
DECLARE
  hotel_record RECORD;
BEGIN
  -- Pour chaque hôtel 5 étoiles qui n'a pas encore de chambres
  FOR hotel_record IN
    SELECT h.id, h.name, h.slug
    FROM hotels h
    WHERE h.stars >= 5
    AND h.slug != 'le-bristol-paris'
    AND NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = h.id)
  LOOP
    -- Chambre 101 - Deluxe vue ville
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '101',
      'deluxe',
      'Chambre Deluxe avec vue sur la ville, lit king size et salle de bain en marbre',
      450,
      2,
      1,
      0,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso'],
      'city',
      35,
      true
    );

    -- Chambre 102 - Deluxe vue jardin
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '102',
      'deluxe',
      'Chambre Deluxe avec vue jardin, décoration élégante',
      480,
      2,
      1,
      0,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso'],
      'garden',
      38,
      true
    );

    -- Chambre 201 - Suite Junior
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '201',
      'suite',
      'Suite Junior avec salon séparé et vue panoramique',
      750,
      2,
      2,
      1,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Bureau'],
      'city',
      55,
      true
    );

    -- Chambre 202 - Suite Junior avec balcon
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '202',
      'suite',
      'Suite Junior avec balcon privé',
      780,
      2,
      2,
      1,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Balcon'],
      'city',
      58,
      true
    );

    -- Chambre 301 - Suite Exécutive
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '301',
      'suite',
      'Suite Exécutive avec salon, salle à manger et vue exceptionnelle',
      1200,
      3,
      2,
      1,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Salle à manger', 'Bureau', 'Terrasse'],
      'city',
      85,
      true
    );

    -- Chambre 401 - Suite Présidentielle
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '401',
      'presidential',
      'Suite Présidentielle avec 2 chambres, salon, salle à manger et terrasse privée',
      2500,
      4,
      2,
      1,
      ARRAY['WiFi gratuit', 'TV 4K', 'Climatisation', 'Minibar premium', 'Coffre-fort', 'Peignoirs', 'Nespresso', 'Salon', 'Salle à manger', 'Bureau', 'Terrasse', 'Jacuzzi', 'Majordome'],
      'city',
      150,
      true
    );

    RAISE NOTICE 'Chambres créées pour: %', hotel_record.name;
  END LOOP;
END $$;

-- Pour les hôtels 4 étoiles
DO $$
DECLARE
  hotel_record RECORD;
BEGIN
  FOR hotel_record IN
    SELECT h.id, h.name, h.slug
    FROM hotels h
    WHERE h.stars = 4
    AND NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = h.id)
  LOOP
    -- Chambre 101 - Double Standard
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '101',
      'double',
      'Chambre Double Standard avec lit queen size',
      120,
      2,
      0,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort'],
      25,
      true
    );

    -- Chambre 102 - Double Confort
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, view_type, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '102',
      'double',
      'Chambre Double Confort avec vue',
      140,
      2,
      1,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Balcon'],
      'city',
      28,
      true
    );

    -- Chambre 103 - Twin
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '103',
      'twin',
      'Chambre Twin avec lits jumeaux',
      130,
      2,
      0,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort'],
      26,
      true
    );

    -- Chambre 201 - Familiale
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '201',
      'family',
      'Chambre Familiale avec espace séparé pour enfants',
      180,
      2,
      2,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Canapé-lit'],
      35,
      true
    );

    -- Chambre 301 - Suite Junior
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '301',
      'suite',
      'Suite Junior avec coin salon',
      250,
      2,
      1,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Minibar', 'Coffre-fort', 'Salon', 'Peignoirs'],
      45,
      true
    );

    RAISE NOTICE 'Chambres créées pour: %', hotel_record.name;
  END LOOP;
END $$;

-- Pour les hôtels 3 étoiles et moins
DO $$
DECLARE
  hotel_record RECORD;
BEGIN
  FOR hotel_record IN
    SELECT h.id, h.name, h.slug
    FROM hotels h
    WHERE h.stars < 4
    AND NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = h.id)
  LOOP
    -- Chambre 101 - Simple
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '101',
      'single',
      'Chambre Simple avec lit simple',
      60,
      1,
      0,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Bureau'],
      15,
      true
    );

    -- Chambre 102 - Double Standard
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '102',
      'double',
      'Chambre Double Standard',
      85,
      2,
      0,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation'],
      20,
      true
    );

    -- Chambre 103 - Double avec balcon
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '103',
      'double',
      'Chambre Double avec balcon',
      95,
      2,
      0,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation', 'Balcon'],
      22,
      true
    );

    -- Chambre 201 - Triple
    INSERT INTO rooms (hotel_id, room_number, room_type, description, base_price, capacity_adults, capacity_children, capacity_infants, amenities, surface_m2, is_active)
    VALUES (
      hotel_record.id,
      '201',
      'triple',
      'Chambre Triple pour 3 personnes',
      110,
      3,
      1,
      0,
      ARRAY['WiFi gratuit', 'TV', 'Climatisation'],
      25,
      true
    );

    RAISE NOTICE 'Chambres créées pour: %', hotel_record.name;
  END LOOP;
END $$;

-- Vérifier le résultat
SELECT
  h.name as hotel_name,
  h.stars,
  COUNT(r.id) as nombre_chambres
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = true
GROUP BY h.id, h.name, h.star_rating
ORDER BY h.star_rating DESC, h.name;
