# Structure Complète du Projet Comhotel

## 📁 Arborescence Détaillée

```
comhotel/
│
├── 📄 package.json                    # Configuration monorepo
├── 📄 .gitignore                      # Fichiers ignorés par Git
├── 📄 README.md                       # Documentation principale
├── 📄 GETTING_STARTED.md              # Guide de démarrage rapide
├── 📄 PROJECT_STRUCTURE.md            # Ce fichier
│
├── 📂 .github/                        # Configuration GitHub
│   └── 📂 workflows/
│       └── 📄 ci.yml                  # Pipeline CI/CD
│
├── 📂 apps/                           # Applications
│   │
│   ├── 📂 frontend/                   # Application Next.js
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 postcss.config.js
│   │   ├── 📄 .env.example
│   │   │
│   │   ├── 📂 public/                # Fichiers statiques
│   │   │
│   │   └── 📂 src/
│   │       ├── 📂 app/               # App Router Next.js
│   │       │   ├── 📄 layout.tsx
│   │       │   ├── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📂 (auth)/        # Groupe : Authentification
│   │       │   │   ├── 📂 login/
│   │       │   │   │   └── 📄 page.tsx
│   │       │   │   ├── 📂 register/
│   │       │   │   │   └── 📄 page.tsx
│   │       │   │   └── 📂 forgot-password/
│   │       │   │       └── 📄 page.tsx
│   │       │   │
│   │       │   ├── 📂 (main)/        # Groupe : Principal
│   │       │   │   ├── 📂 search/
│   │       │   │   ├── 📂 hotels/
│   │       │   │   ├── 📂 booking/
│   │       │   │   ├── 📂 profile/
│   │       │   │   └── 📂 payment/
│   │       │   │
│   │       │   └── 📂 admin/         # Interface admin
│   │       │
│   │       ├── 📂 components/        # Composants React
│   │       │   ├── 📂 auth/          # Composants auth
│   │       │   ├── 📂 search/        # Composants recherche
│   │       │   ├── 📂 hotel/         # Composants hôtel
│   │       │   ├── 📂 booking/       # Composants réservation
│   │       │   ├── 📂 payment/       # Composants paiement
│   │       │   ├── 📂 ui/            # Composants UI réutilisables
│   │       │   └── 📂 layout/        # Composants layout
│   │       │
│   │       ├── 📂 lib/               # Bibliothèques et utils
│   │       │   ├── 📄 api-client.ts  # Client API Axios
│   │       │   ├── 📄 supabase.ts    # Client Supabase
│   │       │   └── 📄 utils.ts       # Utilitaires
│   │       │
│   │       ├── 📂 hooks/             # Custom hooks React
│   │       ├── 📂 types/             # Types TypeScript
│   │       └── 📂 styles/            # Styles CSS
│   │           └── 📄 globals.css
│   │
│   └── 📂 backend/                    # Application NestJS
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       ├── 📄 nest-cli.json
│       ├── 📄 .eslintrc.js
│       ├── 📄 .env.example
│       │
│       ├── 📂 src/
│       │   ├── 📄 main.ts            # Point d'entrée
│       │   ├── 📄 app.module.ts      # Module principal
│       │   │
│       │   ├── 📂 modules/           # Modules fonctionnels
│       │   │   │
│       │   │   ├── 📂 users/         # 👤 Module Utilisateurs
│       │   │   │   ├── 📄 users.module.ts
│       │   │   │   ├── 📄 users.controller.ts
│       │   │   │   ├── 📄 users.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   │   ├── 📄 create-user.dto.ts
│       │   │   │   │   └── 📄 update-user.dto.ts
│       │   │   │   ├── 📂 entities/
│       │   │   │   │   └── 📄 user.entity.ts
│       │   │   │   ├── 📂 interfaces/
│       │   │   │   └── 📂 __tests__/
│       │   │   │       ├── 📄 users.service.spec.ts
│       │   │   │       └── 📄 users.controller.spec.ts
│       │   │   │
│       │   │   ├── 📂 auth/          # 🔐 Module Authentification
│       │   │   │   ├── 📄 auth.module.ts
│       │   │   │   ├── 📄 auth.controller.ts
│       │   │   │   ├── 📄 auth.service.ts
│       │   │   │   ├── 📂 strategies/
│       │   │   │   │   ├── 📄 jwt.strategy.ts
│       │   │   │   │   └── 📄 oauth2.strategy.ts
│       │   │   │   ├── 📂 guards/
│       │   │   │   │   ├── 📄 jwt-auth.guard.ts
│       │   │   │   │   └── 📄 roles.guard.ts
│       │   │   │   ├── 📂 decorators/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 hotels/        # 🏨 Module Hôtels
│       │   │   │   ├── 📄 hotels.module.ts
│       │   │   │   ├── 📄 hotels.controller.ts
│       │   │   │   ├── 📄 hotels.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 entities/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 rooms/         # 🛏️ Module Chambres
│       │   │   │   ├── 📄 rooms.module.ts
│       │   │   │   ├── 📄 rooms.controller.ts
│       │   │   │   ├── 📄 rooms.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 entities/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 bookings/      # 📅 Module Réservations
│       │   │   │   ├── 📄 bookings.module.ts
│       │   │   │   ├── 📄 bookings.controller.ts
│       │   │   │   ├── 📄 bookings.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 entities/
│       │   │   │   ├── 📂 enums/
│       │   │   │   │   └── 📄 booking-status.enum.ts
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 payments/      # 💳 Module Paiements
│       │   │   │   ├── 📄 payments.module.ts
│       │   │   │   ├── 📄 payments.controller.ts
│       │   │   │   ├── 📄 payments.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 entities/
│       │   │   │   ├── 📂 stripe/
│       │   │   │   │   └── 📄 stripe.service.ts
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 search/        # 🔍 Module Recherche
│       │   │   │   ├── 📄 search.module.ts
│       │   │   │   ├── 📄 search.controller.ts
│       │   │   │   ├── 📄 search.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 filters/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 reviews/       # ⭐ Module Avis
│       │   │   │   ├── 📄 reviews.module.ts
│       │   │   │   ├── 📄 reviews.controller.ts
│       │   │   │   ├── 📄 reviews.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   ├── 📂 entities/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   ├── 📂 notifications/ # 🔔 Module Notifications
│       │   │   │   ├── 📄 notifications.module.ts
│       │   │   │   ├── 📄 notifications.service.ts
│       │   │   │   ├── 📂 dto/
│       │   │   │   └── 📂 __tests__/
│       │   │   │
│       │   │   └── 📂 admin/         # 👨‍💼 Module Administration
│       │   │       ├── 📄 admin.module.ts
│       │   │       ├── 📄 admin.controller.ts
│       │   │       ├── 📄 admin.service.ts
│       │   │       └── 📂 __tests__/
│       │   │
│       │   ├── 📂 common/            # Code partagé
│       │   │   ├── 📂 decorators/
│       │   │   ├── 📂 filters/
│       │   │   ├── 📂 guards/
│       │   │   ├── 📂 interceptors/
│       │   │   ├── 📂 middlewares/
│       │   │   ├── 📂 pipes/
│       │   │   └── 📂 utils/
│       │   │
│       │   ├── 📂 config/            # Configuration
│       │   │   ├── 📄 database.config.ts
│       │   │   ├── 📄 jwt.config.ts
│       │   │   ├── 📄 stripe.config.ts
│       │   │   └── 📄 supabase.config.ts
│       │   │
│       │   └── 📂 database/          # Base de données
│       │       ├── 📄 supabase.service.ts
│       │       ├── 📂 migrations/
│       │       └── 📂 seeds/
│       │
│       └── 📂 test/                  # Tests
│           ├── 📂 mocks/
│           │   ├── 📄 supabase.mock.ts
│           │   ├── 📄 stripe.mock.ts
│           │   └── 📄 bcrypt.mock.ts
│           ├── 📂 fixtures/
│           └── 📂 integration/
│
├── 📂 packages/                       # Packages partagés
│   │
│   ├── 📂 shared-types/              # Types partagés
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   └── 📂 src/
│   │       ├── 📄 user.types.ts
│   │       ├── 📄 hotel.types.ts
│   │       ├── 📄 room.types.ts
│   │       ├── 📄 booking.types.ts
│   │       ├── 📄 payment.types.ts
│   │       └── 📄 index.ts
│   │
│   └── 📂 shared-utils/              # Utilitaires partagés
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       └── 📂 src/
│           ├── 📄 validators.ts
│           ├── 📄 formatters.ts
│           └── 📄 index.ts
│
├── 📂 supabase/                       # Configuration Supabase
│   ├── 📄 config.toml                # Config Supabase local
│   ├── 📄 seed.sql                   # Données de test
│   ├── 📂 migrations/                # Migrations SQL
│   └── 📂 functions/                 # Edge functions
│
├── 📂 docs/                          # Documentation
│   ├── 📄 architecture.md            # Architecture détaillée
│   ├── 📄 api.md                     # Documentation API
│   ├── 📄 database-schema.md         # Schéma BDD
│   ├── 📄 deployment.md              # Guide déploiement
│   └── 📄 testing.md                 # Guide des tests
│
└── 📂 scripts/                       # Scripts utilitaires
    ├── 📄 setup-local-supabase.sh
    ├── 📄 generate-mock-data.ts
    └── 📄 seed-database.ts
```

