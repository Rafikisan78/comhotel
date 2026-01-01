# Guide de Démarrage - Comhotel

## 🎉 Félicitations !

Votre projet Comhotel a été configuré avec succès. Voici comment démarrer.

## 📋 Prochaines Étapes

### 1. Installer les dépendances

```bash
cd comhotel
npm install
```

### 2. Configurer les variables d'environnement

#### Backend
```bash
cd apps/backend
cp .env.example .env
# Éditer le fichier .env avec vos valeurs
```

#### Frontend
```bash
cd apps/frontend
cp .env.example .env
# Éditer le fichier .env avec vos valeurs
```

### 3. Démarrer Supabase local (optionnel)

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Démarrer Supabase local
npm run supabase:start
```

### 4. Lancer l'application

```bash
# Démarrer frontend et backend simultanément
npm run dev

# OU séparément :
npm run dev:frontend  # Frontend sur http://localhost:3000
npm run dev:backend   # Backend sur http://localhost:3001
```

## 🏗️ Structure du Projet

```
comhotel/
├── apps/
│   ├── frontend/          # Next.js + React + Tailwind
│   └── backend/           # NestJS + TypeScript
├── packages/
│   ├── shared-types/      # Types partagés
│   └── shared-utils/      # Utilitaires partagés
├── docs/                  # Documentation complète
└── supabase/             # Configuration Supabase
```

## 🧪 Développement avec Mock

Le projet est configuré pour utiliser des **mocks** pendant le développement :

- ✅ **Base de données** : Mock en mémoire (voir services)
- ✅ **Bcrypt** : Mock pour les tests
- ✅ **Stripe** : Mock pour les tests
- ✅ **Supabase** : Utilisez Supabase local pour tester

### Tests

```bash
# Lancer tous les tests
npm test

# Tests avec watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📚 Documentation Complète

Consultez le dossier `docs/` pour :

- [Architecture](./docs/architecture.md) - Vue d'ensemble de l'architecture
- [API](./docs/api.md) - Documentation de l'API REST
- [Base de données](./docs/database-schema.md) - Schéma de la BDD
- [Tests](./docs/testing.md) - Guide complet des tests
- [Déploiement](./docs/deployment.md) - Guide de déploiement

## 🚀 Fonctionnalités Implémentées

### Backend (NestJS)
- ✅ Module Users (CRUD)
- ✅ Module Auth (JWT + OAuth2)
- ✅ Module Hotels (CRUD)
- ✅ Module Rooms (CRUD)
- ✅ Module Bookings (CRUD)
- ✅ Module Payments (Stripe)
- ✅ Module Search (Recherche intelligente)
- ✅ Module Reviews
- ✅ Module Notifications
- ✅ Module Admin

### Frontend (Next.js)
- ✅ Page d'accueil
- ✅ Authentification (Login/Register)
- ✅ Configuration Tailwind CSS
- ✅ API Client (Axios)
- ✅ Intégration Supabase

## 🛠️ Technologies Utilisées

### Frontend
- Next.js 14+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios

### Backend
- NestJS
- TypeScript
- Passport.js + JWT
- Supabase
- Stripe

### DevOps
- GitHub Actions (CI/CD)
- Coolify (Hébergement)
- Jest (Tests)

## 📝 Règles Importantes

### Pour les Tests
1. ✅ Utiliser des Mocks pour la BDD
2. ✅ Utiliser des Mocks pour bcrypt
3. ✅ 1 test = 1 comportement
4. ✅ Noms de tests très explicites
5. ✅ Pas d'appel réseau réel
6. ✅ Tous les tests doivent passer
7. ✅ Préserver les signatures publiques
8. ✅ Préserver les formats de retour

### Pour le Code
- Suivre les conventions TypeScript
- Utiliser Prettier pour le formatage
- Tests obligatoires pour chaque fonctionnalité
- Pas de code non testé en production

## 🆘 Aide

Si vous rencontrez des problèmes :

1. Vérifiez que Node.js >= 20.0.0 est installé
2. Vérifiez que toutes les dépendances sont installées (`npm install`)
3. Vérifiez les variables d'environnement
4. Consultez la documentation dans `docs/`

## 🎯 Prochaines Implémentations

1. **Implémenter les DTOs complets** pour tous les modules
2. **Ajouter les tests unitaires** pour chaque service
3. **Intégrer Supabase réel** (remplacer les mocks)
4. **Intégrer Stripe réel** pour les paiements
5. **Implémenter la recherche intelligente**
6. **Ajouter les pages frontend manquantes** (search, hotels, booking, etc.)
7. **Implémenter l'upload d'images**
8. **Ajouter la validation complète** avec class-validator
9. **Configurer OAuth2** pour Google/Facebook
10. **Déployer sur Coolify**

## 📞 Support

Pour toute question, consultez la documentation ou créez une issue.

Bon développement ! 🚀
