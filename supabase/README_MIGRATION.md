# 🔧 Guide de Mise à Jour des Tables Supabase

**Date:** 2026-01-10
**Objectif:** S'assurer que les tables `users`, `hotels`, `rooms` supportent toutes les fonctionnalités actuelles

---

## 📋 Changements Nécessaires

### **Table: USERS**

Nouvelles colonnes ajoutées:
- ✅ `email_confirmed` (BOOLEAN) - Email vérifié
- ✅ `email_confirmation_token` (VARCHAR) - Token de confirmation
- ✅ `email_confirmation_sent_at` (TIMESTAMP) - Date d'envoi
- ✅ `password_reset_token` (VARCHAR) - Token de reset
- ✅ `password_reset_expires_at` (TIMESTAMP) - Expiration token
- ✅ `is_active` (BOOLEAN) - Compte actif (soft delete)
- ✅ `deleted_at` (TIMESTAMP) - Date de suppression
- ✅ `deleted_by` (UUID) - Qui a supprimé
- ✅ `last_login_at` (TIMESTAMP) - Dernière connexion
- ✅ `failed_login_attempts` (INTEGER) - Tentatives échouées
- ✅ `account_locked_until` (TIMESTAMP) - Compte verrouillé

### **Table: HOTELS**

Nouvelles colonnes ajoutées:
- ✅ `phone` (VARCHAR) - Téléphone hôtel
- ✅ `email` (VARCHAR) - Email hôtel
- ✅ `website` (VARCHAR) - Site web
- ✅ `stars` (INTEGER) - Classification 1-5 étoiles
- ✅ `check_in_time` (TIME) - Heure check-in par défaut
- ✅ `check_out_time` (TIME) - Heure check-out par défaut
- ✅ `is_active` (BOOLEAN) - Hôtel actif
- ✅ `slug` (VARCHAR) - URL-friendly identifier
- ✅ `short_description` (VARCHAR) - Description courte
- ✅ `cover_image` (VARCHAR) - Image de couverture

### **Table: ROOMS**

**ENUM `room_type` étendu:**
```sql
'single', 'double', 'twin', 'triple', 'quad', 'suite',
'deluxe', 'presidential', 'studio', 'family', 'accessible'
```

**Nouveau ENUM `view_type`:**
```sql
'city', 'sea', 'mountain', 'garden', 'pool',
'courtyard', 'street', 'interior'
```

**Colonnes renommées:**
- `number` → `room_number`
- `type` → `room_type`
- `price_per_night` → `base_price`
- `capacity` → `capacity_adults`
- `is_available` → `is_active`

**Nouvelles colonnes:**
- ✅ `floor` (INTEGER) - Étage
- ✅ `capacity_children` (INTEGER) - Enfants max (0-10)
- ✅ `capacity_infants` (INTEGER) - Bébés max (0-5)
- ✅ `size_sqm` (NUMERIC) - Surface en m²
- ✅ `view_type` (ENUM) - Type de vue
- ✅ `is_accessible` (BOOLEAN) - PMR accessible
- ✅ `is_smoking_allowed` (BOOLEAN) - Fumeur autorisé

---

## 🚀 Comment Appliquer les Migrations

### **Méthode 1: Interface Supabase (Recommandée)**

1. **Ouvrez le Dashboard Supabase:**
   ```
   https://supabase.com/dashboard/project/qbmmmkceevwbifvwnlfx/editor
   ```

2. **Cliquez sur "SQL Editor"**

3. **Exécutez le script de vérification:**
   - Copiez le contenu de `supabase/verify_current_schema.sql`
   - Collez dans l'éditeur
   - Cliquez "Run"
   - ✅ Cela vous montrera l'état actuel des tables

4. **Exécutez le script de migration:**
   - Copiez le contenu de `supabase/migrations/20260110_verify_and_update_tables.sql`
   - Collez dans l'éditeur
   - Cliquez "Run"
   - ✅ Attendez le message "Vérification réussie"

### **Méthode 2: Via CLI Supabase (Avancée)**

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier au projet
supabase link --project-ref qbmmmkceevwbifvwnlfx

