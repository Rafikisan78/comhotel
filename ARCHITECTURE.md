# Architecture Technique - ComHotel

> Documentation détaillée de l'architecture du projet ComHotel

## 📐 Vue d'Ensemble

ComHotel est construit sur une architecture monorepo moderne avec une séparation claire entre backend et frontend.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 15)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (Auth, Hotels, Profile, Admin)                │  │
│  │  ├── React 19 Components                             │  │
│  │  ├── Tailwind CSS Styling                            │  │
│  │  └── Axios API Client                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS 10)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (REST API Endpoints)                    │  │
│  │  ├── Guards (JWT, RBAC)                              │  │
│  │  ├── Services (Business Logic)                       │  │
│  │  ├── Entities (Data Models)                          │  │
│  │  └── DTOs (Validation)                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│               Database (PostgreSQL 15 via Supabase)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: users, hotels, rooms, bookings, payments    │  │
│  │  ├── Indexes for Performance                         │  │
│  │  ├── Row Level Security (RLS)                        │  │
│  │  ├── Triggers (updated_at)                           │  │
│  │  └── ENUMs (roles, types, statuses)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Backend (NestJS)

### Structure des Modules

```
apps/backend/src/
├── main.ts                    # Point d'entrée de l'application
├── app.module.ts              # Module racine
│
├── modules/                   # Modules métier
│   ├── auth/                  # ✅ Authentification
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── oauth2.strategy.ts
│   │   └── __tests__/
│   │
│   ├── users/                 # ✅ Gestion utilisateurs
│   │   ├── users.controller.ts (86 lignes, 9 endpoints)
│   │   ├── users.service.ts    (419 lignes)
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── __tests__/
│   │
│   ├── hotels/                # ✅ Gestion hôtels
│   │   ├── hotels.controller.ts (149 lignes, 10 endpoints)
│   │   ├── hotels.service.ts    (344 lignes)
│   │   ├── hotels.module.ts
│   │   ├── dto/
│   │   │   ├── create-hotel.dto.ts (192 lignes)
│   │   │   └── update-hotel.dto.ts
│   │   ├── entities/
│   │   │   └── hotel.entity.ts (106 lignes)
│   │   └── __tests__/
│   │
│   ├── rooms/                 # ✅ Gestion chambres
│   │   ├── rooms.controller.ts
│   │   ├── rooms.service.ts (204 lignes)
│   │   ├── rooms.module.ts
│   │   ├── dto/
│   │   │   ├── create-room.dto.ts (112 lignes, ENUMs)
│   │   │   └── update-room.dto.ts
│   │   ├── entities/
│   │   │   └── room.entity.ts
│   │   └── __tests__/
│   │
│   ├── bookings/              # ⚠️ Mock
│   ├── payments/              # ⚠️ Mock
│   ├── reviews/               # 🔲 Placeholder
│   ├── notifications/         # 🔲 Placeholder
│   ├── search/                # ⚠️ Basic
│   └── admin/                 # 🔲 Placeholder
│
└── common/                    # Utilitaires partagés
    ├── guards/                # Gardes de sécurité
    │   ├── jwt-auth.guard.ts
    │   ├── admin.guard.ts
    │   ├── roles.guard.ts
    │   └── self-or-admin.guard.ts
    │
    ├── decorators/            # Décorateurs personnalisés
    │   ├── current-user.decorator.ts
    │   └── roles.decorator.ts
    │
    ├── filters/               # Filtres d'exceptions
    │   └── http-exception.filter.ts
    │
    ├── interceptors/          # Intercepteurs
    │   └── logging.interceptor.ts
    │
    ├── pipes/                 # Pipes de validation
    │   └── validation.pipe.ts
    │
    ├── utils/                 # Utilitaires
    │   ├── hash.util.ts       # bcrypt hashing
    │   └── date.util.ts       # Manipulation de dates
    │
    └── database/              # Configuration base de données
        ├── database.module.ts
        └── supabase.service.ts
```

### Pattern NestJS

#### 1. **Module Pattern**

Chaque fonctionnalité est encapsulée dans un module :

```typescript
@Module({
  imports: [
    // Autres modules nécessaires
    PassportModule,
    JwtModule.registerAsync({...}),
  ],
  controllers: [UsersController],
  providers: [UsersService, SupabaseService],
  exports: [UsersService], // Expose le service aux autres modules
})
export class UsersModule {}
```

#### 2. **Controller Pattern**

Les contrôleurs gèrent les requêtes HTTP :

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)  // Protection JWT
  findMe(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.usersService.findOne(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)  // Protection Admin
  findAll() {
    return this.usersService.findAll();
  }
}
```

#### 3. **Service Pattern**

Les services contiennent la logique métier :

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findOne(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException();
    return this.mapRowToUser(data);
  }
}
```

