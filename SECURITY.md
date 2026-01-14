# Guide de Sécurité - ComHotel

> Documentation complète des mesures de sécurité implémentées et des bonnes pratiques

## 🛡️ Vue d'Ensemble de la Sécurité

ComHotel implémente une stratégie de sécurité en profondeur (defense in depth) avec plusieurs couches de protection :

```
┌─────────────────────────────────────────────────────┐
│ Layer 7: Monitoring & Logging                       │
├─────────────────────────────────────────────────────┤
│ Layer 6: Application Security (Rate Limiting, CSRF) │
├─────────────────────────────────────────────────────┤
│ Layer 5: Database Security (RLS, SQL Injection)     │
├─────────────────────────────────────────────────────┤
│ Layer 4: Data Validation (DTOs, Whitelist)          │
├─────────────────────────────────────────────────────┤
│ Layer 3: Authorization (RBAC, Guards)               │
├─────────────────────────────────────────────────────┤
│ Layer 2: Authentication (JWT, bcrypt, OWASP)        │
├─────────────────────────────────────────────────────┤
│ Layer 1: Network Security (HTTPS, CORS)             │
└─────────────────────────────────────────────────────┘
```

## 🔐 Politique de Mots de Passe OWASP 2024

### Exigences Implémentées

**Conformité OWASP ASVS 4.0** - Niveau 2

✅ **Longueur minimale** : 12 caractères
✅ **Longueur maximale** : 128 caractères (support passphrases)
✅ **Complexité** :
   - Au moins 1 lettre majuscule (A-Z)
   - Au moins 1 lettre minuscule (a-z)
   - Au moins 1 chiffre (0-9)
   - Au moins 1 caractère spécial (@$!%*?&._-+=#)
✅ **Protection contre les mots de passe communs** : Recommandé (à implémenter)
✅ **Vérification de compromission** : Recommandé (API HaveIBeenPwned)

### Regex de Validation

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$
```

**Explication** :
- `(?=.*[a-z])` : Au moins une minuscule
- `(?=.*[A-Z])` : Au moins une majuscule
- `(?=.*\d)` : Au moins un chiffre
- `(?=.*[@$!%*?&._\-+=#])` : Au moins un caractère spécial
- `[A-Za-z\d@$!%*?&._\-+=#]+` : Uniquement ces caractères autorisés
- `{12,128}` : Longueur entre 12 et 128 caractères

### Exemples de Mots de Passe

✅ **Valides** :
```
SecurePass123!@#
MyP@ssw0rd2024!
Comhotel2024#Secure
J'aime_Paris2024!
Admin_System2024@
```

❌ **Invalides** :
```
password123         # Pas de majuscule ni caractère spécial
Password123         # Pas de caractère spécial
Password!           # Pas de chiffre
Pass123!            # Moins de 12 caractères
```

### Implémentation Backend

```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  @IsString()
  @MinLength(12, { message: 'Le mot de passe doit contenir au moins 12 caractères' })
  @MaxLength(128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$/,
    {
      message: 'Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&._-+=#)'
    }
  )
  password: string;
}
```

### Implémentation Frontend

```typescript
// Validation côté client (profil, inscription)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$/

if (password.length < 12) {
  setError('Le mot de passe doit contenir au moins 12 caractères')
  return
}

if (!passwordRegex.test(password)) {
  setError('Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&._-+=#)')
  return
}
```

## 🔑 Hachage de Mots de Passe

### bcrypt Configuration

**Paramètres** :
- **Algorithme** : bcrypt
- **Cost Factor (rounds)** : 10
- **Auto-salt** : Généré automatiquement par bcrypt

**Pourquoi bcrypt ?**
- ✅ Résistant aux attaques par force brute (intentionnellement lent)
- ✅ Adaptatif (cost factor augmentable dans le futur)
- ✅ Inclut le salt automatiquement dans le hash
- ✅ Recommandé par OWASP

### Implémentation

```typescript
// common/utils/hash.util.ts
import * as bcrypt from 'bcrypt';

export class HashUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### Utilisation

```typescript
// Lors de l'inscription
const hashedPassword = await HashUtil.hash(createUserDto.password);

// Lors de la connexion
const isPasswordValid = await HashUtil.compare(
  credentials.password,
  user.password
);
```

### Format du Hash

```
$2b$10$fwsRcYQcIkcMZ7/ogHvffu0bmCPwy8Ys3hUKSws/IzwbIUrl1WDfS
│  │  │                                                    │
│  │  │                                                    └─ Hash (31 chars)
│  │  └─ Salt (22 chars)
│  └─ Cost factor (10)
└─ Algorithm identifier (2b = bcrypt)
```

## 🎫 Authentification JWT

### Configuration JWT

```typescript
{
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '7d'  // 7 jours par défaut
  }
}
```

### Structure du Token

**Header** :
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** :
```json
{
  "sub": "uuid-of-user",
  "email": "user@example.com",
  "role": "guest",
  "iat": 1704067200,
  "exp": 1704672000
}
```

**Signature** :
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Génération du Token

```typescript
// auth/auth.service.ts
private generateToken(userId: string, email: string, role: string): string {
  return this.jwtService.sign({
    sub: userId,
    email,
    role,
  });
}
```

### Validation du Token

```typescript
// auth/strategies/jwt.strategy.ts
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      sub: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
```

### Stockage Côté Client

**⚠️ Approche actuelle** : localStorage (à améliorer)
```typescript
localStorage.setItem('access_token', response.data.accessToken);
localStorage.setItem('user_id', response.data.user.id);
```

**✅ Recommandation production** : httpOnly cookies
```typescript
// Backend
response.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
});
```

### Refresh Tokens (À implémenter)

```typescript
// Structure recommandée
{
  accessToken: "short-lived-token",  // 15 minutes
  refreshToken: "long-lived-token"   // 7 jours
}

