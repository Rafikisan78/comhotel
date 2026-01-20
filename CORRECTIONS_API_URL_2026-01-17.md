# Corrections API URL - 17 Janvier 2026

## Problème identifié
L'application frontend ne pouvait pas communiquer avec le backend car :
1. Le backend tentait de démarrer sur le port 3001 au lieu de 3000
2. Des URLs étaient codées en dur dans certains fichiers frontend
3. Le frontend était configuré pour utiliser le port 3000 (correct) mais le backend utilisait 3001

## Corrections effectuées

### 1. Backend - Configuration du port
**Fichier**: `apps/backend/.env`
- **Ligne modifiée**: `PORT=3001` → `PORT=3000`
- **Raison**: Le frontend est configuré pour communiquer avec http://localhost:3000

### 2. Frontend - Remplacement des URLs hardcodées

#### Fichier: `apps/frontend/src/app/(main)/hotels/page.tsx`
**Modifications**:
- Ajout de la constante API_URL au début du composant
- Remplacement de `http://localhost:3001/hotels` par `${API_URL}/hotels` (ligne ~44)
- Remplacement de `http://localhost:3001/hotels/search/city/...` par `${API_URL}/hotels/search/city/...` (ligne ~70)

**Code ajouté**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

#### Fichier: `apps/frontend/src/app/(main)/hotels/[slug]/page.tsx`
**Modifications**:
- Ajout de la constante API_URL au début de la fonction
- Remplacement de `http://localhost:3001/hotels/slug/${params.slug}` par `${API_URL}/hotels/slug/${params.slug}` (ligne ~89)
- Remplacement de `http://localhost:3001/rooms` par `${API_URL}/rooms` (ligne ~104)

**Code ajouté**:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

## Configuration actuelle

### Backend
- **Port**: 3000
- **URL**: http://localhost:3000
- **Fichier de configuration**: `apps/backend/.env`

### Frontend
- **Port**: 3002
- **URL**: http://localhost:3002
- **API URL**: http://localhost:3000
- **Fichier de configuration**: `apps/frontend/.env.local`

## Tests effectués

### ✅ Tests réussis
1. **Inscription** - Nouveau compte créé avec succès
   - Email: sophie.laurent@test.com
   - Connexion automatique après inscription

2. **Navigation** - Toutes les pages accessibles
   - Page d'accueil ✓
   - Liste des hôtels ✓
   - Détails d'un hôtel ✓

3. **Authentification** - État utilisateur affiché correctement
   - Badge "Connecté" visible
   - Menu avec "Profil" et "Mes Réservations"
   - Bouton "Déconnexion" fonctionnel

### ⚠️ Fonctionnalités manquantes (identifiées par l'utilisateur)
1. **Système de sélection de dates** - Pas de date picker pour les réservations
2. **Processus de réservation complet** - Impossible de tester le flux complet sans sélection de dates

## Fichiers modifiés (hors git)
- `apps/backend/.env` (ignoré par .gitignore)
- `apps/frontend/.env.local` (ignoré par .gitignore)

## Fichiers modifiés (dans git)
- `apps/frontend/src/app/(main)/hotels/page.tsx`
- `apps/frontend/src/app/(main)/hotels/[slug]/page.tsx`

## Notes importantes
- Les fichiers `.env` ne sont pas versionnés (fichiers locaux)
- Les modifications dans les fichiers TypeScript utilisent la variable d'environnement `NEXT_PUBLIC_API_URL`
- Cette approche centralise la configuration et évite les URLs hardcodées
