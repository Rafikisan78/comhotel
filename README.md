# Comhotel - Plateforme de Réservation d'Hôtels Intelligente

## 🏨 Description

Comhotel est une plateforme moderne de réservation d'hôtels avec recherche intelligente, paiements sécurisés et gestion complète des réservations.

## 🚀 Technologies

### Frontend
- **Framework**: Next.js 14+ (React)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Authentification**: OAuth2

### Backend
- **Framework**: NestJS
- **Langage**: TypeScript (Node.js)
- **Architecture**: REST API
- **Base de données**: Supabase
- **Paiements**: Stripe

### DevOps
- **Hébergement**: Coolify
- **CI/CD**: GitHub Actions
- **Tests**: Jest, React Testing Library

## 📁 Structure du projet

```
comhotel/
├── apps/
│   ├── frontend/          # Application Next.js
│   └── backend/           # API NestJS
├── packages/
│   ├── shared-types/      # Types TypeScript partagés
│   └── shared-utils/      # Utilitaires partagés
├── supabase/              # Configuration Supabase
├── docs/                  # Documentation
└── scripts/               # Scripts utilitaires
```

## 🛠️ Installation

### Prérequis
- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase CLI

### Installation des dépendances
```bash
npm install
```

### Configuration de Supabase local
```bash
npm run supabase:start
```

## 🧪 Tests

### Lancer tous les tests
```bash
npm test
```

### Tests en mode watch
```bash
npm run test:watch
```

### Coverage des tests
```bash
npm run test:coverage
```

## 📝 Règles de développement

### Tests
- ✅ Utiliser des Mocks pour la base de données
- ✅ Utiliser des Mocks pour bcrypt
- ✅ 1 test = 1 comportement
- ✅ Noms de tests très explicites
- ✅ Pas d'appel réseau réel
- ✅ Tous les tests doivent passer
- ✅ Ne pas modifier les signatures publiques
- ✅ Préserver les formats de retour

### Code
- Suivre les conventions TypeScript
- Utiliser Prettier pour le formatage
- Tests obligatoires pour chaque fonctionnalité

## 🚀 Développement

### Lancer l'environnement de développement
```bash
npm run dev
```

### Frontend uniquement
```bash
npm run dev:frontend
```

### Backend uniquement
```bash
npm run dev:backend
```

## 📦 Build

```bash
npm run build
```

## 📚 Documentation

Consultez le dossier [docs/](./docs/) pour plus d'informations :
- [Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Schéma de base de données](./docs/database-schema.md)
- [Guide de déploiement](./docs/deployment.md)
- [Guide des tests](./docs/testing.md)

## 🤝 Contribution

1. Créer une branche feature
2. Développer avec tests
3. Vérifier que tous les tests passent
4. Créer une Pull Request

## 📄 Licence

Propriétaire - Tous droits réservés
