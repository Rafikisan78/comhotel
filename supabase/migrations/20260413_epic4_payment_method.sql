-- Migration: EPIC 4 — Amélioration module paiement
-- US-4.4: Ajout colonne payment_method + fix type payment_id

-- 1. Changer payment_id de UUID vers VARCHAR (Stripe retourne pi_xxx)
ALTER TABLE bookings ALTER COLUMN payment_id TYPE VARCHAR(255);

-- 2. Ajouter colonne payment_method
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

-- 3. Documentation
COMMENT ON COLUMN bookings.payment_method IS 'Mode de paiement: stripe, on_site, ou NULL (pas encore payé)';
COMMENT ON COLUMN bookings.payment_id IS 'Stripe PaymentIntent ID (pi_xxx) ou NULL';
