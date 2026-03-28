-- =====================================================
-- SCRIPT DE VERIFICATION DE LA STRUCTURE ACTUELLE
-- Date: 2026-01-10
-- =====================================================

-- Vérifier les colonnes de la table USERS
SELECT
  'users' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table HOTELS
SELECT
  'hotels' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'hotels'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table ROOMS
SELECT
  'rooms' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY ordinal_position;

-- Vérifier les ENUMs existants
SELECT
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'room_type', 'view_type', 'booking_status', 'payment_status')
ORDER BY t.typname, e.enumsortorder;

-- Vérifier les index
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'hotels', 'rooms')
ORDER BY tablename, indexname;