## 🎯 Modules Fonctionnels

### Backend (10 modules)

| Module | Description | Routes | Statut |
|--------|-------------|--------|--------|
| **Users** | Gestion des utilisateurs | `/users` | ✅ Implémenté |
| **Auth** | Authentification JWT/OAuth | `/auth` | ✅ Implémenté |
| **Hotels** | CRUD hôtels | `/hotels` | ✅ Implémenté |
| **Rooms** | CRUD chambres | `/rooms` | ✅ Implémenté |
| **Bookings** | Gestion réservations | `/bookings` | ✅ Implémenté |
| **Payments** | Paiements Stripe | `/payments` | ✅ Implémenté |
| **Search** | Recherche intelligente | `/search` | ✅ Implémenté |
| **Reviews** | Avis clients | `/reviews` | 🟡 Squelette |
| **Notifications** | Emails/Notifications | N/A (Service) | 🟡 Squelette |
| **Admin** | Administration | `/admin` | 🟡 Squelette |

### Frontend (7 features)

| Feature | Description | Route | Statut |
|---------|-------------|-------|--------|
| **Home** | Page d'accueil | `/` | ✅ Implémenté |
| **Auth** | Login/Register | `/login`, `/register` | ✅ Implémenté |
| **Search** | Recherche hôtels | `/search` | 🔴 À implémenter |
| **Hotels** | Liste/Détail hôtels | `/hotels` | 🔴 À implémenter |
| **Booking** | Réservation | `/booking` | 🔴 À implémenter |
| **Payment** | Paiement | `/payment` | 🔴 À implémenter |
| **Profile** | Profil utilisateur | `/profile` | 🔴 À implémenter |
| **Admin** | Interface admin | `/admin` | 🔴 À implémenter |

