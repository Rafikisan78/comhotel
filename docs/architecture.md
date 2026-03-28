# Architecture du Projet ComHotel

> **Version**: 1.8 | **Dernière mise à jour**: Janvier 2026

## Vue d'ensemble

ComHotel est une plateforme de réservation d'hôtels construite avec une architecture moderne en monorepo, permettant aux clients de réserver des chambres, aux propriétaires de gérer leurs établissements, et aux administrateurs de superviser la plateforme.

---

## Stack Technologique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 14+ | Framework React avec App Router |
| React | 18 | Bibliothèque UI |
| TypeScript | 5+ | Typage statique |
| Tailwind CSS | 3+ | Styling utilitaire |
| Axios | - | Client HTTP |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| NestJS | 10+ | Framework API REST |
| TypeScript | 5+ | Typage statique |
| Passport.js | - | Authentification JWT |
| bcrypt | - | Hash des mots de passe |
| class-validator | - | Validation des DTOs |

### Base de données & Services
| Service | Usage |
|---------|-------|
| Supabase | PostgreSQL hébergé + Auth |
| Stripe | Paiements (prévu) |

### DevOps
| Outil | Usage |
|-------|-------|
| Docker | Conteneurisation |
| GitHub Actions | CI/CD |
| Jest | Tests unitaires |

---

