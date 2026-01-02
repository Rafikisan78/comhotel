# 🔒 Rotation des Clés de Sécurité

## ⚠️ URGENT : Régénération des Clés Supabase

Si vos clés ont été exposées (commit Git, conversation, logs, etc.), suivez immédiatement ces étapes :

### 1. Régénérer les Clés Supabase

#### Dashboard Supabase

1. Connectez-vous à https://supabase.com/dashboard
2. Sélectionnez votre projet ComHotel
3. Allez dans **Project Settings** > **API**
4. Vous verrez :
   - **Project URL** : Peut rester (URL publique)
   - **anon/public key** : Cliquez sur "Reveal" puis "Reset"
   - **service_role key** : Cliquez sur "Reveal" puis "Reset"

⚠️ **ATTENTION** : La régénération des clés invalidera immédiatement toutes les clés existantes !

#### Impacts de la Régénération

- ❌ Toutes les applications utilisant les anciennes clés cesseront de fonctionner
- ❌ Tous les utilisateurs seront déconnectés
- ✅ Les données en base restent intactes
- ✅ Les migrations SQL ne sont pas affectées

### 2. Mettre à Jour les Fichiers .env

**Backend** : `apps/backend/.env`

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (Supabase) - NOUVELLES CLÉS
SUPABASE_URL=https://qbmmmkceevwbifvwnlfx.supabase.co
SUPABASE_ANON_KEY=NOUVELLE_CLE_ANON_ICI
```

**Frontend** : `apps/frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://qbmmmkceevwbifvwnlfx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=NOUVELLE_CLE_ANON_ICI
```

### 3. Régénérer le JWT Secret

Pour plus de sécurité, régénérez également votre JWT secret :

```bash
# Générer un nouveau secret aléatoire
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans `JWT_SECRET` de votre `.env`.

### 4. Vérifier le .gitignore

Assurez-vous que `.gitignore` contient :

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 5. Nettoyer l'Historique Git (si clés commitées)

⚠️ **Seulement si vous avez commité des clés par erreur !**

#### Option 1 : BFG Repo-Cleaner (Recommandé)

```bash
# Installer BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Nettoyer les fichiers .env de l'historique
bfg --delete-files .env

# Nettoyer et pousser
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

#### Option 2 : git-filter-repo

```bash
# Installer git-filter-repo
pip install git-filter-repo

# Supprimer .env de l'historique
git filter-repo --path apps/backend/.env --invert-paths
git filter-repo --path apps/frontend/.env.local --invert-paths

# Force push
git push --force --all
```

#### Option 3 : Réinitialiser le Repository (Dernière option)

Si le projet est récent et que vous voulez repartir à zéro :

```bash
# 1. Sauvegarder votre code
cd ..
cp -r comhotel comhotel-backup

# 2. Supprimer .git
cd comhotel
rm -rf .git

# 3. Réinitialiser
git init
git add .
git commit -m "Initial commit - Clean history"

# 4. Pousser sur un nouveau repo ou force push
git remote add origin https://github.com/Rafikisan78/comhotel.git
git push -u origin master --force
```

### 6. Sécuriser le Dépôt GitHub

1. **Secrets exposés** : Allez dans GitHub Settings > Security > Secret scanning
2. **Activer les alertes** : Security > Code security and analysis
3. **Vérifier les collaborateurs** : Settings > Collaborators

### 7. Checklist de Sécurité

- [ ] Nouvelles clés Supabase générées
- [ ] `.env` et `.env.local` mis à jour avec nouvelles clés
- [ ] Nouveau `JWT_SECRET` généré
- [ ] `.gitignore` vérifié
- [ ] Historique Git nettoyé (si nécessaire)
- [ ] Application redémarrée avec nouvelles clés
- [ ] Tests de connexion réussis
- [ ] Anciennes sessions invalidées

## Bonnes Pratiques de Sécurité

### Ne JAMAIS Commiter

❌ Fichiers à ne JAMAIS commiter :
- `.env`, `.env.local`, `.env.production`
- Fichiers contenant des mots de passe
- Certificats privés (`.pem`, `.key`)
- Tokens d'accès, API keys
- `database.sqlite`, fichiers de BD avec données sensibles

### Protection des Clés

✅ **À FAIRE** :
- Utiliser `.env` pour toutes les variables sensibles
- Ajouter `.env*` au `.gitignore`
- Utiliser des services de gestion de secrets (production)
  - AWS Secrets Manager
  - HashiCorp Vault
  - GitHub Secrets (CI/CD)
- Rotation régulière des clés (tous les 3-6 mois)
- Clés différentes par environnement (dev/staging/prod)

❌ **À ÉVITER** :
- Hard-coder des clés dans le code
- Partager des clés via email/chat
- Utiliser les mêmes clés en dev et prod
- Logger des variables d'environnement

### Variables d'Environnement Sûres

**Backend** : `apps/backend/.env.example`

```env
# JWT Configuration
JWT_SECRET=generate-a-random-secret-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Frontend** : `apps/frontend/.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Déploiement Production

#### Vercel / Netlify

1. Ajoutez les variables dans le dashboard
2. Ne commitez JAMAIS `.env.production`

#### Docker

```dockerfile
# Utiliser des secrets Docker
docker run --env-file .env.production myapp
```

```yaml
# docker-compose.yml
services:
  backend:
    env_file:
      - .env.production
```

#### Kubernetes

```yaml
# Utiliser des ConfigMaps et Secrets
apiVersion: v1
kind: Secret
metadata:
  name: supabase-credentials
type: Opaque
data:
  anon-key: <base64-encoded-key>
```

## Que Faire en Cas d'Exposition

1. **Immédiat** (dans l'heure) :
   - [ ] Régénérer TOUTES les clés exposées
   - [ ] Déconnecter tous les utilisateurs
   - [ ] Vérifier les logs pour activité suspecte

2. **Court terme** (24h) :
   - [ ] Audit de sécurité complet
   - [ ] Notification aux utilisateurs (si données exposées)
   - [ ] Nettoyer l'historique Git

3. **Long terme** (semaine) :
   - [ ] Mettre en place scanning automatique (GitHub Advanced Security)
   - [ ] Formation équipe sur bonnes pratiques
   - [ ] Documentation des procédures

## Outils de Sécurité

### Détection de Secrets

```bash
# TruffleHog - Scanner de secrets dans Git
pip install truffleHog
truffleHog --regex --entropy=True .

# GitLeaks - Alternative
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source="/path"

# GitHub Secret Scanning (automatique sur repos publics)
```

### Pre-commit Hook

Créez `.git/hooks/pre-commit` :

```bash
#!/bin/bash

# Vérifier si des fichiers .env sont stagés
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$"; then
    echo "❌ ERREUR: Vous essayez de commiter un fichier .env !"
    echo "Annulation du commit."
    exit 1
fi

# Vérifier les secrets avec pattern matching
if git diff --cached | grep -E "SUPABASE_.*KEY|JWT_SECRET|STRIPE_.*KEY"; then
    echo "⚠️  ATTENTION: Possible secret détecté dans le commit !"
    echo "Vérifiez que vous ne commitez pas de clés sensibles."
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

Rendez-le exécutable :

```bash
chmod +x .git/hooks/pre-commit
```

## Support

En cas de problème, contactez :
- **Supabase Support** : https://supabase.com/support
- **GitHub Security** : https://github.com/security

## Ressources

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
