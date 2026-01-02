# 🧪 Guide de Test - Confirmation Email

## Prérequis

1. ✅ SMTP configuré dans Supabase Dashboard (ou utiliser le service gratuit)
2. ✅ Confirmation email activée : **Authentication** > **Providers** > **Email** > "Confirm email" ✅
3. ✅ Thunder Client installé dans VS Code

## 📋 Étapes de Test avec Thunder Client

### Étape 1 : Configurer les Variables d'Environnement

1. Ouvrez Thunder Client dans VS Code
2. Allez dans l'onglet **Env**
3. Créez ou modifiez l'environnement "Development" :

```json
{
  "SUPABASE_URL": "https://votre-project-id.supabase.co",
  "SUPABASE_ANON_KEY": "votre_anon_key",
  "ACCESS_TOKEN": ""
}
```

### Étape 2 : Importer la Collection de Tests

1. Dans Thunder Client, cliquez sur **Collections**
2. Cliquez sur **Menu** (3 points) > **Import**
3. Sélectionnez le fichier : `thunder-tests/email-confirmation-tests.json`

### Étape 3 : Exécuter les Tests

#### Test 1 : Inscription avec Confirmation Email ✉️

**Requête** :
```http
POST {{SUPABASE_URL}}/auth/v1/signup
apikey: {{SUPABASE_ANON_KEY}}
Content-Type: application/json

{
  "email": "test.confirmation@example.com",
  "password": "TestPassword123!",
  "options": {
    "data": {
      "first_name": "Test",
      "last_name": "Confirmation"
    },
    "emailRedirectTo": "http://localhost:3000/auth/confirm"
  }
}
```

**Résultat attendu** :
```json
{
  "id": "uuid-de-l'utilisateur",
  "email": "test.confirmation@example.com",
  "email_confirmed_at": null,  // ⚠️ NULL car pas encore confirmé
  "created_at": "2026-01-02T...",
  "user_metadata": {
    "first_name": "Test",
    "last_name": "Confirmation"
  }
}
```

**Actions** :
1. ✅ Notez le `access_token` dans la réponse
2. ✅ Copiez-le dans la variable `ACCESS_TOKEN` de votre environnement
3. ✅ **Vérifiez votre boîte email** (test.confirmation@example.com ou votre email configuré dans SMTP)

---

#### Test 2 : Vérifier l'État de l'Utilisateur (Non confirmé) 🔍

**Requête** :
```http
GET {{SUPABASE_URL}}/auth/v1/user
apikey: {{SUPABASE_ANON_KEY}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Résultat attendu** :
```json
{
  "id": "uuid",
  "email": "test.confirmation@example.com",
  "email_confirmed_at": null,  // ⚠️ Toujours NULL
  "confirmed_at": null
}
```

---

#### Test 3 : Renvoyer l'Email de Confirmation 🔄

**Requête** :
```http
POST {{SUPABASE_URL}}/auth/v1/resend
apikey: {{SUPABASE_ANON_KEY}}
Content-Type: application/json

{
  "type": "signup",
  "email": "test.confirmation@example.com"
}
```

**Résultat attendu** :
```json
{
  "message": "Confirmation email sent"
}
```

⚠️ **Limite** : 1 renvoi toutes les 60 secondes

---

#### Test 4 : Login AVANT Confirmation (Devrait échouer) ❌

**Requête** :
```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
apikey: {{SUPABASE_ANON_KEY}}
Content-Type: application/json

{
  "email": "test.confirmation@example.com",
  "password": "TestPassword123!"
}
```

**Résultat attendu** :
```json
{
  "error": "Email not confirmed",
  "error_description": "Email not confirmed"
}
```

✅ C'est normal ! L'utilisateur doit confirmer son email avant de se connecter.

---

#### Test 5 : Confirmer l'Email (Cliquez sur le lien) 📧

1. **Ouvrez votre boîte email** (celle configurée dans SMTP ou test.confirmation@example.com)
2. **Trouvez l'email** de Supabase avec le titre : "Confirmez votre inscription"
3. **Cliquez sur le lien** de confirmation

Le lien ressemble à :
```
http://localhost:3000/auth/confirm?token_hash=xxxxx&type=signup
```

4. **Notez le `token_hash`** dans l'URL

**Alternative (via API)** :
```http
POST {{SUPABASE_URL}}/auth/v1/verify
apikey: {{SUPABASE_ANON_KEY}}
Content-Type: application/json

{
  "type": "signup",
  "token_hash": "COLLER_LE_TOKEN_ICI"
}
```

**Résultat attendu** :
```json
{
  "access_token": "nouveau_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "test.confirmation@example.com",
    "email_confirmed_at": "2026-01-02T...",  // ✅ Maintenant confirmé !
    "confirmed_at": "2026-01-02T..."
  }
}
```

---

#### Test 6 : Login APRÈS Confirmation (Devrait réussir) ✅

**Requête** :
```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
apikey: {{SUPABASE_ANON_KEY}}
Content-Type: application/json

{
  "email": "test.confirmation@example.com",
  "password": "TestPassword123!"
}
```

**Résultat attendu** :
```json
{
  "access_token": "token_jwt",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "test.confirmation@example.com",
    "email_confirmed_at": "2026-01-02T...",  // ✅ Confirmé !
    "confirmed_at": "2026-01-02T..."
  }
}
```

✅ **Succès !** L'utilisateur peut maintenant se connecter.

---

## 🔍 Vérification dans Supabase Dashboard

1. Allez dans **Authentication** > **Users**
2. Trouvez l'utilisateur `test.confirmation@example.com`
3. Vérifiez la colonne **Email Confirmed** : ✅ (ou la date)

---

## 🐛 Troubleshooting

### Email non reçu

1. ✅ Vérifiez les **spams/courrier indésirable**
2. ✅ Vérifiez la configuration SMTP dans Supabase Dashboard
3. ✅ Vérifiez les logs dans **Logs** > **Auth Logs**
4. ✅ Si vous utilisez le service gratuit Supabase : limite de 3 emails/heure

### Erreur "Email not confirmed" persiste

1. ✅ Vérifiez que vous avez cliqué sur le lien dans l'email
2. ✅ Vérifiez dans le dashboard que "Email Confirmed" est coché
3. ✅ Essayez de renvoyer l'email de confirmation

### Token expiré

1. ✅ Le token de confirmation expire après **24 heures**
2. ✅ Utilisez l'endpoint `/resend` pour renvoyer un nouvel email

### Login fonctionne SANS confirmation

⚠️ La confirmation email n'est **pas activée** dans le dashboard :
- Allez dans **Authentication** > **Providers** > **Email**
- Activez "**Confirm email**"

---

## 📊 Récapitulatif des Statuts

| Étape | email_confirmed_at | Peut se connecter ? |
|-------|-------------------|---------------------|
| Après inscription | `null` | ❌ Non |
| Après confirmation | `2026-01-02T...` | ✅ Oui |

---

## 🎯 Prochaines Étapes

Une fois les tests réussis :
1. ✅ Intégrer dans le backend NestJS
2. ✅ Créer la page frontend `/auth/confirm`
3. ✅ Ajouter un bouton "Renvoyer l'email"
4. ✅ Tester le flux complet end-to-end

---

## 📝 Notes

- **Email de test** : Utilisez un vrai email accessible (Gmail, Hotmail, etc.)
- **SMTP** : En développement, le service gratuit Supabase suffit (3 emails/h)
- **Production** : Configurez votre propre SMTP pour emails illimités