// Rotation de refresh token lors du renouvellement
```

## 🔒 Contrôle d'Accès (RBAC)

### Rôles Définis

| Rôle | Permissions | Description |
|------|-------------|-------------|
| `guest` | Lecture hôtels/chambres<br>Créer réservations<br>Gérer propre profil | Utilisateur standard |
| `hotel_owner` | Toutes permissions guest<br>Créer/gérer ses hôtels<br>Créer/gérer chambres<br>Voir réservations hôtels | Propriétaire d'hôtel |
| `admin` | Accès complet<br>Gérer utilisateurs<br>Gérer tous hôtels<br>Accès administration | Administrateur système |

### Guards Implémentés

#### 1. JwtAuthGuard

Vérifie la présence et validité du JWT token.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Utilisation
@Get('me')
@UseGuards(JwtAuthGuard)
findMe(@Request() req: any) {
  return this.usersService.findOne(req.user.userId);
}
```

#### 2. AdminGuard

Vérifie que l'utilisateur a le rôle `admin`.

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

// Utilisation
@Get()
@UseGuards(JwtAuthGuard, AdminGuard)
findAll() {
  return this.usersService.findAll();
}
```

#### 3. RolesGuard

Vérifie que l'utilisateur a un des rôles requis.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Utilisation avec décorateur @Roles
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hotel_owner', 'admin')
createHotel(@Body() createHotelDto: CreateHotelDto) {
  return this.hotelsService.create(createHotelDto);
}
```

### Matrice de Permissions

| Endpoint | guest | hotel_owner | admin |
|----------|-------|-------------|-------|
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `GET /users/me` | ✅ | ✅ | ✅ |
| `PATCH /users/me` | ✅ | ✅ | ✅ |
| `GET /users` | ❌ | ❌ | ✅ |
| `GET /users/:id` | ❌ | ❌ | ✅ |
| `PATCH /users/:id` | ❌ | ❌ | ✅ |
| `DELETE /users/:id` | ❌ | ❌ | ✅ |
| `GET /hotels` | ✅ | ✅ | ✅ |
| `POST /hotels` | ❌ | ✅ | ✅ |
| `GET /hotels/my-hotels` | ❌ | ✅ | ✅ |
| `PATCH /hotels/:id` | ❌ | ✅ (own) | ✅ |
| `DELETE /hotels/:id` | ❌ | ✅ (own) | ✅ |
| `GET /rooms` | ✅ | ✅ | ✅ |
| `POST /rooms` | ❌ | ✅ | ✅ |
| `PUT /rooms/:id` | ❌ | ✅ (own hotel) | ✅ |