## Architecture Applicative

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│                   (Web / Mobile / API)                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js 14)                            │
│                 Port: 3002                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  App Router          │  Components UI    │  Hooks        │   │
│  │  - (auth)/*          │  - Navbar         │  - useAuth    │   │
│  │  - (main)/*          │  - HotelCard      │  - useBooking │   │
│  │  - admin/*           │  - ChatBot        │  - useHotels  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (NestJS)                                 │
│                 Port: 3000                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Guards              │  Services         │  Controllers  │   │
│  │  - JwtAuthGuard      │  - AuthService    │  - /auth      │   │
│  │  - AdminGuard        │  - UsersService   │  - /users     │   │
│  │  - OwnerGuard        │  - HotelsService  │  - /hotels    │   │
│  │                      │  - BookingsServ.  │  - /bookings  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQL (Supabase Client)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE (PostgreSQL)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables             │  Functions        │  Auth          │   │
│  │  - users            │  - triggers       │  - JWT         │   │
│  │  - hotels           │  - RLS policies   │  - Email conf. │   │
│  │  - rooms            │                   │                │   │
│  │  - bookings         │                   │                │   │
│  │  - payments         │                   │                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Modules Backend

### Structure des modules

```
apps/backend/src/modules/
├── auth/               # Authentification JWT
├── users/              # Gestion utilisateurs
├── hotels/             # Gestion hôtels
├── rooms/              # Gestion chambres
├── bookings/           # Réservations
├── payments/           # Paiements Stripe
├── search/             # Recherche
├── reviews/            # Avis (structure)
├── notifications/      # Emails (structure)
├── chatbot/            # Assistant IA sécurisé
└── admin/              # Administration
```

### Détail des modules

| Module | Statut | Endpoints | Description |
|--------|--------|-----------|-------------|
| **Auth** | ✅ Complet | `/auth/*` | Inscription, connexion, JWT |
| **Users** | ✅ Complet | `/users/*` | CRUD utilisateurs, profils |
| **Hotels** | ✅ Complet | `/hotels/*` | CRUD hôtels, multi-langues |
| **Rooms** | ✅ Complet | `/rooms/*` | CRUD chambres, capacité |
| **Bookings** | ✅ Complet | `/bookings/*` | Réservations, calendrier |
| **Chatbot** | ✅ Complet | `/chatbot/*` | Recherche IA sécurisée |
| **Payments** | ⚠️ Mock | `/payments/*` | Structure Stripe (simulé) |
| **Reviews** | ❌ À faire | `/reviews/*` | Structure seulement |
| **Notifications** | ❌ À faire | - | Console.log seulement |

---

## Fonctionnalités Implémentées

### ✅ Authentification & Utilisateurs

| Fonctionnalité | Description |
|----------------|-------------|
| Inscription | Email, mot de passe sécurisé (12+ chars), nom, téléphone |
| Connexion | JWT avec rôle (guest, hotel_owner, admin) |
| Profil | Mise à jour des informations personnelles |
| Rôles | Permissions différenciées par rôle |
| Sécurité | bcrypt, validation OWASP |

### ✅ Gestion Hôtels

| Fonctionnalité | Description |
|----------------|-------------|
| CRUD | Création, lecture, modification, suppression |
| Multi-langues | Descriptions FR, EN, ES, DE |
| Médias | Images couverture + galerie |
| Géolocalisation | Coordonnées lat/lng |
| Équipements | Liste des amenities |
| SEO | Slug automatique |

### ✅ Gestion Chambres

| Fonctionnalité | Description |
|----------------|-------------|
| CRUD | Création, lecture, modification, suppression |
| Types | single, double, suite, deluxe, family |
| Capacité | Adultes, enfants, bébés |
| Tarification | Prix par nuit |
| Équipements | Amenities par chambre |
| Accessibilité | Options PMR |

### ✅ Système de Réservation

| Fonctionnalité | Description |
|----------------|-------------|
| Création | Avec validation dates et capacité |
| Disponibilité | Vérification temps réel |
| Prix | Calcul automatique + taxes (10%) |
| Référence | Code unique généré |
| **Calendrier chambre** | `/bookings/room/:roomId/calendar` |
| **Calendrier hôtel** | `/bookings/hotel/:hotelId/calendar` |
| **Disponibilité multi-chambres** | `/bookings/hotel/:hotelId/rooms-availability` |
| Annulation | Avec préavis 24h minimum |
| Statuts | pending, confirmed, cancelled, completed, checked_in, checked_out, no_show |

### ✅ Chatbot Sécurisé

| Fonctionnalité | Description |
|----------------|-------------|
| Recherche | Par ville, étoiles, équipements |
| OWASP Top 10 IA | Protection LLM01-LLM10 |
| MITRE ATLAS | Détection d'attaques adverses |
| Sanitization | Entrées et sorties nettoyées |
| Rate limiting | Par session |

---

## Fonctionnalités Non Implémentées

### ❌ Email Service

| À faire | Priorité |
|---------|----------|
| Intégration Supabase Auth Email | Critique |
| Template confirmation compte | Critique |
| Template confirmation réservation | Critique |
| Template annulation | Haute |
| Template mot de passe oublié | Haute |

### ❌ Paiements Réels

| À faire | Priorité |
|---------|----------|
| Configuration Stripe production | Critique |
| Webhooks Stripe | Critique |
| Remboursements | Haute |
| Factures PDF | Moyenne |

### ❌ Autres

| À faire | Priorité |
|---------|----------|
| Système d'avis | Haute |
| Vérification email | Critique |
| Mot de passe oublié | Haute |
| 2FA | Moyenne |
| Programme fidélité | Basse |

---

## Base de Données

### Schéma relationnel

```
users (1) ──────────────── (N) bookings
  │                              │
  │                              │
  └─── (1) hotels (1) ─── (N) rooms ───┘
                │
                └─── (N) reviews
```

### Tables principales

| Table | Colonnes clés | Description |
|-------|---------------|-------------|
| `users` | id, email, password_hash, role, firstName, lastName | Utilisateurs |
| `hotels` | id, name, city, star_rating, owner_id, slug | Hôtels |
| `rooms` | id, hotel_id, room_number, room_type, price_per_night | Chambres |
| `bookings` | id, user_id, room_id, check_in, check_out, status | Réservations |
| `payments` | id, booking_id, amount, status, stripe_id | Paiements |

### Types ENUM

```sql
user_role: 'guest', 'hotel_owner', 'admin'
room_type: 'single', 'double', 'suite', 'deluxe', 'family'
booking_status: 'pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out', 'no_show'
payment_status: 'pending', 'processing', 'succeeded', 'failed', 'refunded'
```

---

## Sécurité

### Authentification

- **JWT** : Tokens signés avec expiration configurable
- **bcrypt** : Hash des mots de passe (10 rounds)
- **Validation** : Mot de passe 12+ caractères avec complexité

### OWASP Compliance

| Risque | Protection |
|--------|------------|
| SQL Injection | Requêtes paramétrées Supabase |
| XSS | Sanitization des entrées |
| CSRF | JWT + SameSite cookies |
| Broken Auth | Expiration tokens |

### Chatbot (OWASP Top 10 pour IA)

| Code | Risque | Mitigation |
|------|--------|------------|
| LLM01 | Prompt Injection | Détection patterns |
| LLM02 | Insecure Output | Validation réponses |
| LLM06 | Sensitive Info | Pas d'accès données sensibles |

---

## API Reference

### Endpoints publics

```
POST   /auth/register           # Inscription
POST   /auth/login              # Connexion
GET    /hotels                  # Liste hôtels
GET    /hotels/:slug            # Détail hôtel
GET    /bookings/check-availability  # Vérifier disponibilité
```

### Endpoints protégés (JWT)

```
GET    /auth/profile            # Mon profil
POST   /bookings                # Créer réservation
GET    /bookings/my-bookings    # Mes réservations
DELETE /bookings/:id            # Annuler réservation
```

### Endpoints admin

```
GET    /users                   # Liste utilisateurs
GET    /bookings/admin/all      # Toutes réservations
POST   /hotels                  # Créer hôtel
```

---

## Déploiement

### Variables d'environnement

```env
# Backend
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
JWT_SECRET=xxx
JWT_EXPIRATION=1d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Commandes

```bash
# Installation
npm install

# Développement
npm run dev:backend    # Port 3000
npm run dev:frontend   # Port 3002

# Production
npm run build
npm run start
```

---

## Annexes

- [Configuration Email Supabase](./SUPABASE_EMAIL_CONFIRMATION_SETUP.md)
- [Schéma Base de Données](./database-schema.md)
- [Documentation API](./api.md)
- [Guide de Déploiement](./deployment.md)
- [Tests](./testing.md)

---

*ComHotel v1.8 - Documentation générée automatiquement*
