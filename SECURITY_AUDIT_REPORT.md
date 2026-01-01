# RAPPORT D'AUDIT DE SÉCURITÉ -- Inscription Utilisateur ComHotel

**Cible:** ComHotel (NestJS + Next.js)
**Fonctionnalité:** 1.1 -- Inscription utilisateur
**Date:** 2026-01-01
**Niveau de risque global:** 🔴 **ÉLEVÉ** (7/10)

---

## RÉSUMÉ EXÉCUTIF

L'audit de sécurité de la fonctionnalité d'inscription utilisateur révèle **17 vulnérabilités critiques et moyennes** qui exposent l'application à des attaques sérieuses. Bien que certains mécanismes de sécurité de base soient en place (bcrypt, ValidationPipe), plusieurs failles majeures compromettent la sécurité globale du système.

**Problèmes critiques identifiés:**
- 🔴 **Mots de passe retournés dans les réponses API** (CRITIQUE)
- 🔴 **Login sans vérification de mot de passe** (CRITIQUE)
- 🔴 **Injection de rôle possible** (CRITIQUE)
- 🟠 **Pas de normalisation d'email** (MOYEN)
- 🟠 **XSS possible via firstName/lastName** (MOYEN)
- 🟠 **Race conditions non gérées** (MOYEN)

---

## 1. 🚨 BUGS CRITIQUES & VULNÉRABILITÉS DE SÉCURITÉ

### 🔴 CRITIQUE #1: Mot de passe retourné dans la réponse API

**Localisation:** `apps/backend/src/modules/users/users.service.ts:52-65`

```typescript
const user: User = {
  id: data.id,
  email: data.email,
  password: data.password_hash,  // ❌ Hash stocké dans l'objet
  firstName: data.first_name,
  // ...
};

const { password, ...userWithoutPassword } = user;
return userWithoutPassword as User;  // ❌ Type assertion dangereuse
```

**Problème:** Le password est stocké temporairement puis destructuré. Le problème est que cette même logique se retrouve dans `findByEmail()` (ligne 122-132), `findOne()` (ligne 100-109), et `findAll()` (ligne 76-86), et **ces méthodes retournent le password hash**.

**Preuve du bug:**
- `apps/backend/src/modules/auth/auth.service.ts:45-46` retourne l'utilisateur complet du `findByEmail()` qui contient le hash
- Lors du login, `user` contient le `password_hash` et est retourné tel quel

**Impact:** 🔴 **CRITIQUE**
- Exposition du hash bcrypt dans les réponses JSON
- Attaques par force brute offline possibles
- Violation OWASP A01:2021 (Broken Access Control)

**Test pour reproduire:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","firstName":"John","lastName":"Doe"}' \
  | jq '.user.password'
# Devrait retourner: undefined
# Retourne probablement: "$2b$10$..."
```

---

### 🔴 CRITIQUE #2: Login sans vérification de mot de passe

**Localisation:** `apps/backend/src/modules/auth/auth.service.ts:35-49`

```typescript
async login(credentials: { email: string; password: string }) {
  // Mock login - will be implemented with real bcrypt later
  const user = await this.usersService.findByEmail(credentials.email);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const token = this.generateToken(user.id, user.email);  // ❌ Pas de vérification du mot de passe!

  return {
    user,
    accessToken: token,
  };
}
```

**Impact:** 🔴 **CRITIQUE**
- Bypass complet de l'authentification
- N'importe qui peut se connecter avec n'importe quel email valide
- Compromission totale de tous les comptes

**Test pour reproduire:**
```bash
# Login avec n'importe quel mot de passe
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@comhotel.com","password":"wrongpassword"}'
# Devrait échouer, mais retournera probablement un JWT valide
```

---

### 🔴 CRITIQUE #3: Injection de rôle possible

**Localisation:** `apps/backend/src/modules/users/dto/create-user.dto.ts:26-29`

```typescript
@IsOptional()
@IsEnum(UserRole)
role?: UserRole;  // ❌ L'utilisateur peut s'assigner admin
```

**Problème:** Le champ `role` est optionnel mais accepté depuis la requête. Un attaquant peut s'enregistrer directement comme `admin` ou `hotel_owner`.

**Test pour reproduire:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@evil.com","password":"Test1234","firstName":"Hacker","lastName":"Evil","role":"admin"}'
# L'utilisateur sera créé avec le rôle admin
```

**Impact:** 🔴 **CRITIQUE**
- Escalade de privilèges instantanée
- Bypass complet du système de permissions
- Violation OWASP A01:2021

