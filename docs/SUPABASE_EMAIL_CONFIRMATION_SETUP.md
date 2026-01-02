# Configuration de la Confirmation Email dans Supabase

## Étapes de Configuration dans le Dashboard Supabase

### 1. Accéder aux Paramètres d'Authentification

1. Connectez-vous à votre dashboard Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet ComHotel
3. Dans le menu de gauche, cliquez sur **Authentication** > **Settings**

### 2. Activer la Confirmation Email

Dans la section **Auth Settings** :

1. **Enable Email Confirmations**: ✅ Activez cette option
   - Cela force les nouveaux utilisateurs à confirmer leur email avant de se connecter

2. **Confirm email** : Assurez-vous que cette option est cochée

### 3. Configurer les Templates d'Email

Dans la section **Email Templates** :

1. Cliquez sur **Confirm signup**
2. Personnalisez le template (optionnel) :

```html
<h2>Confirmez votre inscription à ComHotel</h2>

<p>Bonjour,</p>

<p>Merci de vous être inscrit à ComHotel !</p>

<p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>

<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>

<p>Ou copiez ce lien dans votre navigateur :</p>
<p>{{ .ConfirmationURL }}</p>

<p>Ce lien expire dans 24 heures.</p>

<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

<p>Cordialement,<br>L'équipe ComHotel</p>
```

### 4. Configurer l'URL de Redirection

Dans **URL Configuration** :

1. **Site URL**: `http://localhost:3000` (en développement)
   - En production: `https://votre-domaine.com`

2. **Redirect URLs**: Ajoutez les URLs autorisées
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   ```

### 5. Configurer le Provider Email

Dans **Auth Providers** > **Email** :

1. ✅ **Enable Email provider**
2. ✅ **Confirm email**: Activé
3. ✅ **Secure email change**: Activé (recommandé)

### 6. Configurer SMTP (Production seulement)

Pour la production, configurez votre propre serveur SMTP :

1. Allez dans **Project Settings** > **SMTP Settings**
2. Remplissez les informations :
   - SMTP Host (ex: smtp.gmail.com)
   - SMTP Port (ex: 587)
   - SMTP Username
   - SMTP Password
   - Sender email
   - Sender name

**Note**: En développement, Supabase utilise son propre service d'email (limité à 3 emails/heure).

### 7. Vérifier la Configuration

Testez que tout fonctionne :

```bash
# Dans le terminal
curl -X POST 'VOTRE_SUPABASE_URL/auth/v1/signup' \
-H "apikey: VOTRE_ANON_KEY" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "TestPassword123!"
}'
```

Vous devriez recevoir un email de confirmation.

## Configuration dans le Code

### Variables d'Environnement

Vérifiez que votre `.env` contient :

```env
SUPABASE_URL=https://votre-project-id.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
FRONTEND_URL=http://localhost:3000
```

## Flux de Confirmation Email

### 1. Inscription

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
    },
    emailRedirectTo: `${FRONTEND_URL}/auth/confirm`,
  }
});

// data.user.email_confirmed_at sera null
// Un email de confirmation est envoyé automatiquement
```

### 2. Confirmation

L'utilisateur clique sur le lien dans l'email, qui le redirige vers :
```
http://localhost:3000/auth/confirm?token=...&type=signup
```

### 3. Vérification du Token

```typescript
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: token,
  type: 'signup'
});

// Si succès, l'utilisateur est connecté automatiquement
```

### 4. Accès Restreint

```typescript
// Vérifier si l'email est confirmé
const { data: { user } } = await supabase.auth.getUser();

if (!user.email_confirmed_at) {
  throw new Error('Veuillez confirmer votre email');
}
```

## Gestion des Cas d'Usage

### Renvoyer l'Email de Confirmation

```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com',
});
```

### Délai d'Expiration

- Par défaut : **24 heures**
- Configurable dans le dashboard

### Limites

- **Développement** : 3 emails/heure avec le service Supabase
- **Production** : Illimité avec votre propre SMTP

## Sécurité

### Bonnes Pratiques

1. ✅ Toujours vérifier `email_confirmed_at` avant opérations sensibles
2. ✅ Utiliser HTTPS en production
3. ✅ Configurer un SMTP sécurisé en production
4. ✅ Limiter les tentatives de renvoi d'email (rate limiting)
5. ✅ Logger les tentatives de confirmation

### Row Level Security (RLS)

Ajoutez une policy pour vérifier l'email confirmé :

```sql
CREATE POLICY "Les utilisateurs doivent avoir confirmé leur email"
ON public.users
FOR ALL
USING (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
```

## Troubleshooting

### Email non reçu

1. Vérifier les spam/courrier indésirable
2. Vérifier la configuration SMTP (production)
3. Vérifier les logs dans le dashboard Supabase

### Lien expiré

1. Utiliser l'endpoint de renvoi d'email
2. Vérifier la durée d'expiration dans les settings

### Redirection incorrecte

1. Vérifier `FRONTEND_URL` dans le code
2. Vérifier les **Redirect URLs** dans le dashboard
3. Vérifier que l'URL est autorisée dans **Site URL**

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Configuration SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
