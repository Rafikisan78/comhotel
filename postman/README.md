# 📮 Guide d'Importation Postman - ComHotel API

## 🚀 Installation Rapide

### Étape 1 : Importer la Collection

1. Ouvrez **Postman**
2. Cliquez sur **Import** (bouton en haut à gauche)
3. Sélectionnez le fichier : `ComHotel-API-Collection.postman_collection.json`
4. Cliquez sur **Import**

✅ Vous devriez voir la collection "**ComHotel API - Complete Test Suite**" apparaître

### Étape 2 : Importer l'Environnement

1. Dans Postman, cliquez sur **Environments** (icône d'engrenage en haut à droite)
2. Cliquez sur **Import**
3. Sélectionnez le fichier : `ComHotel-Environment.postman_environment.json`
4. Cliquez sur **Import**

✅ Vous devriez voir l'environnement "**ComHotel - Development**" apparaître

### Étape 3 : Activer l'Environnement

1. Dans le menu déroulant en haut à droite (à côté de l'œil)
2. Sélectionnez "**ComHotel - Development**"

✅ L'environnement est maintenant actif

---

## 🧪 Séquence de Tests Recommandée

### 📧 Test 1 : Confirmation Email avec Supabase Auth

**Dossier**: `Auth - Supabase`

1. **1. Register (Inscription avec Email)**
   - ⚠️ **Modifiez** `TEST_EMAIL` dans l'environnement avec VOTRE email réel
   - Exécutez la requête
   - ✅ Attendu : Code 200, `email_confirmed_at: null`
   - 📧 **Vérifiez votre boîte email** pour le lien de confirmation

2. **2. Resend Confirmation Email** (optionnel)
   - Si vous n'avez pas reçu l'email
   - Limite : 1 renvoi par minute

3. **3. Login AVANT Confirmation (Devrait échouer)**
   - Exécutez la requête
   - ✅ Attendu : Code 400, erreur "Email not confirmed"

4. **📧 Cliquez sur le lien dans l'email**
   - Copiez le `token_hash` depuis l'URL
   - Format : `?token_hash=xxxxx&type=signup`

5. **4. Verify Email Token**
   - Collez le `token_hash` dans le body
   - Exécutez la requête
   - ✅ Attendu : Code 200, `email_confirmed_at` rempli

6. **5. Login APRÈS Confirmation (Devrait réussir)**
   - Exécutez la requête
   - ✅ Attendu : Code 200, access_token reçu

7. **6. Get Current User**
   - Vérifiez les infos de l'utilisateur connecté
   - Vérifiez que `email_confirmed_at` n'est pas null

8. **7. Logout**
   - Déconnexion

---

### 🔐 Test 2 : Backend NestJS (Système JWT actuel)

**Dossier**: `Auth - Backend NestJS`

1. **Login (Backend API)**
   - Utilisez les credentials admin : `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - ✅ Récupère un token JWT

2. Utilisez `BACKEND_ACCESS_TOKEN` pour les requêtes suivantes

---

### 👥 Test 3 : Gestion des Utilisateurs (CRUD)

**Dossier**: `Users - CRUD`

**Prérequis** : Être connecté en tant qu'admin (exécuter Login Backend d'abord)

1. **Get All Users (Admin)** - Liste complète incluant supprimés
2. **Get Active Users** - Utilisateurs actifs uniquement
3. **Get User by ID** - Détails d'un utilisateur
4. **Update User** - Modifier prénom, nom, téléphone
5. **Soft Delete User (Admin)** - Suppression douce
6. **Restore User (Admin)** - Restauration
7. **Bulk Delete Users (Admin)** - Suppression multiple

---

## 🔧 Variables d'Environnement

### Variables Configurées

| Variable | Valeur | Description |
|----------|--------|-------------|
| `SUPABASE_URL` | https://...supabase.co | URL de votre projet Supabase |
| `SUPABASE_ANON_KEY` | eyJ... | Clé anon de Supabase (déjà remplie) |
| `BACKEND_URL` | http://localhost:3001 | URL du backend NestJS |
| `FRONTEND_URL` | http://localhost:3000 | URL du frontend Next.js |
| `TEST_EMAIL` | test.confirmation@... | **⚠️ À MODIFIER avec votre email** |
| `TEST_PASSWORD` | TestPassword123! | Mot de passe pour les tests |
| `ADMIN_EMAIL` | rfateh@gmail.com | Email admin (déjà configuré) |
| `ADMIN_PASSWORD` | Alouette1234.! | Mot de passe admin (déjà configuré) |

### Variables Auto-remplies

Ces variables sont automatiquement remplies par les tests :

- `ACCESS_TOKEN` - Token Supabase Auth
- `REFRESH_TOKEN` - Refresh token Supabase
- `BACKEND_ACCESS_TOKEN` - Token JWT backend
- `USER_ID` - ID de l'utilisateur Supabase
- `BACKEND_USER_ID` - ID de l'utilisateur backend
- `USER_TO_DELETE_ID` - ID pour tests de suppression

---

## 📋 Checklist Avant de Tester

- [ ] Backend NestJS lancé (`npm run dev` dans `apps/backend`)
- [ ] Frontend Next.js lancé (`npm run dev` dans `apps/frontend`)
- [ ] Supabase configuré avec confirmation email activée
- [ ] SMTP configuré OU accepter limite de 3 emails/heure
- [ ] Variable `TEST_EMAIL` modifiée avec un **email réel accessible**
- [ ] Environnement "ComHotel - Development" activé dans Postman

---

## 🎯 Scénario de Test Complet

### Objectif : Tester le flux complet d'inscription avec confirmation email

1. ✅ **Inscription** → Email non confirmé
2. ✅ **Tentative de login** → Refusé
3. ✅ **Clic sur lien email** → Email confirmé
4. ✅ **Login réussi** → Token reçu
5. ✅ **Accès aux ressources** protégées

**Durée estimée** : 5-10 minutes

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Les fichiers Postman contiennent vos vraies clés API.

### ⚠️ Ne PAS Commiter ces Fichiers !

Vérifiez que `.gitignore` contient :

```gitignore
# Postman
postman/ComHotel-Environment.postman_environment.json
```

### ✅ Fichiers à Commiter

- ✅ `postman/ComHotel-API-Collection.postman_collection.json` (collection sans secrets)
- ✅ `postman/README.md` (ce fichier)

### ❌ Fichiers à NE PAS Commiter

- ❌ `postman/ComHotel-Environment.postman_environment.json` (contient clés API)

---

## 🐛 Troubleshooting

### Erreur "Could not get response"

- ✅ Vérifiez que le backend est lancé (`http://localhost:3001`)
- ✅ Vérifiez que `BACKEND_URL` est correct dans l'environnement

### Email non reçu

- ✅ Vérifiez les spams
- ✅ Vérifiez la configuration SMTP dans Supabase Dashboard
- ✅ Limite : 3 emails/heure avec le service gratuit Supabase

### Login échoue avec "Email not confirmed"

- ✅ C'est normal si vous n'avez pas cliqué sur le lien de confirmation
- ✅ Vérifiez dans Supabase Dashboard > Auth > Users que "Email Confirmed" est coché

### Token expiré

- ✅ Les tokens Supabase expirent après 1 heure
- ✅ Reconnectez-vous pour obtenir un nouveau token

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Postman](https://learning.postman.com/docs/getting-started/introduction/)
- [Guide de test complet](../docs/TESTING_EMAIL_CONFIRMATION.md)

---

**Projet ComHotel** - v1.6 (Email Confirmation)
Dernière mise à jour : 2026-01-02
