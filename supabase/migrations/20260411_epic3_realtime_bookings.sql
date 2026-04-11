-- Migration: EPIC 3 — Synchronisation temps réel (Supabase Realtime)
-- US-3.1: Mise à jour calendrier en temps réel
-- US-3.2: Notifications propriétaire en temps réel

-- Ajouter la table bookings à la publication Supabase Realtime
-- Permet les abonnements aux INSERT/UPDATE/DELETE sur les réservations
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
