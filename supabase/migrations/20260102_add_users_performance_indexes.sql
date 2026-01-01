-- Migration: Add performance indexes for users table
-- Description: Optimise les requêtes fréquentes et améliore la concurrence

-- 1. Index sur email (déjà unique, mais explicite pour les lookups)
-- Cet index est probablement déjà créé via UNIQUE constraint
-- Mais on s'assure qu'il existe pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_users_email
ON public.users(email);

-- 2. Index sur role pour filtrage rapide par rôle
CREATE INDEX IF NOT EXISTS idx_users_role
ON public.users(role);

-- 3. Index composite pour les requêtes admin (role + deleted_at)
-- Optimise les requêtes qui filtrent par rôle ET statut de suppression
CREATE INDEX IF NOT EXISTS idx_users_role_deleted
ON public.users(role, deleted_at);

-- 4. Index sur created_at pour tri chronologique
CREATE INDEX IF NOT EXISTS idx_users_created_at
ON public.users(created_at DESC);

-- 5. Index sur updated_at pour tracking des modifications
CREATE INDEX IF NOT EXISTS idx_users_updated_at
ON public.users(updated_at DESC);

-- COMMENTAIRES sur les index
COMMENT ON INDEX idx_users_email IS 'Accélère les recherches par email (login, duplicate check)';
COMMENT ON INDEX idx_users_role IS 'Optimise les filtres par rôle (admin, guest, hotel_owner)';
COMMENT ON INDEX idx_users_role_deleted IS 'Index composite pour requêtes admin filtrant par rôle et statut';
COMMENT ON INDEX idx_users_created_at IS 'Tri chronologique des utilisateurs';
COMMENT ON INDEX idx_users_updated_at IS 'Tri par dernière modification';
