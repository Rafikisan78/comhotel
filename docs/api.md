# Documentation API

## Base URL

- **Développement**: `http://localhost:3001`
- **Production**: `https://api.your-domain.com`

## Authentification

Toutes les routes protégées nécessitent un token JWT dans le header:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "jwt_token"
}
```

#### POST /auth/login
Se connecter.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Users

#### GET /users
Liste tous les utilisateurs (Admin uniquement).

#### GET /users/:id
Récupérer un utilisateur par ID.

#### PUT /users/:id
Mettre à jour un utilisateur.

#### DELETE /users/:id
Supprimer un utilisateur.

### Hotels

#### GET /hotels
Liste tous les hôtels.

**Query params:**
- `city`: Filtrer par ville
- `country`: Filtrer par pays
- `starRating`: Filtrer par étoiles

#### GET /hotels/:id
Récupérer un hôtel par ID.

#### POST /hotels
Créer un nouvel hôtel (Propriétaire uniquement).

**Body:**
```json
{
  "name": "Hotel Exemple",
  "description": "Un bel hôtel",
  "address": "123 Rue Exemple",
  "city": "Paris",
  "country": "France",
  "zipCode": "75001",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "starRating": 4,
  "amenities": ["wifi", "parking", "piscine"]
}
```

#### PUT /hotels/:id
Mettre à jour un hôtel.

#### DELETE /hotels/:id
Supprimer un hôtel.

### Rooms

#### GET /rooms
Liste toutes les chambres.

**Query params:**
- `hotelId`: Filtrer par hôtel
- `type`: Filtrer par type
- `minPrice`: Prix minimum
- `maxPrice`: Prix maximum

#### GET /rooms/:id
Récupérer une chambre par ID.

#### POST /rooms
Créer une nouvelle chambre.

#### PUT /rooms/:id
Mettre à jour une chambre.

#### DELETE /rooms/:id
Supprimer une chambre.

### Bookings

#### GET /bookings
Liste toutes les réservations de l'utilisateur.

#### GET /bookings/:id
Récupérer une réservation par ID.

#### POST /bookings
Créer une nouvelle réservation.

**Body:**
```json
{
  "roomId": "uuid",
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-05",
  "guests": 2
}
```

#### PUT /bookings/:id
Mettre à jour une réservation.

#### DELETE /bookings/:id
Annuler une réservation.

### Payments

#### POST /payments/create-intent
Créer une intention de paiement Stripe.

**Body:**
```json
{
  "bookingId": "uuid",
  "amount": 500.00,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST /payments/confirm
Confirmer un paiement.

### Search

#### GET /search/hotels
Recherche intelligente d'hôtels.

**Query params:**
- `city`: Ville
- `checkIn`: Date d'arrivée
- `checkOut`: Date de départ
- `guests`: Nombre de personnes
- `minPrice`: Prix minimum
- `maxPrice`: Prix maximum
- `starRating`: Étoiles
- `amenities`: Équipements (comma-separated)

## Codes d'État

- `200`: Succès
- `201`: Créé
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Accès interdit
- `404`: Non trouvé
- `500`: Erreur serveur

## Pagination

Les endpoints de liste supportent la pagination:

```
GET /hotels?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```