#### 4. **Guard Pattern**

Les guards contrôlent l'accès :

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.role === 'admin';
  }
}
```

#### 5. **DTO Pattern**

Les DTOs valident les données :

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])/)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
```

### Flow de Requête Backend

```
1. Client HTTP Request
   ↓
2. CORS Middleware (main.ts)
   ↓
3. Global Validation Pipe
   ↓
4. Controller (@Get, @Post, etc.)
   ↓
5. Guards (@UseGuards)
   ├── JwtAuthGuard → Vérifie JWT token
   └── AdminGuard → Vérifie rôle admin
   ↓
6. Interceptors (logging, transform)
   ↓
7. Service Method (business logic)
   ↓
8. Database (Supabase)
   ↓
9. Response Transformation
   ↓
10. HTTP Response to Client
```

### Gestion des Erreurs

```typescript
// Exception automatique
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Cannot delete admin');
throw new BadRequestException('Invalid email format');
throw new ConflictException('Email already exists');

// Filtre global d'exceptions
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 🖥️ Architecture Frontend (Next.js)

### Structure des Pages

```
apps/frontend/src/
├── app/
│   ├── layout.tsx                    # Layout racine
│   ├── page.tsx                      # Page d'accueil
│   │
│   ├── (auth)/                       # Groupe de routes auth
│   │   ├── layout.tsx                # Layout auth (sans navbar)
│   │   ├── login/
│   │   │   └── page.tsx              # Page de connexion
│   │   ├── register/
│   │   │   └── page.tsx              # Page d'inscription
│   │   ├── confirm/
│   │   │   └── page.tsx              # Confirmation email
│   │   └── forgot-password/
│   │       └── page.tsx              # Mot de passe oublié
│   │
│   └── (main)/                       # Groupe de routes principales
│       ├── layout.tsx                # Layout principal (avec navbar)
│       ├── hotels/
│       │   ├── page.tsx              # Liste des hôtels
│       │   └── [slug]/
│       │       └── page.tsx          # Détails d'un hôtel
│       ├── profile/
│       │   └── page.tsx              # Profil utilisateur
│       └── admin/
│           └── users/
│               ├── page.tsx          # Liste utilisateurs (admin)
│               └── [id]/
│                   └── edit/
│                       └── page.tsx  # Édition utilisateur
│
├── components/                       # Composants réutilisables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HotelCard.tsx
│   └── UserTable.tsx
│
└── lib/                              # Utilitaires
    ├── api-client.ts                 # Client Axios configuré
    ├── supabase.ts                   # Client Supabase
    └── utils.ts                      # Fonctions utilitaires
```

### Routing Next.js 15

Next.js 15 utilise le **App Router** avec les conventions suivantes :

**Route Groups** : `(auth)` et `(main)`
- Organisent les routes sans affecter l'URL
- Permettent des layouts différents

**Dynamic Routes** : `[slug]` et `[id]`
- `[slug]` : Route dynamique pour les hôtels
- `[id]` : Route dynamique pour l'édition utilisateur

**Exemple** :
```
URL: /hotels/paris-hotel-royal
Fichier: app/(main)/hotels/[slug]/page.tsx
Params: { slug: 'paris-hotel-royal' }
```

### Client API (Axios)

```typescript
// lib/api-client.ts
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur de requête : ajoute le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse : gère les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### State Management

**Approche actuelle** : React State + localStorage
```typescript
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadUserProfile()
}, [])

const loadUserProfile = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  const response = await apiClient.get('/users/me')
  setUser(response.data)
}
```

**Future** : Considérer Zustand ou React Context pour état global

### Pattern Page

```typescript
'use client'  // Client Component (Next.js 15)

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/users/me')
      setUser(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      {/* ... */}
    </div>
  )
}
```

## 💾 Architecture Base de Données

### Schéma Complet

