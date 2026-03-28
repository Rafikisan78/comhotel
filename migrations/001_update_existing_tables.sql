-- =====================================================
-- MIGRATION 001 - MISE À JOUR DES TABLES EXISTANTES
-- Date: 2026-01-02
-- Description: Migration prudente des tables existantes uniquement
-- Objectif: Préparer le terrain pour les fonctionnalités v2.0
-- =====================================================

-- IMPORTANT: Cette migration ne touche QUE aux tables existantes
-- Les nouvelles tables seront créées dans une migration ultérieure

BEGIN;

-- =====================================================
-- VÉRIFICATION PRÉALABLE
-- =====================================================

-- Vérifier que les tables existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE EXCEPTION 'Table users n''existe pas';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotels') THEN
    RAISE EXCEPTION 'Table hotels n''existe pas';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rooms') THEN
    RAISE EXCEPTION 'Table rooms n''existe pas';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    RAISE EXCEPTION 'Table bookings n''existe pas';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    RAISE EXCEPTION 'Table payments n''existe pas';
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
    RAISE EXCEPTION 'Table reviews n''existe pas';
  END IF;

  RAISE NOTICE 'Toutes les tables existent, migration OK';
END $$;

-- =====================================================
-- TYPES ENUM - CRÉATION OU MISE À JOUR
-- =====================================================