## 📊 Légende

- ✅ **Implémenté** : Fonctionnel avec code de base
- 🟡 **Squelette** : Structure créée, à compléter
- 🔴 **À implémenter** : Non commencé

## 🔄 Flux de Données

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js    │  Port 3000
│  (Frontend) │
└──────┬──────┘
       │ REST API
       ▼
┌─────────────┐
│   NestJS    │  Port 3001
│  (Backend)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │  PostgreSQL
│  (Database) │
└─────────────┘
```

## 🔌 Intégrations Externes

1. **Supabase** - Base de données PostgreSQL
2. **Stripe** - Paiements en ligne
3. **OAuth2** - Authentification tierce
4. **Coolify** - Hébergement et déploiement

## 📝 Conventions de Nommage

- **Fichiers** : kebab-case (`user.service.ts`)
- **Classes** : PascalCase (`UserService`)
- **Variables/Fonctions** : camelCase (`createUser`)
- **Constantes** : UPPER_SNAKE_CASE (`API_URL`)
- **Interfaces** : PascalCase avec préfixe I (`IUser`) ou sans (`User`)
- **Enums** : PascalCase (`UserRole`)

## 🎨 Standards de Code

- **TypeScript** strict mode activé
- **ESLint** + **Prettier** pour le formatage
- **Jest** pour les tests
- **Conventional Commits** pour les messages Git
