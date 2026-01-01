-- Migration: Add concurrency control for users table
-- Description: Prévient les conflits lors de modifications concurrentes

-- 1. Ajouter une colonne version pour le contrôle de concurrence optimiste
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- 2. Créer une fonction trigger pour auto-incrémenter la version
CREATE OR REPLACE FUNCTION update_user_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter automatiquement la version à chaque UPDATE
  NEW.version = OLD.version + 1;

  -- Mettre à jour updated_at automatiquement
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le trigger sur la table users
DROP TRIGGER IF EXISTS trigger_update_user_version ON public.users;
CREATE TRIGGER trigger_update_user_version
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_version();

-- 4. Commentaire explicatif
COMMENT ON COLUMN public.users.version IS 'Version pour concurrence optimiste - auto-incrémenté à chaque UPDATE';
COMMENT ON FUNCTION update_user_version() IS 'Auto-incrémente la version et updated_at lors des updates';

-- 5. Index sur version pour vérifications rapides
CREATE INDEX IF NOT EXISTS idx_users_version
ON public.users(id, version);
