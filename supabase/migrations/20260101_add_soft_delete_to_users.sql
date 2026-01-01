-- Migration: Add soft delete support to users table
-- Date: 2026-01-01
-- Description: Add deleted_at and deleted_by columns for soft delete functionality

-- Add soft delete columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- Add foreign key constraint for deleted_by
ALTER TABLE public.users
ADD CONSTRAINT fk_users_deleted_by
FOREIGN KEY (deleted_by)
REFERENCES public.users(id)
ON DELETE SET NULL;

-- Add index for better query performance on active users (exclude soft-deleted)
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
ON public.users(deleted_at)
WHERE deleted_at IS NULL;

-- Add index for soft-deleted users lookup
CREATE INDEX IF NOT EXISTS idx_users_deleted_by
ON public.users(deleted_by)
WHERE deleted_by IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when user was soft deleted. NULL means user is active.';
COMMENT ON COLUMN public.users.deleted_by IS 'ID of the admin user who deleted this user. References users(id).';
