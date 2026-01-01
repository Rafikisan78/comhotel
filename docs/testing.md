# Guide des Tests

## Règles de Tests

### Principes Fondamentaux

1. **Mock la base de données** - Utiliser des mocks pour Supabase
2. **Mock bcrypt** - Pas de hash réel dans les tests
3. **1 test = 1 comportement** - Un test doit vérifier un seul comportement
4. **Noms explicites** - Les noms de tests doivent être très descriptifs
5. **Pas d'I/O réel** - Aucun appel réseau ou base de données réel
6. **Tous les tests passent** - 100% de réussite requis
7. **Signatures préservées** - Ne pas modifier les signatures publiques
8. **Formats préservés** - Maintenir les formats de retour

## Structure des Tests

### Backend (NestJS + Jest)

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let mockSupabase: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    // Setup mocks
    mockSupabase = createMockSupabase();
    service = new UsersService(mockSupabase);
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
    });
  });
});
```

### Frontend (React Testing Library)

```typescript
describe('LoginPage', () => {
  it('devrait afficher le formulaire de connexion', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it('devrait soumettre le formulaire avec les bonnes données', async () => {
    const mockLogin = jest.fn();
    render(<LoginPage onLogin={mockLogin} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

## Mocks

### Mock Supabase

```typescript
// test/mocks/supabase.mock.ts
export const createMockSupabase = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
});
```

### Mock Bcrypt

```typescript
// test/mocks/bcrypt.mock.ts
export const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
};
```

### Mock Stripe

```typescript
// test/mocks/stripe.mock.ts
export const mockStripe = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    }),
  },
};
```

## Commandes

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests backend uniquement
npm run test:backend

# Tests frontend uniquement
npm run test:frontend
```

## Couverture de Code

Objectif: **80% minimum**

- Lignes: 80%
- Branches: 75%
- Fonctions: 80%
- Statements: 80%

## CI/CD

Les tests sont exécutés automatiquement :
- Sur chaque push
- Sur chaque pull request
- Avant le déploiement

Un échec de test bloque le déploiement.