# Appliquer la migration
supabase db push --include-all
```

---

## ✅ Vérification Post-Migration

Après avoir exécuté la migration, vérifiez que:

1. **Table USERS contient:**
   - ✅ `email_confirmed`
   - ✅ `is_active`
   - ✅ `deleted_at`

2. **Table HOTELS contient:**
   - ✅ `stars` (pas `star_rating`)
   - ✅ `is_active`
   - ✅ `slug`

3. **Table ROOMS contient:**
   - ✅ `room_number` (pas `number`)
   - ✅ `room_type` (pas `type`)
   - ✅ `base_price` (pas `price_per_night`)
   - ✅ `capacity_adults`, `capacity_children`, `capacity_infants`
   - ✅ `view_type`
   - ✅ `is_active`

---

## 🔍 Tester les Changements

Une fois la migration terminée, testez:

### **Test 1: Création User**
```http
POST http://localhost:3000/auth/register
{
  "email": "test@example.com",
  "password": "Test@2024Secure!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678"
}
```

✅ Devrait créer un utilisateur avec `email_confirmed=false`

### **Test 2: Création Room**
```http
POST http://localhost:3000/rooms
Authorization: Bearer [TOKEN]
{
  "hotel_id": "[HOTEL_UUID]",
  "room_number": "101",
  "room_type": "double",
  "floor": 1,
  "capacity_adults": 2,
  "capacity_children": 1,
  "capacity_infants": 0,
  "base_price": 150.00,
  "size_sqm": 25,
  "view_type": "sea",
  "is_accessible": false,
  "is_smoking_allowed": false
}
```

✅ Devrait créer une chambre avec toutes les nouvelles colonnes

### **Test 3: Liste Users (Soft Delete)**
```http
GET http://localhost:3000/users
```

✅ Ne devrait retourner que les users avec `is_active=true` et `deleted_at IS NULL`

---

## 📊 Structure Attendue

### **USERS (Colonnes Principales)**
```
id                          UUID PRIMARY KEY
email                       VARCHAR(255) UNIQUE NOT NULL
password_hash               VARCHAR(255) NOT NULL
first_name                  VARCHAR(100) NOT NULL
last_name                   VARCHAR(100) NOT NULL
phone                       VARCHAR(20)
role                        user_role DEFAULT 'guest'
email_confirmed             BOOLEAN DEFAULT false
email_confirmation_token    VARCHAR(255)
is_active                   BOOLEAN DEFAULT true
deleted_at                  TIMESTAMP
deleted_by                  UUID
created_at                  TIMESTAMP DEFAULT NOW()
updated_at                  TIMESTAMP DEFAULT NOW()
```

### **HOTELS (Colonnes Principales)**
```
id                  UUID PRIMARY KEY
name                VARCHAR(255) NOT NULL
description         TEXT
address             VARCHAR(255) NOT NULL
city                VARCHAR(100) NOT NULL
country             VARCHAR(100) NOT NULL
stars               INTEGER (1-5)
phone               VARCHAR(20)
email               VARCHAR(255)
website             VARCHAR(255)
check_in_time       TIME DEFAULT '15:00:00'
check_out_time      TIME DEFAULT '11:00:00'
is_active           BOOLEAN DEFAULT true
slug                VARCHAR(255) UNIQUE
owner_id            UUID REFERENCES users(id)
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
```

### **ROOMS (Colonnes Principales)**
```
id                      UUID PRIMARY KEY
hotel_id                UUID REFERENCES hotels(id)
room_number             VARCHAR(50) NOT NULL
room_type               room_type NOT NULL
floor                   INTEGER
capacity_adults         INTEGER (1-10)
capacity_children       INTEGER (0-10)
capacity_infants        INTEGER (0-5)
base_price              NUMERIC(10, 2) NOT NULL
size_sqm                NUMERIC(6, 2)
view_type               view_type
description             TEXT
is_accessible           BOOLEAN DEFAULT false
is_smoking_allowed      BOOLEAN DEFAULT false
is_active               BOOLEAN DEFAULT true
created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()

UNIQUE(hotel_id, room_number)
```

---

## 🛠️ Rollback (En cas de problème)

Si quelque chose ne va pas, vous pouvez restaurer avec:

```sql
-- Supprimer les nouvelles colonnes
ALTER TABLE users DROP COLUMN IF EXISTS email_confirmed;
ALTER TABLE users DROP COLUMN IF EXISTS is_active;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
-- etc.
```

**⚠️ Attention:** Le rollback supprimera les données de ces colonnes!

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifiez les logs Supabase** dans le dashboard
2. **Exécutez le script de vérification** pour voir l'état actuel
3. **Contactez le support** avec le message d'erreur exact

---

🤖 **Généré automatiquement**
📅 **Date:** 2026-01-10
✅ **Testé:** Compatible Supabase PostgreSQL 15+
