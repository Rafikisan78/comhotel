# Guide de Démarrage Rapide - ComHotel

> Ce guide vous permettra de démarrer le projet ComHotel en moins de 10 minutes.

## ⚡ Démarrage Rapide (5 minutes)

### 1. Prérequis

Vérifiez que vous avez :
- ✅ Node.js v18+ installé : `node --version`
- ✅ npm v9+ installé : `npm --version`
- ✅ Git installé : `git --version`

### 2. Clone et Installation

```bash
# Cloner le repository
git clone https://github.com/Rafikisan78/comhotel.git
cd comhotel

# Installer les dépendances backend
cd apps/backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### 3. Configuration Rapide

**Backend** - Créer `apps/backend/.env` :
```env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://qbmmmkceevwbifvwnlfx.supabase.co
SUPABASE_SERVICE_KEY=votre-service-key
SUPABASE_ANON_KEY=votre-anon-key

# JWT
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Créer `apps/frontend/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://qbmmmkceevwbifvwnlfx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

### 4. Lancer l'Application

**Terminal 1 - Backend** :
```bash
cd apps/backend
npm run dev
```
➡️ Backend disponible sur http://localhost:3001

**Terminal 2 - Frontend** :
```bash
cd apps/frontend
npm run dev
```
➡️ Frontend disponible sur http://localhost:3000

### 5. Premier Test

1. Ouvrir http://localhost:3000
2. Cliquer sur "S'inscrire"
3. Créer un compte avec :
   - Email : `test@example.com`
   - Mot de passe : `TestPass123!@#`
   - Prénom et nom
4. Se connecter
5. Accéder au profil

## 🎯 Scénarios de Test

### Scénario 1 : Inscription et Connexion

```bash
# 1. Ouvrir http://localhost:3000
# 2. Cliquer sur "S'inscrire"
# 3. Remplir le formulaire
# 4. Vérifier la redirection vers /profile
```

### Scénario 2 : Navigation Hôtels

```bash
# 1. Aller sur http://localhost:3000/hotels
# 2. Voir la liste des hôtels (si base de données remplie)
# 3. Cliquer sur un hôtel pour voir les détails
```

### Scénario 3 : Administration (compte admin requis)

```bash
# 1. Se connecter avec admin@comhotel.com / Admin2024!@#$
# 2. Aller sur /profile
# 3. Cliquer sur "Gérer les utilisateurs"
# 4. Tester les fonctionnalités admin :
#    - Filtrer par statut
#    - Modifier un utilisateur
#    - Supprimer un utilisateur
#    - Restaurer un utilisateur
```

## 📊 Vérification de l'Installation

### Vérifier le Backend

```bash
# Test de santé (à implémenter)
curl http://localhost:3001/health

# Test de login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@comhotel.com","password":"Admin2024!@#$"}'
```

### Vérifier le Frontend

1. Ouvrir http://localhost:3000
2. Vérifier que la page d'accueil s'affiche
3. Vérifier les liens de navigation

## 🐛 Résolution de Problèmes Courants

### Backend ne démarre pas

**Erreur : "Cannot find module"**
```bash
cd apps/backend
rm -rf node_modules package-lock.json
npm install
```

**Erreur : "Port 3001 already in use"**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

**Erreur : "Database connection failed"**
- Vérifier SUPABASE_URL et SUPABASE_SERVICE_KEY dans .env
- Vérifier que les migrations sont appliquées

### Frontend ne démarre pas

**Erreur : "Cannot find module"**
```bash
cd apps/frontend
rm -rf node_modules .next package-lock.json
npm install
```

**Erreur : "API connection failed"**
- Vérifier que le backend est démarré
- Vérifier NEXT_PUBLIC_API_URL dans .env.local

### Problèmes de CORS

Si vous voyez des erreurs CORS dans la console :
1. Vérifier que FRONTEND_URL est correct dans backend/.env
2. Redémarrer le backend

### Base de données vide

Si aucun hôtel ne s'affiche :
```bash
# Exécuter les seeds (à créer)
cd apps/backend
npm run seed
```