-- Type de chambre (étendu)
DO $$ BEGIN
  CREATE TYPE room_type AS ENUM (
    'single',
    'double',
    'twin',
    'triple',
    'quad',
    'suite',
    'deluxe',
    'family',
    'connecting',
    'studio',
    'apartment'
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type room_type existe déjà, conservation de l''existant';
END $$;

-- Type de vue
DO $$ BEGIN
  CREATE TYPE view_type AS ENUM (
    'sea',
    'ocean',
    'lake',
    'mountain',
    'garden',
    'pool',
    'city',
    'courtyard',
    'street',
    'internal'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut de réservation
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending_payment',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled_by_customer',
    'cancelled_by_hotel',
    'no_show'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut de paiement
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending',
    'authorized',
    'captured',
    'partially_refunded',
    'refunded',
    'failed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Canal de distribution
DO $$ BEGIN
  CREATE TYPE distribution_channel AS ENUM (
    'direct_website',
    'booking_com',
    'expedia',
    'airbnb',
    'hotels_com',
    'agoda',
    'travel_agency',
    'walk_in',
    'corporate',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Politique d'annulation
DO $$ BEGIN
  CREATE TYPE cancellation_policy AS ENUM (
    'flexible',
    'moderate',
    'strict',
    'super_strict',
    'non_refundable'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Rôle utilisateur (étendu)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin',
    'hotel_owner',
    'hotel_manager',
    'receptionist',
    'guest'
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type user_role existe déjà, conservation de l''existant';
END $$;

-- =====================================================
-- TABLE 1: USERS - AJOUT DE COLONNES
-- =====================================================

-- Ajout des nouvelles colonnes si elles n'existent pas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(5),
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS currency_preference VARCHAR(3) DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_vat VARCHAR(50),
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20) DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Commentaires
COMMENT ON COLUMN users.phone_country_code IS 'Code pays du téléphone (+33, +1, +44)';
COMMENT ON COLUMN users.language_preference IS 'Langue préférée (fr, en, es, de, it)';
COMMENT ON COLUMN users.currency_preference IS 'Devise préférée (EUR, USD, GBP, CHF)';
COMMENT ON COLUMN users.company_name IS 'Nom de société (pour clients B2B)';
COMMENT ON COLUMN users.company_vat IS 'Numéro TVA intracommunautaire';
COMMENT ON COLUMN users.loyalty_points IS 'Points de fidélité accumulés';
COMMENT ON COLUMN users.loyalty_tier IS 'Niveau de fidélité (bronze, silver, gold)';
COMMENT ON COLUMN users.email_verified_at IS 'Date de vérification de l''email';
COMMENT ON COLUMN users.phone_verified_at IS 'Date de vérification du téléphone';
COMMENT ON COLUMN users.last_login_at IS 'Date de dernière connexion';
COMMENT ON COLUMN users.preferences IS 'Préférences utilisateur (JSON: étage, vue, oreiller, etc.)';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language_preference);
CREATE INDEX IF NOT EXISTS idx_users_loyalty_tier ON users(loyalty_tier);

DO $$ BEGIN
  RAISE NOTICE 'Table users mise à jour avec succès';
END $$;

-- =====================================================
-- TABLE 2: HOTELS - AJOUT DE COLONNES
-- =====================================================

ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT,
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '15:00:00',
ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '11:00:00',
ADD COLUMN IF NOT EXISTS reception_24h BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reception_hours JSONB,
ADD COLUMN IF NOT EXISTS arrival_instructions TEXT,
ADD COLUMN IF NOT EXISTS chain_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_independent BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500),
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS virtual_tour_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 15.00;

-- Contrainte d'unicité sur slug
DO $$ BEGIN
  ALTER TABLE hotels ADD CONSTRAINT hotels_slug_unique UNIQUE (slug);
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- Commentaires
COMMENT ON COLUMN hotels.check_in_time IS 'Heure de check-in par défaut (15:00)';
COMMENT ON COLUMN hotels.check_out_time IS 'Heure de check-out par défaut (11:00)';
COMMENT ON COLUMN hotels.reception_hours IS 'Horaires de réception par jour (JSON)';
COMMENT ON COLUMN hotels.labels IS 'Labels officiels (Eco-label, Qualité Tourisme, etc.)';
COMMENT ON COLUMN hotels.certifications IS 'Certifications (ISO, Green Globe, etc.)';
COMMENT ON COLUMN hotels.slug IS 'URL-friendly identifier (paris-hotel-plaza)';
COMMENT ON COLUMN hotels.commission_rate IS 'Taux de commission plateforme en %';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_is_featured ON hotels(is_featured);
CREATE INDEX IF NOT EXISTS idx_hotels_average_rating ON hotels(average_rating);

DO $$ BEGIN
  RAISE NOTICE 'Table hotels mise à jour avec succès';
END $$;

-- =====================================================
-- TABLE 3: ROOMS - AJOUT DE COLONNES
-- =====================================================

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_es VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_de VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT,
ADD COLUMN IF NOT EXISTS surface_m2 NUMERIC(6, 2),
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS view view_type,
ADD COLUMN IF NOT EXISTS max_adults INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS max_children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_infants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_child_age INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_fee NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS accessible_pmr BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Commentaires
COMMENT ON COLUMN rooms.surface_m2 IS 'Surface de la chambre en m²';
COMMENT ON COLUMN rooms.floor_number IS 'Numéro d''étage';
COMMENT ON COLUMN rooms.view IS 'Type de vue depuis la chambre';
COMMENT ON COLUMN rooms.max_adults IS 'Nombre maximum d''adultes';
COMMENT ON COLUMN rooms.max_children IS 'Nombre maximum d''enfants';
COMMENT ON COLUMN rooms.max_infants IS 'Nombre maximum de bébés';
COMMENT ON COLUMN rooms.free_child_age IS 'Âge maximum pour enfant gratuit (inclus)';
COMMENT ON COLUMN rooms.pet_fee IS 'Supplément animaux par nuit (si pets_allowed=true)';
COMMENT ON COLUMN rooms.total_rooms IS 'Nombre de chambres physiques de ce type';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_rooms_view ON rooms(view) WHERE view IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_pets_allowed ON rooms(pets_allowed);
CREATE INDEX IF NOT EXISTS idx_rooms_accessible_pmr ON rooms(accessible_pmr);

DO $$ BEGIN
  RAISE NOTICE 'Table rooms mise à jour avec succès';
END $$;

-- =====================================================
-- TABLE 4: BOOKINGS - AJOUT DE COLONNES
-- =====================================================

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(20),
ADD COLUMN IF NOT EXISTS status booking_status DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS channel distribution_channel DEFAULT 'direct_website',
ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS infants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS arrival_time TIME,
ADD COLUMN IF NOT EXISTS late_checkout BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS early_checkin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_nights INTEGER,
ADD COLUMN IF NOT EXISTS room_price_per_night NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS extras_total NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS taxes_total NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Contrainte d'unicité sur booking_reference
DO $$ BEGIN
  ALTER TABLE bookings ADD CONSTRAINT bookings_reference_unique UNIQUE (booking_reference);
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- Commentaires
COMMENT ON COLUMN bookings.booking_reference IS 'Référence unique de réservation (ex: BK20260102001)';
COMMENT ON COLUMN bookings.status IS 'Statut de la réservation';
COMMENT ON COLUMN bookings.channel IS 'Canal de distribution (direct, OTA, etc.)';
COMMENT ON COLUMN bookings.total_nights IS 'Nombre de nuits du séjour';
COMMENT ON COLUMN bookings.extras_total IS 'Total des suppléments (petit-déj, parking, etc.)';
COMMENT ON COLUMN bookings.taxes_total IS 'Total des taxes (taxe de séjour, TVA)';
COMMENT ON COLUMN bookings.discount_amount IS 'Montant de la réduction appliquée';
COMMENT ON COLUMN bookings.commission_amount IS 'Commission plateforme ou OTA';
COMMENT ON COLUMN bookings.customer_notes IS 'Notes visibles par le client';
COMMENT ON COLUMN bookings.internal_notes IS 'Notes internes hôtel (non visibles client)';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference) WHERE booking_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_channel ON bookings(channel);

DO $$ BEGIN
  RAISE NOTICE 'Table bookings mise à jour avec succès';
END $$;

