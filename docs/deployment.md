# Guide de Déploiement

## Environnements

### Développement
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Supabase: Local

### Production
- Hébergement: Coolify
- CI/CD: GitHub Actions

## Configuration Coolify

### Prérequis
1. Serveur avec Docker installé
2. Coolify installé
3. Domaine configuré

### Déploiement Backend

1. **Créer une nouvelle application**
   - Type: Node.js
   - Port: 3001
   - Build command: `npm run build`
   - Start command: `npm run start:prod`

2. **Variables d'environnement**
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_production_url
SUPABASE_SERVICE_KEY=your_production_key
JWT_SECRET=your_production_secret
STRIPE_SECRET_KEY=your_production_stripe_key
FRONTEND_URL=https://your-domain.com
```

3. **Healthcheck**
   - Path: `/health`
   - Interval: 30s

### Déploiement Frontend

1. **Créer une nouvelle application**
   - Type: Next.js
   - Port: 3000
   - Build command: `npm run build`
   - Start command: `npm run start`

2. **Variables d'environnement**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
```

## CI/CD avec GitHub Actions

Le fichier `.github/workflows/ci.yml` est configuré pour :

1. **Tests automatiques**
   - Linter
   - Tests unitaires
   - Tests d'intégration
   - Vérification de build

2. **Déploiement automatique**
   - Sur merge vers `main`
   - Déploiement sur Coolify via webhook

## Supabase Production

### Configuration

1. **Créer un projet Supabase**
2. **Exécuter les migrations**
```bash
supabase db push
```

3. **Configurer les politiques RLS**
4. **Configurer l'authentification OAuth**

## Stripe Production

1. **Obtenir les clés de production**
2. **Configurer les webhooks**
   - URL: `https://api.your-domain.com/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`

## Monitoring

### Logs
- Coolify fournit les logs en temps réel
- Configurer des alertes pour les erreurs

### Métriques
- Temps de réponse API
- Taux d'erreur
- Utilisation ressources

## Rollback

En cas de problème:

1. **Via Coolify**
   - Revenir à la version précédente
   - Redémarrer l'application

2. **Via Git**
```bash
git revert HEAD
git push
```

## Checklist de Déploiement

- [ ] Tests passent à 100%
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Stripe configuré
- [ ] Domaines configurés
- [ ] SSL activé
- [ ] Monitoring actif
- [ ] Backup base de données configuré