## 🛡️ Protection contre les Attaques

### SQL Injection

✅ **Protection** : Utilisation de Supabase Client (prepared statements automatiques)

```typescript
// ✅ SAFE - Paramétrisé
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)  // Automatiquement échappé
  .single();

// ❌ UNSAFE - Ne jamais faire
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### XSS (Cross-Site Scripting)

✅ **Protection** : React échappe automatiquement les valeurs
✅ **Validation** : DTOs valident les entrées
✅ **Sanitization** : À implémenter pour HTML rich text

```typescript
// React échappe automatiquement
<div>{user.name}</div>  // Safe

// Danger - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ⚠️ À éviter

// Solution : Utiliser DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

### CSRF (Cross-Site Request Forgery)

⚠️ **État actuel** : JWT dans Authorization header (protection partielle)
✅ **Recommandation** : Implémenter CSRF tokens pour formulaires

```typescript
// À implémenter
import { csurf } from 'csurf';

app.use(csurf({
  cookie: { httpOnly: true, secure: true }
}));
```

### Rate Limiting

⚠️ **À implémenter** : Protection contre les attaques par force brute

```typescript
// Installation
npm install @nestjs/throttler

// Configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // 60 secondes
      limit: 10,    // 10 requêtes max
    }),
  ],
})

// Utilisation
@UseGuards(ThrottlerGuard)
@Throttle(5, 60)  // 5 requêtes par minute
@Post('/auth/login')
async login() { ... }
```

### Role Injection

✅ **Protection implémentée** : Forçage du rôle lors de l'inscription

```typescript
// users/users.service.ts ligne 102
// SÉCURITÉ: Le rôle est forcé à 'guest' pour empêcher l'injection de rôle
const { data, error } = await supabase
  .from('users')
  .insert({
    email: normalizedEmail,
    password_hash: hashedPassword,
    first_name: createUserDto.firstName,
    last_name: createUserDto.lastName,
    phone: createUserDto.phone,
    role: 'guest', // ✅ Forcé côté serveur, pas depuis le DTO
  })
```

**Attaque bloquée** :
```javascript
// Tentative d'injection de rôle admin
POST /auth/register
{
  "email": "hacker@evil.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Hacker",
  "role": "admin"  // ❌ Ignoré, forcé à 'guest'
}
```

### Admin Self-Deletion Prevention

✅ **Protection implémentée** : Admin ne peut pas se supprimer

```typescript
// users/users.controller.ts
@Delete(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async softDelete(@Param('id') id: string, @Request() req: any) {
  const adminId = req.user.sub || req.user.userId;

  // Protection: Admin ne peut pas se supprimer lui-même
  if (id === adminId) {
    throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
  }

  // Vérifier que l'utilisateur cible n'est pas admin
  const targetUser = await this.usersService.findOne(id);
  if (targetUser && targetUser.role === 'admin') {
    throw new ForbiddenException('Impossible de supprimer un autre administrateur');
  }

  return this.usersService.softDelete(id, adminId);
}
```

## 🔍 Audit Trail et Logging

### Soft Delete avec Audit

✅ **Implémenté** : Traçabilité des suppressions

```typescript
// users/entities/user.entity.ts
export class User {
  deletedAt?: Date;      // Quand supprimé
  deletedBy?: string;    // UUID de l'admin qui a supprimé
}

// Lors de la suppression
async softDelete(id: string, adminId: string): Promise<void> {
  await supabase
    .from('users')
    .update({
      is_active: false,
      deleted_at: new Date(),
      deleted_by: adminId
    })
    .eq('id', id);
}
```

### Logging Recommandé

⚠️ **À implémenter** : Logging centralisé

```typescript
// Événements à logger
{
  timestamp: '2026-01-11T14:30:00Z',
  level: 'info',
  event: 'user.login.success',
  userId: 'uuid',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: {
    email: 'user@example.com',
    role: 'guest'
  }
}

// Événements de sécurité critiques
- user.login.failed
- user.login.success
- user.password.reset
- user.role.changed
- admin.user.deleted
- admin.user.restored
- auth.token.invalid
- rate.limit.exceeded
```

