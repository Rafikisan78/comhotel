-- ============================================
-- Script SQL pour mettre à jour les prix des chambres
-- pour les tests (entre 0.10€ et 0.50€)
-- ============================================

-- Mise à jour des prix avec des valeurs aléatoires entre 0.10 et 0.50
UPDATE public.rooms
SET
    base_price = ROUND((0.10 + (RANDOM() * 0.40))::numeric, 2),
    updated_at = NOW();

-- Vérification : afficher les prix mis à jour
SELECT
    r.id,
    r.room_number,
    r.room_type,
    r.base_price,
    h.name as hotel_name
FROM public.rooms r
JOIN public.hotels h ON r.hotel_id = h.id
ORDER BY h.name, r.room_number;

-- Résumé des prix
SELECT
    COUNT(*) as total_rooms,
    MIN(base_price) as prix_min,
    MAX(base_price) as prix_max,
    ROUND(AVG(base_price)::numeric, 2) as prix_moyen
FROM public.rooms;
