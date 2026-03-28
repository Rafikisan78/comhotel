-- ============================================
-- Script SQL pour ajouter le champ avatar_url
-- à la table users de Supabase
-- ============================================

-- Ajouter le champ avatar_url pour stocker l'URL de l'avatar personnalisé
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN public.users.avatar_url IS 'URL de l''avatar personnalisé de l''utilisateur (stocké dans Supabase Storage)';

-- Index optionnel si vous avez besoin de filtrer par avatar
-- CREATE INDEX IF NOT EXISTS idx_users_has_avatar ON public.users USING btree ((avatar_url IS NOT NULL));

-- ============================================
-- Vérification : afficher la structure mise à jour
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND table_schema = 'public'
-- ORDER BY ordinal_position;