## 📚 Prochaines Étapes

### 1. Configurer la Base de Données

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour :
- Schéma de base de données complet
- Guide de migration
- Scripts de seed

### 2. Tester avec Postman

```bash
# Importer les collections
# 1. Ouvrir Postman
# 2. Importer postman/ComHotel-Complete-Tests.postman_collection.json
# 3. Importer postman/ComHotel-Complete-Tests.postman_environment.json
# 4. Exécuter les tests
```

### 3. Exécuter les Tests

```bash
# Backend
cd apps/backend
npm test
npm run test:cov

# Frontend
cd apps/frontend
npm test
```

### 4. Développement

- Lire [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture du projet
- Lire [API.md](API.md) - Documentation API complète
- Lire [SECURITY.md](SECURITY.md) - Guide de sécurité
- Consulter [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution

## 🔑 Comptes de Test

### Compte Admin
```
Email: admin@comhotel.com
Password: Admin2024!@#$
Role: admin
```

### Compte Propriétaire (à créer)
```
# Créer via /auth/register puis mettre à jour le rôle en base :
UPDATE users SET role = 'hotel_owner' WHERE email = 'votre-email';
```

### Compte Guest
Tout compte créé via `/auth/register` est automatiquement un `guest`.

## 📖 Documentation Complète

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Vue d'ensemble du projet |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture technique détaillée |
| [API.md](API.md) | Documentation API complète |
| [SECURITY.md](SECURITY.md) | Guide de sécurité |
| [TESTING.md](TESTING.md) | Guide des tests |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Guide de déploiement |

## 💡 Astuces Utiles

### Hot Reload

Les deux serveurs supportent le hot reload :
- Backend : Modifiez un fichier `.ts`, le serveur redémarre automatiquement
- Frontend : Modifiez un composant, la page se recharge automatiquement

### Logs

**Backend** :
```bash
# Les logs s'affichent dans le terminal
# Format : [Nest] <PID> - <DATE> <LEVEL> [<CONTEXT>] <MESSAGE>
```

**Frontend** :
```bash
# Logs dans la console du navigateur (F12)
# Logs serveur dans le terminal
```

### Variables d'Environnement

**Backend** :
- Rechargées au redémarrage uniquement
- Accès via `process.env.VARIABLE_NAME`
- Typées via `@nestjs/config`

**Frontend** :
- Variables préfixées `NEXT_PUBLIC_` accessibles côté client
- Autres variables uniquement côté serveur
- Rechargées au redémarrage

### Base de Données

**Voir les tables** :
```sql
-- Via Supabase Dashboard ou psql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Réinitialiser la base** (⚠️ DESTRUCTIF) :
```bash
# Sauvegarder d'abord !
pg_dump -h <host> -U <user> <database> > backup.sql

# Réinitialiser
psql -h <host> -U <user> <database> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Réappliquer les migrations
psql -h <host> -U <user> <database> -f supabase/migrations/001_initial_schema.sql
psql -h <host> -U <user> <database> -f supabase/migrations/20260110_verify_and_update_tables.sql
```

## 🎓 Formation

### Tutoriels Recommandés

1. **NestJS** : https://docs.nestjs.com/first-steps
2. **Next.js** : https://nextjs.org/learn
3. **Supabase** : https://supabase.com/docs/guides/getting-started
4. **TypeScript** : https://www.typescriptlang.org/docs/

### Concepts Clés à Comprendre

- **Guards** : Protection des routes (JwtAuthGuard, AdminGuard)
- **DTOs** : Validation des données entrantes
- **Entities** : Modèles de données
- **Services** : Logique métier
- **Controllers** : Points d'entrée API
- **Modules** : Organisation du code

## 📞 Besoin d'Aide ?

- 📖 Lire la [documentation complète](README.md)
- 🐛 Signaler un [bug](https://github.com/Rafikisan78/comhotel/issues)
- 💬 Poser une [question](https://github.com/Rafikisan78/comhotel/discussions)
- 📧 Email : support@comhotel.com

---

**Bon développement ! 🚀**
