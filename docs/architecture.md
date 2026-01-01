# Architecture du Projet Comhotel

## Vue d'ensemble

Comhotel est une plateforme de réservation d'hôtels construite avec une architecture moderne en monorepo.

## Stack Technologique

### Frontend
- **Framework**: Next.js 14+ avec App Router
- **UI**: React 18 avec TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context API
- **API Client**: Axios
- **Authentification**: OAuth2 + JWT

### Backend
- **Framework**: NestJS avec TypeScript
- **Architecture**: Modulaire (REST API)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Passport.js + JWT
- **Paiements**: Stripe
- **Validation**: class-validator

### DevOps
- **Hébergement**: Coolify
- **CI/CD**: GitHub Actions
- **Tests**: Jest
- **Conteneurisation**: Docker (via Coolify)

## Architecture Modulaire

### Modules Backend

1. **Users** - Gestion des utilisateurs
2. **Auth** - Authentification et autorisation
3. **Hotels** - Gestion des hôtels
4. **Rooms** - Gestion des chambres
5. **Bookings** - Gestion des réservations
6. **Payments** - Traitement des paiements
7. **Search** - Recherche intelligente
8. **Reviews** - Avis et commentaires
9. **Notifications** - Envoi de notifications
10. **Admin** - Administration

### Features Frontend

1. **Auth** - Pages d'authentification
2. **Search** - Interface de recherche
3. **Hotels** - Affichage des hôtels
4. **Booking** - Processus de réservation
5. **Payment** - Paiement sécurisé
6. **Profile** - Profil utilisateur
7. **Admin** - Interface d'administration

## Flux de Données

```
Client (Next.js)
    ↓
API REST (NestJS)
    ↓
Supabase (PostgreSQL)
```

## Sécurité

- JWT pour l'authentification
- OAuth2 pour les connexions tierces
- HTTPS obligatoire en production
- Validation des entrées avec class-validator
- Guards NestJS pour la protection des routes

## Scalabilité

- Architecture modulaire pour faciliter l'ajout de fonctionnalités
- Séparation frontend/backend
- Cache avec Supabase
- Optimisation des requêtes avec indexes

## Développement Local

1. **Backend**: Mock data en mémoire
2. **Frontend**: Connexion à l'API locale
3. **Base de données**: Supabase local
4. **Tests**: Mocks pour tous les services externes