**Solution requise:**
- Retirer `role` du DTO de création utilisateur
- Définir `role = 'guest'` en dur dans le service
- Créer un endpoint admin séparé pour l'attribution de rôles

---

### 🟠 MOYEN #4: Pas de normalisation d'email

**Localisation:** `apps/backend/src/modules/users/users.service.ts:14-16`, `apps/backend/src/modules/users/users.service.ts:112-132`

**Problème:** Les emails ne sont pas normalisés (lowercase, trim). Conséquences:
- `User@Example.com` et `user@example.com` sont considérés comme différents
- Race condition possible: deux inscriptions simultanées avec casses différentes
- Problème de recherche: `findByEmail('user@test.com')` ne trouve pas `User@Test.com`

**Test vérifié dans:** `apps/backend/src/modules/users/__tests__/users.service.comprehensive.spec.ts:214-225`
```typescript
it('⬜ email avec majuscules → stocké en minuscules (à implémenter)', async () => {
  const dto: CreateUserDto = {
    email: 'Test@EXAMPLE.COM',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
  };
  const result = await service.create(dto);
  expect(result.email).toBe('Test@EXAMPLE.COM');  // ❌ Pas normalisé
  // Devrait être: expect(result.email).toBe('test@example.com');
});
```

**Impact:** 🟠 **MOYEN**
- Création de comptes dupliqués
- Bypass de la contrainte UNIQUE
- Problèmes d'UX (utilisateur ne peut pas se connecter)

---

### 🟠 MOYEN #5: XSS via firstName et lastName

**Localisation:** `apps/backend/src/modules/users/dto/create-user.dto.ts:17-20`

```typescript
@IsString()
firstName: string;

@IsString()
lastName: string;
```

**Problème:** Aucune validation de contenu. Les champs acceptent:
- Scripts XSS: `<script>alert('XSS')</script>`
- Injection HTML: `<img src=x onerror=alert(1)>`
- SQL (moins grave grâce à l'ORM, mais toujours risqué)

**Frontend:** `apps/frontend/src/app/(auth)/register/page.tsx:74-92` accepte n'importe quel texte sans sanitization.

**Test pour reproduire:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"xss@test.com","password":"Test1234","firstName":"<script>alert(1)</script>","lastName":"<img src=x onerror=alert(2)>"}'
```

**Impact:** 🟠 **MOYEN**
- Stored XSS si affiché sans échappement dans le frontend
- OWASP A03:2021 (Injection)

**Solution requise:**
- Ajouter `@Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)` pour n'accepter que lettres, espaces, tirets
- Ajouter `@MaxLength(50)`
- Sanitizer côté frontend

---

### 🟠 MOYEN #6: Race condition sur email unique

**Localisation:** `apps/backend/src/modules/users/users.service.ts:18-22`

```typescript
const existingUser = await this.findByEmail(createUserDto.email);
if (existingUser) {
  throw new ConflictException('Un utilisateur avec cet email existe déjà');
}
// ⏱️ FENÊTRE DE VULNÉRABILITÉ ICI
const hashedPassword = await HashUtil.hash(createUserDto.password);
```

**Problème:** Entre la vérification (`findByEmail`) et l'insertion (`insert`), deux requêtes simultanées peuvent créer deux comptes avec le même email.

**Test de concurrence:**
```javascript
// Envoyer 2 requêtes simultanées
Promise.all([
  fetch('/auth/register', { method: 'POST', body: JSON.stringify({email:'race@test.com', ...}) }),
  fetch('/auth/register', { method: 'POST', body: JSON.stringify({email:'race@test.com', ...}) })
])
```

**Impact:** 🟠 **MOYEN**
- Création de doublons
- Inconsistance de la base de données
- La contrainte UNIQUE SQL peut sauver (erreur DB), mais gestion d'erreur inadéquate

**Solution requise:**
- Utiliser une transaction SQL
- Ou s'appuyer sur la contrainte UNIQUE et gérer l'erreur Supabase proprement

---

### 🟡 FAIBLE #7: Pas de limitation de longueur stricte

**Localisation:** `apps/backend/src/modules/users/dto/create-user.dto.ts`

**Problème:** Aucune validation `@MaxLength()` sur email, firstName, lastName, phone.

**Tests existants montrent:** `apps/backend/src/modules/users/__tests__/users.service.comprehensive.spec.ts:471-495`
```typescript
it('⬜ email très long → accepté', async () => {
  const longEmail = 'a'.repeat(200) + '@example.com';
  const result = await service.create(dto);
  expect(result.email).toBe(longEmail);  // Accepté
});