-- =====================================================
-- TABLE 5: PAYMENTS - AJOUT DE COLONNES
-- =====================================================

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'card',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Commentaires
COMMENT ON COLUMN payments.payment_method IS 'Méthode de paiement (card, bank_transfer, paypal, cash)';
COMMENT ON COLUMN payments.transaction_id IS 'ID de transaction externe';
COMMENT ON COLUMN payments.refund_amount IS 'Montant remboursé';
COMMENT ON COLUMN payments.refund_reason IS 'Raison du remboursement';
COMMENT ON COLUMN payments.metadata IS 'Métadonnées supplémentaires (JSON)';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

DO $$ BEGIN
  RAISE NOTICE 'Table payments mise à jour avec succès';
END $$;

-- =====================================================
-- TABLE 6: REVIEWS - AJOUT DE COLONNES
-- =====================================================

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS cleanliness_rating INTEGER,
ADD COLUMN IF NOT EXISTS comfort_rating INTEGER,
ADD COLUMN IF NOT EXISTS location_rating INTEGER,
ADD COLUMN IF NOT EXISTS services_rating INTEGER,
ADD COLUMN IF NOT EXISTS value_rating INTEGER,
ADD COLUMN IF NOT EXISTS staff_rating INTEGER,
ADD COLUMN IF NOT EXISTS response_from_hotel TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reported_count INTEGER DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN reviews.cleanliness_rating IS 'Note propreté (1-5)';
COMMENT ON COLUMN reviews.comfort_rating IS 'Note confort (1-5)';
COMMENT ON COLUMN reviews.location_rating IS 'Note emplacement (1-5)';
COMMENT ON COLUMN reviews.services_rating IS 'Note services (1-5)';
COMMENT ON COLUMN reviews.value_rating IS 'Note rapport qualité/prix (1-5)';
COMMENT ON COLUMN reviews.staff_rating IS 'Note personnel (1-5)';
COMMENT ON COLUMN reviews.response_from_hotel IS 'Réponse publique du gérant';
COMMENT ON COLUMN reviews.is_verified IS 'Avis vérifié (client ayant séjourné)';
COMMENT ON COLUMN reviews.is_featured IS 'Avis mis en avant';
COMMENT ON COLUMN reviews.helpful_count IS 'Nombre de votes "utile"';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_reviews_is_verified ON reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);

DO $$ BEGIN
  RAISE NOTICE 'Table reviews mise à jour avec succès';
END $$;

-- =====================================================
-- FONCTION TRIGGER - update_updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VALIDATION FINALE
-- =====================================================

DO $$
DECLARE
  users_new_cols INTEGER;
  hotels_new_cols INTEGER;
  rooms_new_cols INTEGER;
  bookings_new_cols INTEGER;
  payments_new_cols INTEGER;
  reviews_new_cols INTEGER;
BEGIN
  -- Compter les nouvelles colonnes ajoutées
  SELECT COUNT(*) INTO users_new_cols
  FROM information_schema.columns
  WHERE table_name = 'users' AND column_name IN ('phone_country_code', 'language_preference', 'loyalty_points');

  SELECT COUNT(*) INTO hotels_new_cols
  FROM information_schema.columns
  WHERE table_name = 'hotels' AND column_name IN ('slug', 'is_active', 'commission_rate');

  SELECT COUNT(*) INTO rooms_new_cols
  FROM information_schema.columns
  WHERE table_name = 'rooms' AND column_name IN ('surface_m2', 'view', 'total_rooms');

  SELECT COUNT(*) INTO bookings_new_cols
  FROM information_schema.columns
  WHERE table_name = 'bookings' AND column_name IN ('booking_reference', 'status', 'channel');

  SELECT COUNT(*) INTO payments_new_cols
  FROM information_schema.columns
  WHERE table_name = 'payments' AND column_name IN ('payment_method', 'transaction_id', 'metadata');

  SELECT COUNT(*) INTO reviews_new_cols
  FROM information_schema.columns
  WHERE table_name = 'reviews' AND column_name IN ('cleanliness_rating', 'is_verified', 'helpful_count');

  RAISE NOTICE '===========================================';
  RAISE NOTICE 'MIGRATION TERMINÉE AVEC SUCCÈS';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'users: % nouvelles colonnes', users_new_cols;
  RAISE NOTICE 'hotels: % nouvelles colonnes', hotels_new_cols;
  RAISE NOTICE 'rooms: % nouvelles colonnes', rooms_new_cols;
  RAISE NOTICE 'bookings: % nouvelles colonnes', bookings_new_cols;
  RAISE NOTICE 'payments: % nouvelles colonnes', payments_new_cols;
  RAISE NOTICE 'reviews: % nouvelles colonnes', reviews_new_cols;
  RAISE NOTICE '===========================================';

  IF users_new_cols < 3 OR hotels_new_cols < 3 OR rooms_new_cols < 3 OR
     bookings_new_cols < 3 OR payments_new_cols < 3 OR reviews_new_cols < 3 THEN
    RAISE WARNING 'Certaines colonnes n''ont peut-être pas été créées correctement';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- FIN DE LA MIGRATION 001
-- =====================================================
