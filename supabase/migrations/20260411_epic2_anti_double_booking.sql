-- Migration: EPIC 2 — Contrainte d'unicité anti-double réservation
-- US-2.1: Contrainte EXCLUDE pour empêcher les chevauchements
-- US-2.2: Fonction RPC atomique (SELECT FOR UPDATE + INSERT)

-- 1. Ajouter no_show à l'enum si manquant
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';

-- 2. Activer btree_gist (nécessaire pour EXCLUDE avec opérateurs non-btree)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 3. Contrainte EXCLUDE : empêche les réservations chevauchantes sur la même chambre
-- '[)' = check_in inclusif, check_out exclusif (convention hôtelière)
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
  room_id WITH =,
  daterange(check_in, check_out, '[)') WITH &&
) WHERE (status NOT IN ('cancelled', 'expired', 'no_show'));

-- 4. Fonction RPC atomique pour création de réservation sans race condition
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_user_id UUID,
  p_room_id UUID,
  p_hotel_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_adults INTEGER,
  p_children INTEGER DEFAULT 0,
  p_infants INTEGER DEFAULT 0,
  p_guests INTEGER DEFAULT 1,
  p_total_nights INTEGER DEFAULT 1,
  p_room_price_per_night NUMERIC DEFAULT 0,
  p_taxes_total NUMERIC DEFAULT 0,
  p_extras_total NUMERIC DEFAULT 0,
  p_discount_amount NUMERIC DEFAULT 0,
  p_commission_amount NUMERIC DEFAULT 0,
  p_total_price NUMERIC DEFAULT 0,
  p_booking_reference VARCHAR DEFAULT '',
  p_channel VARCHAR DEFAULT 'direct_website',
  p_special_requests TEXT DEFAULT NULL,
  p_arrival_time VARCHAR DEFAULT NULL,
  p_early_checkin BOOLEAN DEFAULT FALSE,
  p_late_checkout BOOLEAN DEFAULT FALSE,
  p_locked_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflict_count INTEGER;
  v_new_booking RECORD;
BEGIN
  -- Verrouiller les réservations actives en conflit (SELECT FOR UPDATE)
  PERFORM 1
  FROM bookings
  WHERE room_id = p_room_id
    AND status NOT IN ('cancelled', 'expired', 'no_show')
    AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
  FOR UPDATE;

  -- Compter les conflits
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE room_id = p_room_id
    AND status NOT IN ('cancelled', 'expired', 'no_show')
    AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)');

  -- Si conflit, lever une exception
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'BOOKING_CONFLICT: Chambre % non disponible du % au %',
      p_room_id, p_check_in, p_check_out
      USING ERRCODE = '23P01';
  END IF;

  -- Pas de conflit : insérer la réservation
  INSERT INTO bookings (
    user_id, room_id, hotel_id,
    check_in, check_out,
    adults, children, infants, guests,
    total_nights, room_price_per_night,
    taxes_total, extras_total, discount_amount, commission_amount,
    total_price, status, locked_until,
    booking_reference, channel,
    special_requests, arrival_time,
    early_checkin, late_checkout
  ) VALUES (
    p_user_id, p_room_id, p_hotel_id,
    p_check_in, p_check_out,
    p_adults, p_children, p_infants, p_guests,
    p_total_nights, p_room_price_per_night,
    p_taxes_total, p_extras_total, p_discount_amount, p_commission_amount,
    p_total_price, 'pending_payment', p_locked_until,
    p_booking_reference, p_channel,
    p_special_requests, p_arrival_time,
    p_early_checkin, p_late_checkout
  )
  RETURNING * INTO v_new_booking;

  RETURN row_to_json(v_new_booking);
END;
$$;

GRANT EXECUTE ON FUNCTION create_booking_atomic TO service_role;
COMMENT ON FUNCTION create_booking_atomic IS 'Création atomique de réservation : SELECT FOR UPDATE + INSERT transactionnel. Anti race-condition.';
