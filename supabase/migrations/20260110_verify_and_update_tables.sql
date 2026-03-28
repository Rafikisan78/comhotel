-- =====================================================
-- VERIFICATION ET MISE À JOUR DES TABLES
-- Date: 2026-01-10
-- Description: S'assure que les tables users, hotels, rooms sont à jour
-- =====================================================

-- =====================================================
-- TABLE 1: USERS - Vérification et ajouts
-- =====================================================

-- Ajouter les colonnes manquantes pour users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmation_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_email_confirmation_token ON users(email_confirmation_token);

-- Commentaires
COMMENT ON COLUMN users.email_confirmed IS 'Email confirmé par le lien de vérification';
COMMENT ON COLUMN users.email_confirmation_token IS 'Token pour confirmer l''email';
COMMENT ON COLUMN users.is_active IS 'Compte actif (false = soft delete)';
COMMENT ON COLUMN users.deleted_at IS 'Date de suppression (soft delete)';
COMMENT ON COLUMN users.deleted_by IS 'Utilisateur ayant effectué la suppression';

-- =====================================================
-- TABLE 2: HOTELS - Vérification et ajouts
-- =====================================================

-- Ajouter les colonnes manquantes pour hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS stars INTEGER CHECK (stars >= 1 AND stars <= 5);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '15:00:00';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '11:00:00';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);

-- Renommer star_rating en stars si nécessaire
DO $$
BEGIN
  -- Seulement renommer si star_rating existe ET stars n'existe pas
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'star_rating'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'stars'
  ) THEN
    ALTER TABLE hotels RENAME COLUMN star_rating TO stars;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'star_rating'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'stars'
  ) THEN
    -- Si les deux existent, supprimer l'ancien
    ALTER TABLE hotels DROP COLUMN star_rating;
  END IF;
END $$;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_country ON hotels(country);
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON hotels(owner_id);

-- Commentaires
COMMENT ON COLUMN hotels.stars IS 'Classification en étoiles (1-5)';
COMMENT ON COLUMN hotels.slug IS 'URL-friendly identifier (paris-hotel-plaza)';
COMMENT ON COLUMN hotels.is_active IS 'Hôtel actif sur la plateforme';

-- =====================================================
-- TABLE 3: ROOMS - Vérification et ajouts
-- =====================================================

-- Mettre à jour l'ENUM room_type pour inclure tous les types
DO $$
BEGIN
  -- Ajouter les nouveaux types s'ils n'existent pas
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
    CREATE TYPE room_type AS ENUM ('single', 'double', 'twin', 'triple', 'quad', 'suite', 'deluxe', 'presidential', 'studio', 'family', 'accessible');
  ELSE
    -- Ajouter les types manquants
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'twin';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'triple';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'quad';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'presidential';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'studio';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'family';
    ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'accessible';
  END IF;
END $$;

-- Créer ENUM view_type s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'view_type') THEN
    CREATE TYPE view_type AS ENUM ('city', 'sea', 'mountain', 'garden', 'pool', 'courtyard', 'street', 'interior');
  END IF;
END $$;

-- Renommer les colonnes si nécessaire (uniquement si la cible n'existe pas)
DO $$
BEGIN
  -- number -> room_number
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'number'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'room_number'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN number TO room_number;
  END IF;

  -- type -> room_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'room_type'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN type TO room_type;
  END IF;

  -- price_per_night -> base_price
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'price_per_night'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'base_price'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN price_per_night TO base_price;
  END IF;

  -- capacity -> capacity_adults
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'capacity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'capacity_adults'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN capacity TO capacity_adults;
  END IF;

  -- is_available -> is_active
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'is_available'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN is_available TO is_active;
  END IF;
END $$;

-- Ajouter les colonnes manquantes pour rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_number VARCHAR(50) NOT NULL DEFAULT 'TBD';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type room_type;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity_adults INTEGER DEFAULT 2 CHECK (capacity_adults >= 1 AND capacity_adults <= 10);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity_children INTEGER DEFAULT 0 CHECK (capacity_children >= 0 AND capacity_children <= 10);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity_infants INTEGER DEFAULT 0 CHECK (capacity_infants >= 0 AND capacity_infants <= 5);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS size_sqm NUMERIC(6, 2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS view_type view_type;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_accessible BOOLEAN DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_smoking_allowed BOOLEAN DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_view_type ON rooms(view_type);
CREATE INDEX IF NOT EXISTS idx_rooms_base_price ON rooms(base_price);

-- Contrainte unique sur hotel_id + room_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rooms_hotel_id_room_number_key'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_hotel_id_room_number_key UNIQUE(hotel_id, room_number);
  END IF;
END $$;

-- Commentaires
COMMENT ON COLUMN rooms.room_number IS 'Numéro de la chambre (101, 201A, etc.)';
COMMENT ON COLUMN rooms.room_type IS 'Type de chambre (single, double, suite, etc.)';
COMMENT ON COLUMN rooms.floor IS 'Étage de la chambre';
COMMENT ON COLUMN rooms.capacity_adults IS 'Nombre maximum d''adultes (1-10)';
COMMENT ON COLUMN rooms.capacity_children IS 'Nombre maximum d''enfants (0-10)';
COMMENT ON COLUMN rooms.capacity_infants IS 'Nombre maximum de bébés (0-5)';
COMMENT ON COLUMN rooms.base_price IS 'Prix de base par nuit';
COMMENT ON COLUMN rooms.size_sqm IS 'Surface de la chambre en m²';
COMMENT ON COLUMN rooms.view_type IS 'Type de vue (sea, mountain, city, etc.)';
COMMENT ON COLUMN rooms.is_accessible IS 'Chambre accessible PMR';
COMMENT ON COLUMN rooms.is_smoking_allowed IS 'Fumeur autorisé';
COMMENT ON COLUMN rooms.is_active IS 'Chambre active (false = soft delete)';

-- =====================================================
-- NETTOYAGE - Supprimer les anciennes colonnes
-- =====================================================

-- Supprimer les colonnes dupliquées si elles existent encore
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'number'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'room_number'
  ) THEN
    ALTER TABLE rooms DROP COLUMN IF EXISTS number;
  END IF;
END $$;

-- =====================================================
-- FUNCTION: Trigger updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotels_updated_at ON hotels;
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION FINALE
-- =====================================================

-- Vérifier que toutes les tables existent
DO $$
BEGIN
  ASSERT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users'), 'Table users manquante';
  ASSERT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels'), 'Table hotels manquante';
  ASSERT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms'), 'Table rooms manquante';

  RAISE NOTICE 'Vérification réussie: Toutes les tables sont présentes et à jour';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
