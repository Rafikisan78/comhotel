-- Migration: Ajouter le verrouillage temporaire aux reservations (EPIC 1)
-- Ajoute la colonne locked_until et le statut expired

-- 1. Ajouter la colonne locked_until a la table bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 2. Ajouter le statut 'expired' a l'enum booking_status si pas deja present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'expired'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'expired';
  END IF;
END
$$;

-- 3. Index pour accelerer la recherche des verrous expires
CREATE INDEX IF NOT EXISTS idx_bookings_locked_until
  ON bookings (locked_until)
  WHERE status = 'pending_payment' AND locked_until IS NOT NULL;

-- 4. Index pour les requetes de conflit par statut
CREATE INDEX IF NOT EXISTS idx_bookings_room_status_dates
  ON bookings (room_id, status, check_in, check_out);

COMMENT ON COLUMN bookings.locked_until IS 'Date/heure d''expiration du verrou temporaire (15 minutes apres creation)';
