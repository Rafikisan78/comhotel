# 🧪 Guide de Test Web - ComHotel v1.6.0

**Date:** 2026-01-02
**Version:** 1.6.0 (Email Confirmation + OWASP 2024)

---

## ✅ Prérequis

### Serveurs démarrés
- ✅ **Backend** : `http://localhost:3001` (Port 3001)
- ✅ **Frontend** : `http://localhost:3000` (Port 3000)

### Configuration Supabase
- ✅ SMTP configuré pour envoi d'emails
- ✅ Redirect URL : `http://localhost:3000/auth/confirm`

---

## 📋 Plan de Test Complet (5 scénarios)

### Scénario 1 : Inscription Utilisateur (OWASP 2024)

#### Étape 1.1 : Accéder à la page d'inscription
1. Ouvrir le navigateur : `http://localhost:3000/register`
2. Vérifier l'affichage du formulaire avec les champs :
   - Prénom
   - Nom
   - Email
   - Téléphone
   - Mot de passe
   - Confirmer le mot de passe
   - Bouton "S'inscrire"

#### Étape 1.2 : Tester la validation OWASP 2024

**Test A - Mot de passe trop court (< 12 caractères)**
```
Prénom: Test
Nom: User
Email: test.short@test.com
Téléphone: 0612345678
Mot de passe: Short1!
Confirmer: Short1!
```
**Résultat attendu:** ❌ Message d'erreur "Le mot de passe doit contenir au moins 12 caractères"

**Test B - Mot de passe sans majuscule**
```
Prénom: Test
Nom: User
Email: test.nomaj@test.com
Téléphone: 0612345678
Mot de passe: motdepasse123!
Confirmer: motdepasse123!
```
**Résultat attendu:** ❌ Message d'erreur "Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial"

**Test C - Mot de passe sans caractère spécial**
```
Prénom: Test
Nom: User
Email: test.nospecial@test.com
Téléphone: 0612345678
Mot de passe: MotDePasse123
Confirmer: MotDePasse123
```
**Résultat attendu:** ❌ Message d'erreur "Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial"

**Test D - Mot de passe valide OWASP 2024** ✅
```
Prénom: Jean
Nom: Dupont
Email: jean.dupont@test.com
Téléphone: 0612345678
Mot de passe: JeanDupont2024!
Confirmer: JeanDupont2024!
```
**Résultat attendu:** ✅ Inscription réussie, email de confirmation envoyé

#### Étape 1.3 : Vérifier l'envoi de l'email
1. Ouvrir votre boîte email (jean.dupont@test.com)
2. Vérifier la réception de l'email "Confirmez votre adresse email"
3. **NE PAS CLIQUER** sur le lien pour l'instant

---

### Scénario 2 : Confirmation Email

#### Étape 2.1 : Cliquer sur le lien de confirmation
1. Dans l'email reçu, cliquer sur le bouton "Confirmer mon email"
2. Vérifier la redirection vers : `http://localhost:3000/auth/confirm?token_hash=...&type=signup`

#### Étape 2.2 : Observer les 3 états de la page /auth/confirm

**État 1 : Loading**
- Animation de chargement (spinner bleu)
- Message : "Confirmation en cours..."
- Message : "Veuillez patienter pendant que nous confirmons votre email."

**État 2 : Success** ✅
- Icône verte avec checkmark
- Message : "Email confirmé !"
- Message : "Votre email a été confirmé avec succès ! Vous pouvez maintenant vous connecter."
- Message : "Redirection vers la page de connexion dans 3 secondes..."
- Bouton : "Se connecter maintenant"

**État 3 (si erreur) : Error** ❌
- Icône rouge avec X
- Message : "Erreur de confirmation"
- Messages possibles :
  - "Le lien de confirmation est invalide ou a expiré."
  - "Email déjà confirmé."
  - "Une erreur est survenue. Veuillez réessayer."
- Boutons :
  - "Aller à la page de connexion"
  - "Créer un nouveau compte"

#### Étape 2.3 : Attendre la redirection automatique
1. Attendre 3 secondes
2. Vérifier la redirection automatique vers : `http://localhost:3000/login`

**OU** cliquer sur "Se connecter maintenant" pour redirection immédiate

---

### Scénario 3 : Connexion Utilisateur

#### Étape 3.1 : Formulaire de connexion
1. Sur la page `http://localhost:3000/login`
2. Remplir le formulaire :
   ```
   Email: jean.dupont@test.com
   Mot de passe: JeanDupont2024!
   ```
3. Cliquer sur "Se connecter"

#### Étape 3.2 : Vérifier la connexion réussie
**Résultat attendu:** ✅ Redirection vers `/profile` (ou `/`)

#### Étape 3.3 : Vérifier le localStorage
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Application" > "Local Storage" > `http://localhost:3000`
3. Vérifier la présence de :
   - `access_token` : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   - `user_id` : "UUID de l'utilisateur"

---

### Scénario 4 : Test Sécurité - Connexion sans confirmation email

