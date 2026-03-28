import { Test, TestingModule } from "@nestjs/testing";
import { JwtService, JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";
import { SupabaseService } from "../../../common/database/supabase.service";
import { CreateUserDto } from "../../users/dto/create-user.dto";

describe("AuthService - Integration Tests with Supabase", () => {
  let authService: AuthService;
  let supabaseService: SupabaseService;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || "test-secret-key",
          signOptions: { expiresIn: "7d" },
        }),
      ],
      providers: [AuthService, UsersService, SupabaseService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Initialiser explicitement le client Supabase
    await module.init();
  });

  afterAll(async () => {
    // Nettoyer tous les utilisateurs créés pendant les tests
    const supabase = supabaseService.getClient();

    if (createdUserIds.length > 0) {
      await supabase.from("users").delete().in("id", createdUserIds);
    }
  });

  describe("REGISTER - Inscription de nouveaux utilisateurs", () => {
    it("devrait inscrire un nouvel utilisateur avec succès", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-register-${Date.now()}@comhotel.test`,
        password: "Test@2024Secure!",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33612345678",
      };

      const result = await authService.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(createUserDto.email);
      expect(result.user.firstName).toBe("Jean");
      expect(result.user.lastName).toBe("Dupont");
      expect(result.user.role).toBe("guest");
      expect(result.user.emailConfirmed).toBe(false);
      expect(result.user.isActive).toBe(true);

      // Le mot de passe ne doit pas être retourné
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).password_hash).toBeUndefined();

      createdUserIds.push(result.user.id);
    });

    it("devrait générer un token JWT valide lors de l'inscription", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-jwt-${Date.now()}@comhotel.test`,
        password: "SecurePassword@2024!",
        firstName: "Marie",
        lastName: "Martin",
      };

      const result = await authService.register(createUserDto);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe("string");
      expect(result.accessToken.length).toBeGreaterThan(20);

      // Vérifier que le token contient bien les bonnes informations
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET || "test-secret-key",
      });

      const decoded = jwtService.verify(result.accessToken);
      expect(decoded.sub).toBe(result.user.id);
      expect(decoded.email).toBe(createUserDto.email);
      expect(decoded.role).toBe("guest");

      createdUserIds.push(result.user.id);
    });

    it("devrait refuser l'inscription avec un email déjà existant", async () => {
      const email = `test-duplicate-${Date.now()}@comhotel.test`;

      const createUserDto1: CreateUserDto = {
        email,
        password: "Password@2024!",
        firstName: "User",
        lastName: "One",
      };

      const result1 = await authService.register(createUserDto1);
      createdUserIds.push(result1.user.id);

      const createUserDto2: CreateUserDto = {
        email, // Même email
        password: "DifferentPassword@2024!",
        firstName: "User",
        lastName: "Two",
      };

      await expect(authService.register(createUserDto2)).rejects.toThrow();
    });

    it("devrait refuser l'inscription si l'email est manquant", async () => {
      const createUserDto: any = {
        password: "Password@2024!",
        firstName: "Jean",
        lastName: "Dupont",
      };

      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("devrait refuser l'inscription si le mot de passe est manquant", async () => {
      const createUserDto: any = {
        email: "test@example.com",
        firstName: "Jean",
        lastName: "Dupont",
      };

      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("devrait refuser l'inscription si le prénom est manquant", async () => {
      const createUserDto: any = {
        email: "test@example.com",
        password: "Password@2024!",
        lastName: "Dupont",
      };

      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("devrait refuser l'inscription si le nom est manquant", async () => {
      const createUserDto: any = {
        email: "test@example.com",
        password: "Password@2024!",
        firstName: "Jean",
      };

      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("devrait refuser un mot de passe trop faible (OWASP 2024)", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-weak-password-${Date.now()}@comhotel.test`,
        password: "123456", // Mot de passe trop faible
        firstName: "Test",
        lastName: "User",
      };

      await expect(authService.register(createUserDto)).rejects.toThrow();
    });

    it("devrait accepter un mot de passe fort (OWASP 2024)", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-strong-password-${Date.now()}@comhotel.test`,
        password: "SuperSecure@Password2024!WithNumbers&Symbols",
        firstName: "Test",
        lastName: "User",
      };

      const result = await authService.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();

      createdUserIds.push(result.user.id);
    });

    it("devrait hasher le mot de passe en base de données", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-hash-${Date.now()}@comhotel.test`,
        password: "MyPassword@2024!",
        firstName: "Test",
        lastName: "Hash",
      };

      const result = await authService.register(createUserDto);

      // Vérifier dans la base de données
      const supabase = supabaseService.getClient();
      const { data: user } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", result.user.id)
        .single();

      expect(user!.password_hash).toBeDefined();
      expect(user!.password_hash).not.toBe("MyPassword@2024!"); // Ne doit pas être en clair
      expect(user!.password_hash).toContain("$2b$"); // Doit être un hash bcrypt

      createdUserIds.push(result.user.id);
    });

    it("ne devrait JAMAIS permettre l'injection de rôle admin lors de l'inscription", async () => {
      const createUserDto: any = {
        email: `test-role-injection-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Hacker",
        lastName: "Attempt",
        role: "admin", // Tentative d'injection de rôle
      };

      const result = await authService.register(createUserDto);

      // Le rôle doit toujours être 'guest'
      expect(result.user.role).toBe("guest");
      expect(result.user.role).not.toBe("admin");

      createdUserIds.push(result.user.id);
    });
  });

  describe("LOGIN - Connexion des utilisateurs", () => {
    let testUserEmail: string;
    let testUserPassword: string;
    let testUserId: string;

    beforeAll(async () => {
      // Créer un utilisateur de test pour les connexions
      testUserEmail = `test-login-${Date.now()}@comhotel.test`;
      testUserPassword = "LoginPassword@2024!";

      const createUserDto: CreateUserDto = {
        email: testUserEmail,
        password: testUserPassword,
        firstName: "Login",
        lastName: "Test",
      };

      const result = await authService.register(createUserDto);
      testUserId = result.user.id;
      createdUserIds.push(testUserId);
    });

    it("devrait connecter un utilisateur avec les bons identifiants", async () => {
      const result = await authService.login({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(testUserEmail);
      expect(result.user.id).toBe(testUserId);

      // Le mot de passe ne doit pas être retourné
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).password_hash).toBeUndefined();
    });

    it("devrait générer un token JWT valide lors de la connexion", async () => {
      const result = await authService.login({
        email: testUserEmail,
        password: testUserPassword,
      });

      expect(result.accessToken).toBeDefined();

      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET || "test-secret-key",
      });

      const decoded = jwtService.verify(result.accessToken);
      expect(decoded.sub).toBe(testUserId);
      expect(decoded.email).toBe(testUserEmail);
    });

    it("devrait refuser la connexion avec un mauvais mot de passe", async () => {
      await expect(
        authService.login({
          email: testUserEmail,
          password: "WrongPassword@2024!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("devrait refuser la connexion avec un email inexistant", async () => {
      await expect(
        authService.login({
          email: "nonexistent@comhotel.test",
          password: "AnyPassword@2024!",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("devrait refuser la connexion avec un mot de passe vide", async () => {
      await expect(
        authService.login({
          email: testUserEmail,
          password: "",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("devrait refuser la connexion avec un email vide", async () => {
      await expect(
        authService.login({
          email: "",
          password: testUserPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("ne devrait PAS accepter les espaces dans le mot de passe", async () => {
      await expect(
        authService.login({
          email: testUserEmail,
          password: "   " + testUserPassword + "   ", // Espaces ajoutés
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("devrait être sensible à la casse pour le mot de passe", async () => {
      await expect(
        authService.login({
          email: testUserEmail,
          password: testUserPassword.toLowerCase(), // Changement de casse
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("ne devrait PAS être sensible à la casse pour l'email", async () => {
      const result = await authService.login({
        email: testUserEmail.toUpperCase(), // Email en majuscules
        password: testUserPassword,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe(testUserEmail);
    });
  });

  describe("SECURITY - Tests de sécurité", () => {
    it("devrait protéger contre les attaques par timing sur les emails", async () => {
      const start1 = Date.now();
      await authService
        .login({
          email: "nonexistent@comhotel.test",
          password: "AnyPassword@2024!",
        })
        .catch(() => {});
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await authService
        .login({
          email: "another-nonexistent@comhotel.test",
          password: "AnyPassword@2024!",
        })
        .catch(() => {});
      const time2 = Date.now() - start2;

      // Les temps devraient être similaires (différence < 50ms)
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(50);
    });

    it("ne devrait PAS révéler si un email existe lors d'une tentative de connexion", async () => {
      let errorMessage1 = "";
      try {
        await authService.login({
          email: "nonexistent@comhotel.test",
          password: "WrongPassword@2024!",
        });
      } catch (error: any) {
        errorMessage1 = error.message;
      }

      let errorMessage2 = "";
      try {
        await authService.login({
          email:
            createdUserIds.length > 0
              ? "existing@comhotel.test"
              : "test@comhotel.test",
          password: "WrongPassword@2024!",
        });
      } catch (error: any) {
        errorMessage2 = error.message;
      }

      // Les messages d'erreur doivent être identiques
      expect(errorMessage1).toBe(errorMessage2);
      expect(errorMessage1).toBe("Invalid credentials");
    });

    it("devrait hasher les mots de passe avec bcrypt (non réversible)", async () => {
      const password = "TestPassword@2024!";
      const email = `test-bcrypt-${Date.now()}@comhotel.test`;

      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: "Bcrypt",
        lastName: "Test",
      };

      const result = await authService.register(createUserDto);
      createdUserIds.push(result.user.id);

      // Vérifier dans la base de données
      const supabase = supabaseService.getClient();
      const { data: user } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", result.user.id)
        .single();

      expect(user!.password_hash).toContain("$2b$10$"); // Format bcrypt avec cost 10
      expect(user!.password_hash.length).toBe(60); // Longueur standard bcrypt
    });

    it("devrait créer un hash différent pour le même mot de passe (salt aléatoire)", async () => {
      const password = "SamePassword@2024!";

      const user1 = await authService.register({
        email: `test-salt1-${Date.now()}@comhotel.test`,
        password,
        firstName: "Salt",
        lastName: "Test1",
      });
      createdUserIds.push(user1.user.id);

      // Attendre 1ms pour éviter collision de timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));

      const user2 = await authService.register({
        email: `test-salt2-${Date.now()}@comhotel.test`,
        password,
        firstName: "Salt",
        lastName: "Test2",
      });
      createdUserIds.push(user2.user.id);

      // Récupérer les hash
      const supabase = supabaseService.getClient();
      const { data: userData1 } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", user1.user.id)
        .single();

      const { data: userData2 } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", user2.user.id)
        .single();

      // Les hash doivent être différents grâce au salt aléatoire
      expect(userData1!.password_hash).not.toBe(userData2!.password_hash);
    });
  });

  describe("EMAIL CONFIRMATION - Confirmation d'email", () => {
    it("devrait créer un utilisateur avec email non confirmé par défaut", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-email-confirm-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Email",
        lastName: "Confirm",
      };

      const result = await authService.register(createUserDto);

      expect(result.user.emailConfirmed).toBe(false);
      expect(result.user.emailConfirmationToken).toBeDefined();

      createdUserIds.push(result.user.id);
    });

    it("devrait générer un token de confirmation unique pour chaque utilisateur", async () => {
      const user1 = await authService.register({
        email: `test-token1-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Token",
        lastName: "Test1",
      });
      createdUserIds.push(user1.user.id);

      await new Promise((resolve) => setTimeout(resolve, 1));

      const user2 = await authService.register({
        email: `test-token2-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Token",
        lastName: "Test2",
      });
      createdUserIds.push(user2.user.id);

      expect(user1.user.emailConfirmationToken).toBeDefined();
      expect(user2.user.emailConfirmationToken).toBeDefined();
      expect(user1.user.emailConfirmationToken).not.toBe(
        user2.user.emailConfirmationToken,
      );
    });
  });

  describe("ACCOUNT STATUS - État du compte", () => {
    it("devrait créer un compte actif par défaut", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-active-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Active",
        lastName: "Test",
      };

      const result = await authService.register(createUserDto);

      expect(result.user.isActive).toBe(true);
      expect(result.user.deletedAt).toBeUndefined();

      createdUserIds.push(result.user.id);
    });

    it("devrait refuser la connexion d'un compte inactif", async () => {
      const email = `test-inactive-${Date.now()}@comhotel.test`;
      const password = "Password@2024!";

      const result = await authService.register({
        email,
        password,
        firstName: "Inactive",
        lastName: "Test",
      });
      createdUserIds.push(result.user.id);

      // Désactiver le compte
      const supabase = supabaseService.getClient();
      await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", result.user.id);

      // Tentative de connexion
      await expect(authService.login({ email, password })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("DATA INTEGRITY - Intégrité des données", () => {
    it("ne devrait JAMAIS retourner le mot de passe dans la réponse (register)", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-no-password-${Date.now()}@comhotel.test`,
        password: "SecretPassword@2024!",
        firstName: "No",
        lastName: "Password",
      };

      const result = await authService.register(createUserDto);

      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).password_hash).toBeUndefined();

      createdUserIds.push(result.user.id);
    });

    it("ne devrait JAMAIS retourner le mot de passe dans la réponse (login)", async () => {
      const email = `test-login-no-pwd-${Date.now()}@comhotel.test`;
      const password = "SecretPassword@2024!";

      const registerResult = await authService.register({
        email,
        password,
        firstName: "Login",
        lastName: "NoPassword",
      });
      createdUserIds.push(registerResult.user.id);

      const loginResult = await authService.login({ email, password });

      expect((loginResult.user as any).password).toBeUndefined();
      expect((loginResult.user as any).password_hash).toBeUndefined();
    });

    it("devrait stocker correctement les timestamps createdAt et updatedAt", async () => {
      const createUserDto: CreateUserDto = {
        email: `test-timestamps-${Date.now()}@comhotel.test`,
        password: "Password@2024!",
        firstName: "Timestamp",
        lastName: "Test",
      };

      const result = await authService.register(createUserDto);

      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
      expect(result.user.createdAt).toBeInstanceOf(Date);
      expect(result.user.updatedAt).toBeInstanceOf(Date);

      createdUserIds.push(result.user.id);
    });
  });
});
