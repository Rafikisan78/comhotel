# 🔧 Guide de Dépannage - Inscription Bloquée

## ❌ Problème Rencontré

### Symptômes
- Bouton reste sur "Inscription en cours..." indéfiniment
- Aucune réponse du backend
- Timeout après plusieurs minutes
- Interface bloquée

### Cause Identifiée
Le backend NestJS était bloqué et ne répondait plus aux requêtes.

---

## ✅ Solution Appliquée

### 1. Redémarrer le Backend
```bash
# Arrêter le backend (Ctrl+C dans le terminal)
# Puis relancer:
cd c:\Users\elias\comhotel\apps\backend
npm run dev
```

**Attendez le message**:
```
🚀 Backend running on http://localhost:3001
[Nest] Application successfully started
```

### 2. Vérifier que le Backend Répond
```bash
# Test simple
curl http://localhost:3001
# Devrait retourner "Hello" ou une réponse

# Test API inscription
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
```

**Réponse attendue** (en quelques secondes):
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "guest"
  },
  "accessToken": "eyJ..."
}
```

---

## 🔍 Diagnostic du Problème

### Pourquoi le Backend se Bloquait?

**Causes Possibles:**

1. **Bcrypt Bloque** (SALT_ROUNDS = 10)
   - Bcrypt peut prendre 2-5 secondes pour hasher
   - Si la bibliothèque native a un problème, ça peut bloquer indéfiniment

2. **Erreur Non Gérée**
   - Une exception non catchée peut bloquer le thread

3. **Dépendance Native Corrompue**
   - bcrypt est une dépendance native (C++)
   - Si mal compilée, peut causer des blocages

### Vérifications Effectuées

```bash
# ✅ Port 3001 écoute bien
netstat -ano | findstr ":3001"
# Résultat: LISTENING sur 3001

# ❌ Mais ne répond pas aux requêtes
curl http://localhost:3001/auth/register
# Résultat: Timeout (pas de réponse)
```

---

## 🎯 Processus d'Inscription - Flux Complet

### Frontend → Backend

```
1. Utilisateur remplit le formulaire
   ├─ Prénom: Rafik
   ├─ Nom: Fateh-Sound
   ├─ Email: rfateh@gmail.com
   ├─ Téléphone: 0681954500
   ├─ Mot de passe: ************
   └─ Confirmation: ************

2. Validation côté client (register/page.tsx)
   ├─ Vérifier que password === confirmPassword
   ├─ Vérifier que password.length >= 8
   └─ Si OK → envoyer requête API

3. Requête HTTP POST
   ├─ URL: http://localhost:3001/auth/register
   ├─ Headers: Content-Type: application/json
   └─ Body: {
       "email": "rfateh@gmail.com",
       "password": "************",
       "firstName": "Rafik",
       "lastName": "Fateh-Sound",
       "phone": "0681954500"
     }

4. Backend traite (auth.controller.ts)
   └─ Route: POST /auth/register
   └─ Appelle: authService.register(dto)

5. AuthService valide (auth.service.ts)
   ├─ Vérifier email et password présents
   ├─ Vérifier firstName et lastName présents
   └─ Appeler: usersService.create(dto)

6. UsersService crée l'utilisateur (users.service.ts)
   ├─ Valider email non vide
   ├─ Vérifier email unique (pas de doublon)
   ├─ Valider password >= 8 caractères
   ├─ **HASHER le mot de passe avec bcrypt** ⬅️ POINT DE BLOCAGE
   ├─ Créer l'objet User
   ├─ Sauvegarder en mémoire
   └─ Retourner user SANS le mot de passe

7. AuthService génère le token (auth.service.ts)
   ├─ Créer payload JWT: { sub: userId, email }
   └─ Signer avec jwtService.sign()

8. Réponse HTTP 201 CREATED
   └─ Body: {
       "user": { ... },
       "accessToken": "eyJ..."
     }

9. Frontend reçoit la réponse (register/page.tsx)
   ├─ Stocker token: localStorage.setItem('access_token', ...)
   ├─ Rediriger: router.push('/')
   └─ Afficher page d'accueil
