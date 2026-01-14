# ComHotel - Plateforme de Réservation Hôtelière

> Plateforme moderne de réservation d'hôtels construite avec NestJS, Next.js et Supabase

![Version](https://img.shields.io/badge/version-1.8.0-blue.svg)
![Tests](https://img.shields.io/badge/tests-133%2B%20passing-brightgreen.svg)
![Coverage](https://img.shields.io/badge/coverage-93.75%25-brightgreen.svg)

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Documentation API](#documentation-api)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Contribution](#contribution)

## 🎯 Vue d'ensemble

ComHotel est une plateforme complète de gestion et réservation d'hôtels offrant :
- Système d'authentification sécurisé (JWT + OWASP 2024)
- Gestion complète des utilisateurs avec interface admin
- Catalogue d'hôtels multilingue avec recherche avancée
- Gestion des chambres avec types et tarification
- Architecture monorepo moderne avec NestJS et Next.js
- Base de données PostgreSQL via Supabase

## ✨ Fonctionnalités

### ✅ Implémenté et Testé (Production-Ready)

#### Authentification & Utilisateurs
- ✅ Inscription avec validation OWASP 2024
  - Minimum 12 caractères
  - Complexité requise (majuscules, minuscules, chiffres, caractères spéciaux)
  - Protection contre l'injection de rôles
- ✅ Connexion JWT avec expiration configurable (7 jours par défaut)
- ✅ Confirmation d'email avec tokens
- ✅ Réinitialisation de mot de passe
- ✅ Gestion complète des utilisateurs (CRUD)
- ✅ Interface admin de gestion des utilisateurs
  - Liste avec filtres (actifs/supprimés/tous)
  - Modification individuelle
  - Suppression douce (soft delete) avec audit
  - Suppression en masse
  - Restauration d'utilisateurs supprimés
- ✅ Protection : admin ne peut pas se supprimer ou supprimer d'autres admins

#### Hôtels
- ✅ Catalogue d'hôtels avec CRUD complet
- ✅ Support multilingue (FR, EN, ES, DE)
- ✅ Recherche avancée avec filtres
  - Par ville, pays
  - Par nombre d'étoiles (1-5)
  - Par note moyenne
  - Par équipements
- ✅ Génération automatique de slug pour URL SEO-friendly
- ✅ Géolocalisation (latitude, longitude)
- ✅ Gestion des médias
  - Images multiples
  - Image de couverture
  - URL vidéo
  - Visite virtuelle
- ✅ Hôtels mis en avant (featured)
- ✅ Système de commission configurable
- ✅ Contrôle d'accès par propriétaire

#### Chambres
- ✅ Gestion complète des chambres (CRUD)
- ✅ 11 types de chambres : Single, Double, Twin, Triple, Quad, Suite, Deluxe, Presidential, Studio, Family, Accessible
- ✅ 8 types de vues : City, Sea, Mountain, Garden, Pool, Courtyard, Street, Interior
- ✅ Capacité par âge : adultes (1-10), enfants (0-10), bébés (0-5)
- ✅ Tarification et superficie
- ✅ Contrainte unique : (hotel_id, room_number)
- ✅ Soft delete support

#### Sécurité
- ✅ JWT Authentication avec Passport
- ✅ Hachage bcrypt (cost factor 10)
- ✅ Politique de mots de passe OWASP 2024
- ✅ Role-Based Access Control (RBAC)
  - `guest` : utilisateur standard
  - `hotel_owner` : propriétaire d'hôtel
  - `admin` : administrateur système
- ✅ Guards NestJS
  - `JwtAuthGuard` : authentification JWT
  - `AdminGuard` : accès admin uniquement
  - `RolesGuard` : contrôle par rôles
- ✅ CORS configuré pour frontend
- ✅ Validation globale des DTOs
- ✅ Protection CSRF via tokens
- ✅ Soft delete avec audit trail (deletedAt, deletedBy)

### ⚠️ En Développement

#### Réservations (Structure créée, mock)
- ⚠️ Création de réservations
- ⚠️ Vérification de disponibilité
- ⚠️ Calcul automatique des prix
- ⚠️ Gestion des statuts (pending, confirmed, cancelled, completed)
- ⚠️ Politique d'annulation

#### Paiements (Structure créée, intégration Stripe partielle)
- ⚠️ Intégration Stripe complète
- ⚠️ Webhooks
- ⚠️ Gestion des remboursements
- ⚠️ Génération de factures

#### Avis (Placeholder)
- 🔲 Système d'avis et notation
- 🔲 Modération
- 🔲 Réponse du propriétaire

#### Notifications (Placeholder)
- 🔲 Emails transactionnels
- 🔲 Notifications push
- 🔲 SMS

## 🏗️ Architecture

### Stack Technique

**Backend**
- **Framework** : NestJS 10
- **Langage** : TypeScript 5
- **Base de données** : PostgreSQL 15 (Supabase)
- **ORM** : Supabase Client
- **Authentification** : JWT + Passport
- **Validation** : class-validator, class-transformer
- **Tests** : Jest
- **Documentation** : Swagger (à venir)

**Frontend**
- **Framework** : Next.js 15
- **UI Library** : React 19
- **Styling** : Tailwind CSS 3.4
- **HTTP Client** : Axios
- **Authentification** : JWT (localStorage)
- **Tests** : Jest + React Testing Library

**Infrastructure**
- **Database** : Supabase (PostgreSQL + Auth + Storage)
- **Hébergement** : À configurer
- **CI/CD** : GitHub Actions (à configurer)

### Structure du Projet

```
comhotel/
├── apps/
│   ├── backend/              # API NestJS
│   │   ├── src/
│   │   │   ├── modules/      # Modules métier
│   │   │   │   ├── auth/     # ✅ Authentification
│   │   │   │   ├── users/    # ✅ Utilisateurs
│   │   │   │   ├── hotels/   # ✅ Hôtels
│   │   │   │   ├── rooms/    # ✅ Chambres
│   │   │   │   ├── bookings/ # ⚠️ Réservations (mock)
│   │   │   │   ├── payments/ # ⚠️ Paiements (mock)
│   │   │   │   ├── reviews/  # 🔲 Avis
│   │   │   │   └── admin/    # 🔲 Admin
│   │   │   ├── common/       # Utilitaires partagés
│   │   │   │   ├── guards/   # Guards de sécurité
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   └── utils/
│   │   │   └── main.ts       # Point d'entrée
│   │   ├── test/             # Tests E2E
│   │   └── .env.example      # Variables d'environnement
│   │
│   └── frontend/             # Application Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/   # Pages authentification
│       │   │   │   ├── login/
│       │   │   │   ├── register/
│       │   │   │   ├── confirm/
│       │   │   │   └── forgot-password/
│       │   │   ├── (main)/   # Pages principales
│       │   │   │   ├── hotels/
│       │   │   │   ├── profile/
│       │   │   │   └── admin/
│       │   │   │       └── users/  # Interface admin
│       │   │   └── page.tsx  # Page d'accueil
│       │   ├── components/   # Composants réutilisables
│       │   └── lib/          # Utilitaires
│       └── .env.local.example
│
├── supabase/
│   └── migrations/           # Migrations SQL
│       ├── 001_initial_schema.sql
│       └── 20260110_verify_and_update_tables.sql
│
├── postman/                  # Collections Postman
│   ├── collections/
│   └── environments/
│
└── docs/                     # Documentation
```

## 🚀 Installation

### Prérequis

- **Node.js** : v18+ (recommandé v20)
- **npm** : v9+
- **PostgreSQL** : v15+ (ou compte Supabase)
- **Git** : pour cloner le repository

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/Rafikisan78/comhotel.git
cd comhotel
```

2. **Installer les dépendances**
```bash
# Dépendances racine (si applicable)
npm install

# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurer la base de données**

Créer un projet Supabase sur [supabase.com](https://supabase.com) ou utiliser une instance PostgreSQL locale.

4. **Exécuter les migrations**
```bash
# Via Supabase CLI
supabase db push

# Ou manuellement via SQL
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/001_initial_schema.sql
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/20260110_verify_and_update_tables.sql
```

## ⚙️ Configuration

### Backend (.env)

Créer `apps/backend/.env` à partir de `.env.example` :

```env
# Application
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_KEY=votre-service-key
SUPABASE_ANON_KEY=votre-anon-key

# JWT
JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
JWT_EXPIRES_IN=7d

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000

# OAuth2 (optionnel)
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_CALLBACK_URL=http://localhost:3001/auth/callback

# Stripe (optionnel)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Frontend (.env.local)

Créer `apps/frontend/.env.local` :

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (si utilisé côté frontend)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

## 🎬 Démarrage

### Mode Développement

**Option 1 : Démarrage séparé**

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev
# Backend démarré sur http://localhost:3001

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
# Frontend démarré sur http://localhost:3000
```

**Option 2 : Script racine (si configuré)**
```bash
npm run dev
```

### Mode Production

```bash
# Backend
cd apps/backend
npm run build
npm run start:prod

# Frontend
cd apps/frontend
npm run build
npm start
```

## 📚 Documentation API

### Endpoints Principaux

#### Authentification (Public)

| Méthode | Endpoint | Description | Corps de la requête |
|---------|----------|-------------|-------------------|
| POST | `/auth/register` | Inscription | `{ email, password, firstName, lastName, phone? }` |
| POST | `/auth/login` | Connexion | `{ email, password }` |

**Réponse Login** :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "guest"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Utilisateurs

| Méthode | Endpoint | Protection | Description |
|---------|----------|-----------|-------------|
| GET | `/users/me` | JWT | Profil utilisateur connecté |
| PATCH | `/users/me` | JWT | Modifier son profil |
| GET | `/users` | JWT + Admin | Liste tous les utilisateurs actifs |
| GET | `/users/admin/all` | JWT + Admin | Liste tous (y compris supprimés) |
| GET | `/users/:id` | JWT + Admin | Détails d'un utilisateur |
| PATCH | `/users/:id` | JWT + Admin | Modifier un utilisateur |
| DELETE | `/users/:id` | JWT + Admin | Supprimer (soft delete) |
| POST | `/users/:id/restore` | JWT + Admin | Restaurer un utilisateur |
| DELETE | `/users/bulk/delete` | JWT + Admin | Suppression en masse |

#### Hôtels

| Méthode | Endpoint | Protection | Description |
|---------|----------|-----------|-------------|
| GET | `/hotels` | Public | Liste hôtels actifs |
| GET | `/hotels/slug/:slug` | Public | Hôtel par slug |
| GET | `/hotels/:id` | Public | Hôtel par ID |
| GET | `/hotels/search` | Public | Recherche avec filtres |
| GET | `/hotels/search/city/:city` | Public | Recherche par ville |
| POST | `/hotels` | JWT + Owner/Admin | Créer hôtel |
| GET | `/hotels/my-hotels` | JWT + Owner/Admin | Mes hôtels |
| GET | `/hotels/admin/all` | JWT + Admin | Tous les hôtels |
| PATCH | `/hotels/:id` | JWT + Owner/Admin | Modifier hôtel |
| DELETE | `/hotels/:id` | JWT + Owner/Admin | Supprimer hôtel |

#### Chambres

| Méthode | Endpoint | Protection | Description |
|---------|----------|-----------|-------------|
| GET | `/rooms` | Public | Liste chambres actives |
| GET | `/rooms/:id` | Public | Chambre par ID |
| POST | `/rooms` | À sécuriser | Créer chambre |
| PUT | `/rooms/:id` | À sécuriser | Modifier chambre |
| DELETE | `/rooms/:id` | À sécuriser | Supprimer chambre |

### Exemples d'utilisation

**Inscription**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!@#",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+33612345678"
  }'
```

**Connexion**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!@#"
  }'
```

**Récupérer son profil**
```bash
curl -X GET http://localhost:3001/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Rechercher des hôtels**
```bash
curl -X GET "http://localhost:3001/hotels/search?city=Paris&stars=4"
```

## 🧪 Tests

### Backend Tests

**Exécuter tous les tests**
```bash
cd apps/backend
npm test
```

**Tests avec couverture**
```bash
npm run test:cov
```

**Tests en mode watch**
```bash
npm run test:watch
```

**Tests E2E**
```bash
npm run test:e2e
```

### Statistiques de Tests

| Module | Tests | Statut | Couverture |
|--------|-------|--------|-----------|
| Auth | 30+ | ✅ Passing | ~95% |
| Users | 25+ | ✅ Passing | ~90% |
| Hotels | 35+ | ✅ Passing | ~92% |
| Rooms | 29 | ✅ Passing | 93.75% |
| **Total** | **133+** | **✅ All Passing** | **~93%** |

### Tests Postman

Collections disponibles dans `/postman` :
- **Auth Tests** : 14 scénarios
- **Users Tests** : 25 scénarios
- **Hotels Tests** : 35 scénarios
- **Complete Flow** : 20 scénarios end-to-end

**Importer dans Postman** :
1. Ouvrir Postman
2. Importer `postman/ComHotel-Complete-Tests.postman_collection.json`
3. Importer `postman/ComHotel-Complete-Tests.postman_environment.json`
4. Sélectionner l'environnement
5. Exécuter les tests

## 🔒 Sécurité

### Politique de Mots de Passe OWASP 2024

**Exigences** :
- ✅ Minimum 12 caractères
- ✅ Au moins 1 majuscule (A-Z)
- ✅ Au moins 1 minuscule (a-z)
- ✅ Au moins 1 chiffre (0-9)
- ✅ Au moins 1 caractère spécial (@$!%*?&._-+=#)
- ✅ Maximum 128 caractères (support passphrases)

**Pattern Regex** :
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$
```

### Mesures de Sécurité Implémentées

1. **Authentification**
   - JWT avec expiration configurable
   - bcrypt avec cost factor 10
   - Tokens de confirmation d'email
   - Tokens de réinitialisation avec expiration

2. **Autorisation**
   - RBAC avec 3 rôles (guest, hotel_owner, admin)
   - Guards NestJS pour protection des routes
   - Vérification de propriété pour hôtels

3. **Protection des Données**
   - Normalisation des emails (lowercase + trim)
   - Validation stricte des DTOs
   - Whitelist des propriétés acceptées
   - Soft delete avec audit trail

4. **Protections Admin**
   - Admin ne peut pas se supprimer
   - Admin ne peut pas supprimer d'autres admins
   - Traçabilité des suppressions (deletedBy)

5. **API Security**
   - CORS configuré
   - Rate limiting (à implémenter)
   - Validation globale
   - Protection CSRF

### Compte Admin de Test

**⚠️ À utiliser uniquement en développement**

```
Email: admin@comhotel.com
Password: Admin2024!@#$
Role: admin
```

**Pour créer un admin en production** :
1. Créer un utilisateur via `/auth/register`
2. Mettre à jour le rôle directement en base de données :
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'votre-admin@example.com';
```

## 🤝 Contribution

### Workflow Git

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code

**Backend**
- ESLint avec config NestJS
- Prettier pour le formatage
- Tests obligatoires pour nouvelles features
- Couverture minimale : 80%

**Frontend**
- ESLint avec config Next.js
- Prettier pour le formatage
- Tests pour composants critiques

### Commit Messages

Format : `type(scope): description`

**Types** :
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `docs` : documentation
- `style` : formatage
- `refactor` : refactoring
- `test` : ajout de tests
- `chore` : maintenance

**Exemples** :
```
feat(auth): add OAuth2 Google integration
fix(hotels): correct slug generation for special characters
docs(readme): update installation instructions
```

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/Rafikisan78/comhotel/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Rafikisan78/comhotel/discussions)
- **Email** : support@comhotel.com (à configurer)

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) - Framework backend
- [Next.js](https://nextjs.org/) - Framework frontend
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Stripe](https://stripe.com/) - Paiements en ligne

---

**Version** : 1.8.0
**Dernière mise à jour** : 11 janvier 2026
**Statut** : En développement actif