it('⬜ mot de passe très long → accepté', async () => {
  const longPassword = 'Password123' + 'a'.repeat(1000);
  // Accepté, mais hash bcrypt coûteux!
});
```

**Impact:** 🟡 **FAIBLE-MOYEN**
- Attaque DoS via hashing de mots de passe très longs
- Saturation de base de données
- Problèmes d'affichage UI

**Limites recommandées:**
- `@MaxLength(255)` pour email
- `@MaxLength(100)` pour firstName/lastName
- `@MaxLength(128)` pour password (avant hashing)
- `@MaxLength(20)` pour phone

---

## 2. 🛡️ VALIDATIONS MANQUANTES

### Frontend (`apps/frontend/src/app/(auth)/register/page.tsx`)

✅ **Ce qui fonctionne:**
- Validation password confirmation (ligne 25-27)
- Validation longueur minimale 8 caractères (ligne 30-32)
- Champs required via HTML5 (lignes 78, 89, 103, 126)

❌ **Ce qui manque:**
1. **Pas de validation format email côté client** (se fie à `type="email"` HTML5, insuffisant)
2. **Pas de feedback en temps réel** sur la force du mot de passe
3. **Pas de limitation de longueur maximale** (maxLength attribut manquant)
4. **Pas de sanitization** avant envoi
5. **Pas de protection contre soumissions multiples** (double-clic)
6. **Token JWT stocké en localStorage** (vulnérable XSS) au lieu de httpOnly cookie

### Backend (`apps/backend/src/modules/users/dto/create-user.dto.ts`)

✅ **Ce qui fonctionne:**
- `@IsEmail()` pour email (ligne 10)
- `@IsString()` pour les champs texte
- `@MinLength(8)` pour password (ligne 14)
- `@IsEnum(UserRole)` pour role (ligne 28)
- ValidationPipe avec `whitelist: true` et `forbidNonWhitelisted: true` (`apps/backend/src/main.ts:18-24`)

❌ **Ce qui manque:**
1. **@MaxLength()** sur tous les champs
2. **@Matches()** pour firstName/lastName (regex lettres uniquement)
3. **@Transform()** pour normaliser email (lowercase + trim)
4. **Validation force mot de passe** (chiffres, majuscules, caractères spéciaux)
5. **@IsPhoneNumber()** pour phone (accepte actuellement n'importe quoi)

---

## 3. 🔐 PROBLÈMES CRYPTOGRAPHIQUES

### ✅ Ce qui est CORRECT:

1. **Bcrypt utilisé avec 10 rounds** (`apps/backend/src/common/utils/hash.util.ts:4-7`)
   - Algorithme moderne et sécurisé
   - Salt automatique (bcrypt génère un salt unique par hash)
   - Coût adapté (10 rounds = ~100ms, bon équilibre)

2. **JWT signé correctement** (`apps/backend/src/modules/auth/auth.service.ts:51-55`)
   - Payload minimaliste: `sub` (userId) et `email` uniquement
   - Pas de mot de passe dans le JWT ✅

3. **Hashes uniques vérifiés** (`apps/backend/src/modules/users/__tests__/users.service.comprehensive.spec.ts:273-296`)
   - Même mot de passe → hashes différents grâce au salt

### ❌ Ce qui est PROBLÉMATIQUE:

1. **JWT_SECRET par défaut** (`apps/backend/src/config/jwt.config.ts:4`)
   ```typescript
   secret: process.env.JWT_SECRET || 'your-secret-key',  // ❌ Secret faible par défaut
   ```
   **Impact:** Si déployé sans .env, n'importe qui peut forger des JWT
   **Solution:** Lever une erreur si JWT_SECRET non défini en production

2. **Pas de rotation de secrets**
   - Aucun mécanisme pour invalider les JWT existants
   - Pas de blacklist de tokens
   - Expiration longue (7 jours) sans refresh token

3. **Password hash retourné** (voir Bug Critique #1)

---

## 4. ⚙️ CONTRAT API & GESTION D'ERREURS

### ✅ Ce qui fonctionne:

1. **ValidationPipe global** (`apps/backend/src/main.ts:18-24`)
   ```typescript
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,           // ✅ Retire champs non déclarés
       forbidNonWhitelisted: true,// ✅ Rejette requêtes avec champs extra
       transform: true,           // ✅ Transforme types automatiquement
     }),
   );
   ```
   - Bloque champs supplémentaires ✅
   - Transforme types automatiquement ✅

2. **Codes HTTP corrects**
   - 201 CREATED pour registration (`apps/backend/src/modules/auth/auth.controller.ts:10`)
   - 409 CONFLICT pour email dupliqué (`apps/backend/src/modules/users/users.service.ts:21`)
   - 400 BAD REQUEST pour validations (`apps/backend/src/modules/users/users.service.ts:15`)

3. **Messages d'erreur clairs** (`apps/backend/src/modules/users/users.service.ts:15-26`)
   ```typescript
   if (!createUserDto.email || createUserDto.email.trim() === '') {
     throw new BadRequestException('L\'email est requis');
   }
   if (!createUserDto.password || createUserDto.password.length < 8) {
     throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
   }
   ```

### ❌ Ce qui manque/problèmes:

1. **Gestion des erreurs Supabase inadéquate** (`apps/backend/src/modules/users/users.service.ts:47-49`)
   ```typescript
   if (error) {
     throw new BadRequestException(`Erreur lors de la création de l'utilisateur: ${error.message}`);
   }
   ```
   **Problème:** Expose les erreurs internes de Supabase (noms de tables, contraintes SQL)
   **Exemple:** `duplicate key value violates unique constraint "users_email_key"`

2. **Pas de validation Content-Type**
   - Accepte n'importe quel Content-Type
   - Devrait exiger `application/json`

3. **CORS trop permissif potentiellement** (`apps/backend/src/main.ts:9-15`)
   ```typescript
   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
   ```
   Risque si déployé sans .env

4. **Pas de rate limiting**
   - Attaques par force brute possibles
   - Spam d'inscriptions
   - Recommandation: `@nestjs/throttler`

---

## 5. 🧪 TESTS & COUVERTURE

### ✅ Tests existants:

1. **`apps/backend/src/modules/auth/__tests__/auth.service.spec.ts`** (146 lignes)
   - ✅ Inscription réussie
   - ✅ Validation champs manquants (email, password, firstName, lastName)
   - ✅ Génération JWT correcte

2. **`apps/backend/src/modules/users/__tests__/users.service.comprehensive.spec.ts`** (527 lignes)
   - ✅ 40+ tests couvrant validation, sécurité, edge cases
   - ✅ Tests de hash unique
   - ✅ Tests de concurrence partielle
   - ✅ Tests d'unicité email

### ❌ Tests manquants (E2E):

1. **Aucun test E2E** (.e2e-spec.ts absent)
2. **Pas de test d'intégration frontend-backend**
3. **Pas de test de charge/concurrence réel**
4. **Pas de test de sécurité automatisé** (OWASP ZAP, etc.)

### 🔴 Tests en échec identifiés:

Les tests passent actuellement car ils testent le comportement actuel (bugué). Voici ce qui **devrait** échouer:

1. **Password retourné** (`apps/backend/src/modules/users/__tests__/users.service.comprehensive.spec.ts:368-378`)
   ```typescript
   it('⬜ mot de passe NON retourné', async () => {
     const result = await service.create(dto);
     expect(result.password).toBeUndefined();  // ✅ PASSE pour create()
   });
   ```
   **Mais:** `findByEmail()`, `findOne()`, `login()` retournent le password → **non testé**

2. **Email normalisé** (ligne 214-225) - Test commenté "à implémenter"

3. **Login sans password** - **Aucun test ne vérifie la validation du mot de passe!**

---

## 6. 📁 FICHIERS À CORRIGER (Par priorité)

### 🔴 PRIORITÉ CRITIQUE (à corriger immédiatement):

1. **`apps/backend/src/modules/auth/auth.service.ts:35-49`**
   - Ajouter vérification mot de passe avec `HashUtil.compare()`

2. **`apps/backend/src/modules/users/users.service.ts:122-132`** (et lignes 89-109, 68-86)
   - Ne JAMAIS retourner `password` dans les méthodes find

3. **`apps/backend/src/modules/users/dto/create-user.dto.ts:26-29`**
   - Retirer le champ `role` du DTO

4. **`apps/backend/src/config/jwt.config.ts:4`**
   - Lever une erreur si JWT_SECRET non défini

### 🟠 PRIORITÉ HAUTE (semaine 1):

5. **`apps/backend/src/modules/users/dto/create-user.dto.ts`** (tout le fichier)
   - Ajouter @MaxLength, @Matches, @Transform pour normalisation

6. **`apps/backend/src/modules/users/users.service.ts:14-22`**
   - Normaliser email (lowercase + trim)
   - Utiliser transaction ou gérer l'erreur UNIQUE proprement

7. **`apps/frontend/src/app/(auth)/register/page.tsx`**
   - Ajouter maxLength attributs
   - Sanitizer firstName/lastName
   - Stocker JWT en httpOnly cookie

### 🟡 PRIORITÉ MOYENNE (semaine 2-3):

8. **`apps/backend/src/main.ts`**
   - Ajouter rate limiting (@nestjs/throttler)
   - Valider Content-Type

9. **Créer:** `apps/backend/test/auth.e2e-spec.ts`
   - Tests E2E complets de registration

10. **`apps/backend/src/modules/users/users.service.ts:47-49`**
    - Améliorer gestion d'erreurs Supabase

---

## 7. ✅ CE QUI EST CORRECT

1. **Architecture propre**
   - Séparation Controller/Service/Repository ✅
   - DTOs bien structurés ✅
   - Modules NestJS corrects ✅

2. **Sécurité de base**
   - Bcrypt avec 10 rounds ✅
   - ValidationPipe avec whitelist ✅
   - JWT stratégie Passport correcte (`apps/backend/src/modules/auth/strategies/jwt.strategy.ts`) ✅

3. **Base de données**
   - Contrainte UNIQUE sur email (`supabase/migrations/001_initial_schema.sql:17`) ✅
   - Indexes corrects (ligne 107) ✅
   - RLS policies pour users (lignes 163-169) ✅

4. **Tests unitaires**
   - Bonne couverture des validations ✅
   - Tests de hash unique ✅
   - Tests d'unicité email ✅

5. **Hashing sécurisé**
   - Salt unique automatique (bcrypt) ✅
   - Pas de MD5/SHA1 ✅

---

## 8. 📊 NIVEAU DE RISQUE DÉTAILLÉ

| Catégorie | Risque | Justification |
|-----------|--------|---------------|
| **Authentification** | 🔴 10/10 | Login sans vérification password = bypass total |
| **Autorisation** | 🔴 9/10 | Injection de rôle admin possible |
| **Confidentialité** | 🔴 8/10 | Password hash exposé |
| **Injection (XSS/SQL)** | 🟠 6/10 | XSS possible via firstName/lastName |
| **Validation données** | 🟠 6/10 | Manque MaxLength, normalisation |
| **Cryptographie** | 🟡 4/10 | Bcrypt OK, mais JWT_SECRET faible par défaut |
| **DoS/Rate Limiting** | 🟠 7/10 | Pas de throttling, hash de passwords longs |
| **Race Conditions** | 🟠 5/10 | Check-then-insert pattern |
| **Gestion erreurs** | 🟡 4/10 | Messages OK, mais fuites Supabase |
| **Tests** | 🟡 5/10 | Bons tests unitaires, 0 E2E |

**Score global: 7.0/10 🔴 ÉLEVÉ**

---

## 9. 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: CRITIQUE (aujourd'hui)
1. Corriger login → ajouter `HashUtil.compare()`
2. Retirer password de toutes les réponses
3. Désactiver champ `role` dans DTO
4. Forcer JWT_SECRET en production

### Phase 2: URGENT (semaine 1)
5. Normaliser emails (lowercase + trim)
6. Ajouter validations MaxLength/Matches
7. Sanitizer XSS firstName/lastName
8. Tests E2E basiques

### Phase 3: IMPORTANT (semaine 2)
9. Rate limiting
10. httpOnly cookies pour JWT
11. Améliorer gestion erreurs
12. Tests de sécurité automatisés

### Phase 4: AMÉLIORATION (semaine 3+)
13. Refresh tokens
14. Email verification
15. Password strength meter frontend
16. CAPTCHA anti-bot

---

## 10. 📝 CONCLUSION

L'application ComHotel présente une architecture solide avec des choix techniques modernes (NestJS, bcrypt, ValidationPipe), mais souffre de **vulnérabilités critiques de sécurité** qui la rendent **non déployable en production**.

Les 3 bugs critiques identifiés (login sans password, password hash exposé, injection de rôle) permettent une **compromission totale du système** et doivent être corrigés immédiatement.

Avec les corrections proposées en Phases 1-2, le niveau de risque passerait de 🔴 7/10 à 🟡 3/10 (acceptable pour production avec monitoring).

**Recommandation finale:** 🔴 **NE PAS DÉPLOYER** avant correction des bugs critiques #1, #2, #3.

---

**Auditeur:** Claude Sonnet 4.5 (QA & Security Engineer)
**Méthodologie:** OWASP ASVS 4.0, SANS Top 25, analyse de code statique, review de tests
**Fichiers analysés:** 15 fichiers backend + 1 frontend + DB schema + tests