```sql
-- ENUMs
CREATE TYPE user_role AS ENUM ('guest', 'hotel_owner', 'admin');
CREATE TYPE room_type AS ENUM ('single', 'double', 'twin', 'triple', 'quad',
                                'suite', 'deluxe', 'presidential', 'studio',
                                'family', 'accessible');
CREATE TYPE view_type AS ENUM ('city', 'sea', 'mountain', 'garden', 'pool',
                                'courtyard', 'street', 'interior');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- Table users (✅ Fully Implemented)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'guest',

  -- Email confirmation
  email_confirmed BOOLEAN DEFAULT FALSE,
  email_confirmation_token VARCHAR(255),
  email_confirmation_sent_at TIMESTAMP,

  -- Password reset
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP,

  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id),

  -- Login security
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table hotels (✅ Fully Implemented)
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  description_en TEXT,
  description_es TEXT,
  description_de TEXT,
  short_description VARCHAR(500),
  slug VARCHAR(255) UNIQUE,

  -- Location
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),

  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),

  -- Schedule
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '11:00',
  reception_24h BOOLEAN DEFAULT FALSE,
  reception_hours JSONB,
  arrival_instructions TEXT,

  -- Classification
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  chain_name VARCHAR(255),
  is_independent BOOLEAN DEFAULT TRUE,
  labels TEXT[],
  certifications TEXT[],

  -- Media
  images TEXT[],
  cover_image VARCHAR(500),
  video_url VARCHAR(500),
  virtual_tour_url VARCHAR(500),

  -- Features
  amenities TEXT[],

  -- SEO & Display
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Stats
  average_rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Platform
  commission_rate NUMERIC(5, 2) DEFAULT 15.00,
  owner_id UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table rooms (✅ Fully Implemented)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type room_type NOT NULL,
  floor INTEGER,

  -- Capacity
  capacity_adults INTEGER CHECK (capacity_adults >= 1 AND capacity_adults <= 10),
  capacity_children INTEGER CHECK (capacity_children >= 0 AND capacity_children <= 10),
  capacity_infants INTEGER CHECK (capacity_infants >= 0 AND capacity_infants <= 5),

  -- Pricing & Size
  base_price NUMERIC(10, 2) NOT NULL,
  size_sqm NUMERIC(6, 2),

  -- Features
  view_type view_type,
  description TEXT,
  is_accessible BOOLEAN DEFAULT FALSE,
  is_smoking_allowed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(hotel_id, room_number)
);

-- Table bookings (⚠️ Schema Defined)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table payments (⚠️ Schema Defined)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table reviews (⚠️ Schema Defined)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  user_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes pour Performance

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Hotels
CREATE INDEX idx_hotels_slug ON hotels(slug);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_country ON hotels(country);
CREATE INDEX idx_hotels_is_active ON hotels(is_active);
CREATE INDEX idx_hotels_owner_id ON hotels(owner_id);
CREATE INDEX idx_hotels_stars ON hotels(stars);

-- Rooms
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_room_type ON rooms(room_type);
CREATE INDEX idx_rooms_view_type ON rooms(view_type);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_rooms_base_price ON rooms(base_price);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Triggers

```sql
-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Etc. pour toutes les tables
```

### Row Level Security (RLS)

```sql
-- Activer RLS sur les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Politiques pour hotels
CREATE POLICY "Hotels are viewable by everyone"
  ON hotels FOR SELECT
  USING (is_active = TRUE OR
         owner_id = auth.uid() OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only owners and admins can insert hotels"
  ON hotels FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('hotel_owner', 'admin'))
  );

CREATE POLICY "Only owners and admins can update hotels"
  ON hotels FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

## 🔐 Architecture de Sécurité

### Layers de Sécurité

```
Layer 1: Network Security
   └── CORS Configuration
   └── HTTPS (production)

Layer 2: Authentication
   └── JWT Token Validation
   └── Password Hashing (bcrypt)
   └── OWASP 2024 Password Policy

Layer 3: Authorization
   └── Role-Based Access Control (RBAC)
   └── Guards (JwtAuthGuard, AdminGuard, RolesGuard)
   └── Ownership Verification

Layer 4: Data Validation
   └── DTOs with class-validator
   └── Whitelist Mode (strip extra properties)
   └── Type Transformation

Layer 5: Database Security
   └── Row Level Security (RLS)
   └── Prepared Statements (SQL Injection Protection)
   └── Soft Delete (Audit Trail)

Layer 6: Application Security
   └── Rate Limiting (à implémenter)
   └── CSRF Protection
   └── XSS Prevention (React auto-escaping)
```

### Flow d'Authentification

```
1. User Registration
   ├── Validate DTO (OWASP password policy)
   ├── Hash password with bcrypt
   ├── Generate email confirmation token
   ├── Store in database (role forced to 'guest')
   └── Return user + JWT token

2. User Login
   ├── Find user by email
   ├── Verify account is active
   ├── Compare password with bcrypt
   ├── Generate JWT token with payload {sub, email, role}
   ├── Update last_login_at
   └── Return user + JWT token

3. Protected Request
   ├── Extract token from Authorization header
   ├── Verify JWT signature with secret
   ├── Check token expiration
   ├── Decode payload → user info
   ├── Check Guards (Admin, Roles, etc.)
   └── Execute controller method
```

### JWT Payload Structure