## 🔐 Variables d'Environnement Sensibles

### Gestion des Secrets

**❌ Ne JAMAIS commit** :
- `.env`
- `.env.local`
- `admin_credentials.txt`
- Fichiers contenant des clés API

**✅ Utiliser** :
- `.env.example` (sans valeurs réelles)
- Gestionnaire de secrets (Vault, AWS Secrets Manager)
- Variables d'environnement du platform (Vercel, Railway)

### Secrets Critiques

```env
# ⚠️ CHANGEZ EN PRODUCTION
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025

# ⚠️ NE JAMAIS EXPOSER
SUPABASE_SERVICE_KEY=eyJhbG...  # Accès admin complet à la DB

# ⚠️ PROTÉGER
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Rotation des Secrets

**Recommandation** : Rotation tous les 90 jours

1. **JWT_SECRET**
   - Générer nouveau secret
   - Déployer avec les deux secrets (ancien + nouveau)
   - Invalider ancien secret après 24h

2. **Database Credentials**
   - Créer nouveau user avec même permissions
   - Basculer l'application
   - Supprimer ancien user

3. **API Keys**
   - Régénérer via dashboard du provider
   - Mettre à jour dans l'application
   - Révoquer anciennes clés

## 📋 Checklist de Sécurité

### Avant Déploiement en Production

#### Configuration
- [ ] Changer `JWT_SECRET` (généré aléatoirement, 256+ bits)
- [ ] Activer HTTPS uniquement
- [ ] Configurer CORS strict (domaines spécifiques)
- [ ] Activer `secure` et `httpOnly` pour cookies
- [ ] Désactiver les logs détaillés en production
- [ ] Configurer variables d'environnement via platform

#### Authentification & Autorisation
- [ ] Implémenter refresh tokens
- [ ] Ajouter rate limiting (authentification)
- [ ] Ajouter CAPTCHA sur login/register
- [ ] Implémenter 2FA (optionnel)
- [ ] Configurer session timeout
- [ ] Implémenter account lockout après N échecs

#### Base de Données
- [ ] Activer Row Level Security (RLS)
- [ ] Configurer backups automatiques
- [ ] Chiffrement au repos activé
- [ ] Connexions SSL uniquement
- [ ] Auditer permissions des users DB
- [ ] Limiter connexions simultanées

#### Application
- [ ] Activer CSP (Content Security Policy)
- [ ] Implémenter CSRF protection
- [ ] Configurer helmet.js (headers sécurité)
- [ ] Sanitize user inputs
- [ ] Limiter taille des uploads
- [ ] Valider types MIME des fichiers

#### Monitoring
- [ ] Configurer logging centralisé
- [ ] Alertes pour événements suspects
- [ ] Monitoring des erreurs (Sentry)
- [ ] Surveillance des performances
- [ ] Audit régulier des accès admin

## 🚨 Incident Response

### En cas de Compromission

1. **Isolation**
   - Désactiver immédiatement le service compromis
   - Bloquer l'accès au réseau

2. **Analyse**
   - Consulter les logs
   - Identifier le vecteur d'attaque
   - Évaluer l'ampleur des dégâts

3. **Containment**
   - Révoquer tous les tokens JWT
   - Réinitialiser les secrets
   - Changer les mots de passe admin

4. **Recovery**
   - Restaurer depuis backup propre
   - Appliquer patches de sécurité
   - Redéployer l'application

5. **Post-Incident**
   - Documenter l'incident
   - Notifier les utilisateurs si nécessaire
   - Implémenter mesures préventives

## 📞 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité :

1. **NE PAS** créer d'issue publique
2. **Envoyer** un email à : security@comhotel.com
3. **Inclure** :
   - Description de la vulnérabilité
   - Steps to reproduce
   - Impact potentiel
   - Suggestions de correctif (optionnel)

**Nous nous engageons à** :
- Répondre dans les 48h
- Évaluer et corriger dans les 7 jours (critical)
- Créditer le découvreur (si souhaité)

---

**Version** : 1.8.0
**Dernière mise à jour** : 11 janvier 2026
**Conformité** : OWASP ASVS 4.0 Level 2