#### Étape 4.1 : Créer un nouvel utilisateur SANS confirmer l'email
1. Aller sur `http://localhost:3000/register`
2. Créer un compte :
   ```
   Prénom: Marie
   Nom: Martin
   Email: marie.martin@test.com
   Téléphone: 0687654321
   Mot de passe: MarieMartin2024!
   Confirmer: MarieMartin2024!
   ```
3. **NE PAS CONFIRMER** l'email (ne pas cliquer sur le lien)

#### Étape 4.2 : Tenter de se connecter sans confirmation
1. Aller sur `http://localhost:3000/login`
2. Essayer de se connecter :
   ```
   Email: marie.martin@test.com
   Mot de passe: MarieMartin2024!
   ```

**Résultat attendu:** ❌ Message d'erreur "Email ou mot de passe incorrect" (car l'utilisateur n'existe pas encore dans la table `users`)

---

### Scénario 5 : Test Mots de Passe Invalides (OWASP 2024)

#### Test sur la page /register

**Test 5.1 : Mot de passe avec 8 caractères (ancien standard)**
```
Mot de passe: Test123!
```
**Résultat attendu:** ❌ "Le mot de passe doit contenir au moins 12 caractères"

**Test 5.2 : Mot de passe de 12 caractères mais tout en minuscule**
```
Mot de passe: testtest123!
```
**Résultat attendu:** ❌ "Le mot de passe doit contenir au moins 1 majuscule..."

**Test 5.3 : Mot de passe de 12 caractères sans chiffre**
```
Mot de passe: TestTestTest!
```
**Résultat attendu:** ❌ "Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial"

**Test 5.4 : Mot de passe de 12 caractères sans caractère spécial**
```
Mot de passe: TestTest1234
```
**Résultat attendu:** ❌ "Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial"

**Test 5.5 : Mot de passe valide OWASP 2024** ✅
```
Mot de passe: ValidPassword123!
```
**Résultat attendu:** ✅ Validation réussie

---

## 🎯 Checklist de Test Complet

### Backend (Serveurs)
- [ ] Backend sur port 3001 actif
- [ ] Frontend sur port 3000 actif

### Pages Web
- [ ] `/register` - Page d'inscription accessible
- [ ] `/login` - Page de connexion accessible
- [ ] `/auth/confirm` - Page de confirmation email accessible

### Validation OWASP 2024
- [ ] Mot de passe < 12 caractères rejeté
- [ ] Mot de passe sans majuscule rejeté
- [ ] Mot de passe sans minuscule rejeté
- [ ] Mot de passe sans chiffre rejeté
- [ ] Mot de passe sans caractère spécial rejeté
- [ ] Mot de passe valide (12+ chars + complexité) accepté

### Flux Email Confirmation
- [ ] Email de confirmation envoyé après inscription
- [ ] Lien de confirmation contient `token_hash` et `type=signup`
- [ ] Page `/auth/confirm` affiche "Confirmation en cours..." (loading)
- [ ] Page `/auth/confirm` affiche "Email confirmé !" (success)
- [ ] Redirection automatique vers `/login` après 3 secondes
- [ ] Bouton "Se connecter maintenant" fonctionne

### Sécurité
- [ ] Impossible de se connecter sans confirmation email
- [ ] Rôle `guest` forcé lors de l'inscription
- [ ] Token stocké dans localStorage après connexion
- [ ] User ID stocké dans localStorage après connexion

---

## 🔍 Vérification dans Supabase Dashboard

### Vérifier l'utilisateur dans auth.users
1. Ouvrir Supabase Dashboard : https://supabase.com/dashboard
2. Aller dans **Authentication** > **Users**
3. Chercher l'email : `jean.dupont@test.com`
4. Vérifier :
   - `email_confirmed_at` : Date/heure de confirmation (ex: `2026-01-02T14:30:00Z`)
   - `confirmation_sent_at` : Date/heure d'envoi email

### Vérifier l'utilisateur dans la table users
1. Aller dans **Table Editor** > **users**
2. Chercher l'email : `jean.dupont@test.com`
3. Vérifier :
   - `role` : `guest` (forcé par le backend)
   - `firstName` : `Jean`
   - `lastName` : `Dupont`
   - `phone` : `0612345678`
   - `deletedAt` : `null`

---

## 📊 Résultats Attendus

### ✅ Tests Réussis (9/9)
1. Inscription avec mot de passe OWASP 2024 valide
2. Email de confirmation envoyé
3. Confirmation email via lien cliquable
4. Page `/auth/confirm` affiche les 3 états correctement
5. Redirection automatique vers `/login`
6. Connexion réussie après confirmation
7. Token et User ID stockés dans localStorage
8. Impossible de se connecter sans confirmation email
9. Validation OWASP 2024 bloque les mots de passe faibles

---

## 🐛 Problèmes Connus

### Aucun problème connu actuellement

Si vous rencontrez des erreurs, vérifiez :
1. Les serveurs backend et frontend sont bien démarrés
2. Supabase SMTP est bien configuré
3. La Redirect URL dans Supabase est : `http://localhost:3000/auth/confirm`

---

**Dernière mise à jour:** 2026-01-02
**Version:** 1.6.0
**Statut:** ✅ Prêt pour tests utilisateur