```typescript
{
  sub: "uuid-of-user",           // Subject (user ID)
  email: "user@example.com",     // User email
  role: "guest" | "hotel_owner" | "admin",
  iat: 1704067200,               // Issued at (timestamp)
  exp: 1704672000                // Expiration (timestamp)
}
```

## 📊 Diagrammes d'Architecture

### Diagramme de Déploiement (Production)

```
┌─────────────────────────────────────────────────────────┐
│                     CDN (Vercel/Cloudflare)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Static Assets (Images, CSS, JS)                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Frontend (Vercel/Netlify)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Next.js SSR + SSG                                │  │
│  │  Edge Functions (Middleware)                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                  Backend (Railway/Render)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  NestJS API (Node.js containers)                  │  │
│  │  ├── Auto-scaling                                 │  │
│  │  ├── Health checks                                │  │
│  │  └── Environment variables                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ SSL
┌─────────────────────────────────────────────────────────┐
│                Database (Supabase)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15                                    │  │
│  │  ├── Connection pooling                           │  │
│  │  ├── Automatic backups                            │  │
│  │  ├── Point-in-time recovery                       │  │
│  │  └── Read replicas (optional)                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Diagramme de Séquence : Création de Réservation

```
User         Frontend      Backend       Database      Stripe
 │              │             │             │            │
 │─Select Room─→│             │             │            │
 │              │             │             │            │
 │              │─Check Auth─→│             │            │
 │              │←─JWT Valid──│             │            │
 │              │             │             │            │
 │─Book Room───→│             │             │            │
 │              │─POST /bookings───────────→│            │
 │              │             │─Check Availability──────→│
 │              │             │←─Room Available──────────│
 │              │             │             │            │
 │              │             │─Calculate Price─────────→│
 │              │             │←─Price Calculated────────│
 │              │             │             │            │
 │              │             │─Create Booking──────────→│
 │              │             │←─Booking Created─────────│
 │              │             │             │            │
 │              │←─Booking Details──────────│            │
 │              │             │             │            │
 │              │─Init Payment→│             │            │
 │              │             │─Create Payment Intent───→│
 │              │             │←─Client Secret───────────│
 │              │←─Client Secret────────────│            │
 │              │             │             │            │
 │─Pay────────→│             │             │            │
 │              │─Confirm────────────────────────────────→│
 │              │←─Success───────────────────────────────│
 │              │             │             │            │
 │              │─Update Booking────────────→│            │
 │              │             │─Confirm Booking─────────→│
 │              │             │←─Updated─────────────────│
 │              │             │             │            │
 │              │─Send Confirmation Email───→│            │
 │              │             │             │            │
 │←Confirmation─│             │             │            │
```

## 🔄 Patterns et Best Practices

### Dependency Injection

NestJS utilise l'injection de dépendances :

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService, // Injecté automatiquement
  ) {}
}
```

### Error Handling

```typescript
// Dans un service
if (!user) {
  throw new NotFoundException(`User with ID ${id} not found`);
}

// Dans un controller (automatiquement transformé en HTTP error)
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.usersService.findOne(id); // Peut throw NotFoundException
}
// → HTTP 404 avec message JSON
```

### Validation

```typescript
// DTO avec validation
export class CreateHotelDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsOptional()
  @IsUrl()
  website?: string;
}

// Auto-validé par le ValidationPipe global
@Post()
create(@Body() createHotelDto: CreateHotelDto) {
  // createHotelDto est déjà validé ici
  return this.hotelsService.create(createHotelDto);
}
```

### Transformation

```typescript
// Exclure le mot de passe des réponses
private excludePassword(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Utiliser dans les services
async findOne(id: string) {
  const user = await this.findUserById(id);
  return this.excludePassword(user);
}
```

## 🚀 Scalabilité

### Optimisations Actuelles

1. **Database Indexing**
   - Index sur colonnes fréquemment filtrées
   - Index composites pour queries complexes

2. **Query Optimization**
   - SELECT spécifique (pas SELECT *)
   - Utilisation de `.single()` pour résultats uniques
   - Pagination pour grandes listes

3. **Caching Strategy** (à implémenter)
   - Redis pour cache de sessions
   - Cache de résultats de recherche
   - Cache d'images via CDN

### Recommandations pour Scale

1. **Horizontal Scaling**
   - Déployer plusieurs instances NestJS derrière load balancer
   - Utiliser Redis pour sessions partagées
   - Database read replicas pour scaling lecture

2. **Performance Monitoring**
   - APM (Application Performance Monitoring)
   - Database query analytics
   - Error tracking (Sentry)

3. **Rate Limiting**
```typescript
// À implémenter
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requêtes par minute
@Post('/auth/login')
async login() { ... }
```

---

**Version** : 1.8.0
**Dernière mise à jour** : 11 janvier 2026