```

### Point de Blocage Identifié

**Étape 6** - Hashage du mot de passe avec bcrypt:

```typescript
// hash.util.ts
static async hash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);  // ⬅️ SE BLOQUE ICI
}
```

**Temps normal**: 2-5 secondes
**Temps observé**: > 2 minutes (timeout) ❌

---

## 🔧 Solutions de Contournement

### Solution Temporaire: Réduire SALT_ROUNDS

Si le problème persiste, réduisez temporairement le nombre de rounds:

```typescript
// apps/backend/src/common/utils/hash.util.ts
export class HashUtil {
  private static readonly SALT_ROUNDS = 4;  // Au lieu de 10

  // Temps: ~500ms au lieu de 2-5s
}
```

**⚠️ Attention**: Moins sécurisé, uniquement pour le développement!

### Solution Permanente: Vérifier bcrypt

```bash
# Réinstaller bcrypt
cd apps/backend
npm uninstall bcrypt
npm install bcrypt

# Ou utiliser bcryptjs (version JavaScript pure)
npm uninstall bcrypt
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

Puis modifier hash.util.ts:
```typescript
import * as bcrypt from 'bcryptjs';  // Au lieu de 'bcrypt'
```

---

## 📊 Checklist de Vérification

### Backend
- [ ] Backend démarre sans erreur
- [ ] Message "Backend running on http://localhost:3001" affiché
- [ ] Port 3001 en écoute: `netstat -ano | findstr ":3001"`
- [ ] API répond: `curl http://localhost:3001`
- [ ] Pas d'erreur dans les logs du terminal

### Frontend
- [ ] Frontend démarre sans erreur
- [ ] Page /register accessible
- [ ] Formulaire s'affiche correctement
- [ ] Champs remplis avec données valides
- [ ] Console navigateur (F12) sans erreur rouge

### Réseau
- [ ] CORS activé dans main.ts
- [ ] Frontend appelle le bon port (3001)
- [ ] Pas de firewall bloquant

---

## 🚨 Si le Problème Persiste

### 1. Activer les Logs Détaillés

**Backend** - Ajouter dans auth.service.ts:
```typescript
async register(createUserDto: CreateUserDto) {
  console.log('📝 Début inscription:', createUserDto.email);

  console.log('✅ Validation OK');

  console.log('🔐 Début hashage mot de passe...');
  const user = await this.usersService.create(createUserDto);
  console.log('✅ Utilisateur créé:', user.id);

  console.log('🎫 Génération token...');
  const accessToken = this.generateToken(user.id, user.email);
  console.log('✅ Token généré');

  return { user, accessToken };
}
```

**Frontend** - Console navigateur (F12 → Console):
```
- Regarder les requêtes réseau (F12 → Network)
- Filtrer par "register"
- Vérifier le statut (devrait être 201)
- Vérifier la réponse
```

### 2. Tester avec des Données Simples

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.c","password":"12345678","firstName":"A","lastName":"B"}'
```

Si ça fonctionne → Problème avec les données complexes
Si ça bloque → Problème avec bcrypt ou le backend

### 3. Contourner Temporairement bcrypt

```typescript
// hash.util.ts - VERSION DEBUG UNIQUEMENT
export class HashUtil {
  static async hash(password: string): Promise<string> {
    console.log('⚠️ MODE DEBUG: Pas de hashage réel!');
    return `debug_${password}`;  // PAS DE HASH RÉEL
  }
}
```

**⚠️ DANGER**: N'utilisez jamais ceci en production!

---

## ✅ Solution Finale Recommandée

1. **Redémarrer le backend** après chaque modification
2. **Utiliser bcryptjs** au lieu de bcrypt (plus stable)
3. **Réduire SALT_ROUNDS à 8** en développement
4. **Ajouter des logs** pour identifier où ça bloque
5. **Tester avec curl** avant de tester avec le frontend

---

**Date**: 2025-12-30
**Statut**: En cours de résolution
**Prochaine Étape**: Attendre redémarrage backend et retester
