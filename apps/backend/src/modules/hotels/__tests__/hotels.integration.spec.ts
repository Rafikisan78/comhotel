import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { HotelsService } from "../hotels.service";
import { SupabaseService } from "../../../common/database/supabase.service";
import { CreateHotelDto } from "../dto/create-hotel.dto";
import { UpdateHotelDto } from "../dto/update-hotel.dto";

describe("HotelsService - Integration Tests with Supabase", () => {
  let service: HotelsService;
  let supabaseService: SupabaseService;
  const createdHotelIds: string[] = [];
  let testOwnerId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
      ],
      providers: [HotelsService, SupabaseService],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Initialiser explicitement le client Supabase
    await module.init();

    // Créer un utilisateur de test pour être propriétaire
    const supabase = supabaseService.getClient();
    const { data: testUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", "test-hotel-owner@comhotel.test")
      .single();

    if (testUser) {
      testOwnerId = testUser.id;
    } else {
      // Créer l'utilisateur test s'il n'existe pas
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: "test-hotel-owner@comhotel.test",
          password_hash:
            "$2b$10$testtesttesttesttesttesttesttesttesttesttesttest",
          first_name: "Test",
          last_name: "Owner",
          role: "hotel_owner",
          email_confirmed: true,
          is_active: true,
        })
        .select("id")
        .single();

      testOwnerId = newUser!.id;
    }
  });

  afterAll(async () => {
    // Nettoyer tous les hôtels créés pendant les tests
    const supabase = supabaseService.getClient();

    if (createdHotelIds.length > 0) {
      await supabase.from("hotels").delete().in("id", createdHotelIds);
    }

    // Optionnel: nettoyer l'utilisateur test
    // await supabase.from('users').delete().eq('id', testOwnerId);
  });

  describe("CREATE - Création d'hôtels", () => {
    it("devrait créer un hôtel 5 étoiles à Paris", async () => {
      const createDto: CreateHotelDto = {
        name: "Test Hotel Plaza Paris",
        description:
          "Un magnifique hôtel de luxe au cœur de Paris avec vue sur la Tour Eiffel",
        address: "1 Rue de Test",
        city: "Paris",
        zip_code: "75001",
        country: "France",
        star_rating: 5,
        phone: "+33140200000",
        email: "test@hotelplaza.fr",
        website: "https://testhotelplaza.fr",
      };

      const result = await service.create(createDto, testOwnerId);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test Hotel Plaza Paris");
      expect(result.slug).toBe("test-hotel-plaza-paris");
      expect(result.star_rating).toBe(5);
      expect(result.owner_id).toBe(testOwnerId);
      expect(result.is_active).toBe(true);

      createdHotelIds.push(result.id);
    });

    it("devrait créer un hôtel 3 étoiles à Lyon", async () => {
      const createDto: CreateHotelDto = {
        name: "Test Hotel Lyon Centre",
        description:
          "Un hôtel confortable au centre de Lyon, proche de la gare Part-Dieu",
        address: "10 Rue de la République",
        city: "Lyon",
        zip_code: "69002",
        country: "France",
        star_rating: 3,
        amenities: ["wifi", "parking", "breakfast"],
      };

      const result = await service.create(createDto, testOwnerId);

      expect(result).toBeDefined();
      expect(result.city).toBe("Lyon");
      expect(result.star_rating).toBe(3);
      expect(result.amenities).toContain("wifi");

      createdHotelIds.push(result.id);
    });

    it("devrait refuser de créer un hôtel avec un slug déjà existant", async () => {
      const createDto1: CreateHotelDto = {
        name: "Test Hotel Unique",
        description:
          "Un hôtel unique avec un nom spécifique pour tester les doublons de slug",
        address: "1 Rue Test",
        city: "Paris",
        zip_code: "75001",
        country: "France",
        star_rating: 4,
        slug: "test-hotel-unique-slug-12345",
      };

      const hotel1 = await service.create(createDto1, testOwnerId);
      createdHotelIds.push(hotel1.id);

      const createDto2: CreateHotelDto = {
        name: "Test Hotel Different",
        description:
          "Un autre hôtel avec le même slug que le précédent pour tester",
        address: "2 Rue Test",
        city: "Paris",
        zip_code: "75002",
        country: "France",
        star_rating: 3,
        slug: "test-hotel-unique-slug-12345", // Même slug
      };

      await expect(service.create(createDto2, testOwnerId)).rejects.toThrow();
    });

    it("devrait générer automatiquement un slug à partir du nom", async () => {
      const createDto: CreateHotelDto = {
        name: "Hôtel Élégant à Marseille!!!",
        description:
          "Un hôtel élégant situé au cœur de Marseille avec vue sur le Vieux-Port",
        address: "15 Quai du Port",
        city: "Marseille",
        zip_code: "13002",
        country: "France",
        star_rating: 4,
      };

      const result = await service.create(createDto, testOwnerId);

      expect(result.slug).toBe("hotel-elegant-a-marseille");
      createdHotelIds.push(result.id);
    });
  });

  describe("READ - Lecture des hôtels", () => {
    let testHotelId: string;

    beforeAll(async () => {
      // Créer un hôtel pour les tests de lecture
      const createDto: CreateHotelDto = {
        name: "Test Hotel for Reading",
        description:
          "Un hôtel créé spécifiquement pour tester les opérations de lecture",
        address: "100 Rue de Lecture",
        city: "Nice",
        zip_code: "06000",
        country: "France",
        star_rating: 4,
      };

      const hotel = await service.create(createDto, testOwnerId);
      testHotelId = hotel.id;
      createdHotelIds.push(testHotelId);
    });

    it("devrait récupérer un hôtel par ID", async () => {
      const result = await service.findOne(testHotelId);

      expect(result).toBeDefined();
      expect(result!.id).toBe(testHotelId);
      expect(result!.name).toBe("Test Hotel for Reading");
    });

    it("devrait récupérer un hôtel par slug", async () => {
      const result = await service.findBySlug("test-hotel-for-reading");

      expect(result).toBeDefined();
      expect(result!.id).toBe(testHotelId);
      expect(result!.slug).toBe("test-hotel-for-reading");
    });

    it("devrait récupérer tous les hôtels actifs", async () => {
      const results = await service.findAll();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Tous les hôtels doivent être actifs
      results.forEach((hotel) => {
        expect(hotel.is_active).toBe(true);
      });
    });

    it("devrait récupérer tous les hôtels du propriétaire", async () => {
      const results = await service.findByOwner(testOwnerId);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Tous les hôtels doivent appartenir au propriétaire
      results.forEach((hotel) => {
        expect(hotel.owner_id).toBe(testOwnerId);
      });
    });

    it("devrait retourner null pour un ID inexistant", async () => {
      const result = await service.findOne(
        "00000000-0000-0000-0000-000000000000",
      );

      expect(result).toBeNull();
    });

    it("devrait retourner null pour un slug inexistant", async () => {
      const result = await service.findBySlug("hotel-qui-nexiste-pas-12345");

      expect(result).toBeNull();
    });
  });

  describe("SEARCH - Recherche d'hôtels", () => {
    beforeAll(async () => {
      // Créer plusieurs hôtels dans différentes villes pour les tests de recherche
      const hotels: CreateHotelDto[] = [
        {
          name: "Test Search Hotel Paris 1",
          description:
            "Hôtel de test à Paris pour recherche avec 5 étoiles et excellente note",
          address: "1 Rue Search Paris",
          city: "Paris",
          zip_code: "75001",
          country: "France",
          star_rating: 5,
        },
        {
          name: "Test Search Hotel Bordeaux",
          description:
            "Hôtel de test à Bordeaux pour recherche avec 4 étoiles et bonne note",
          address: "2 Rue Search Bordeaux",
          city: "Bordeaux",
          zip_code: "33000",
          country: "France",
          star_rating: 4,
        },
        {
          name: "Test Search Hotel Toulouse",
          description:
            "Hôtel de test à Toulouse pour recherche avec 3 étoiles et note moyenne",
          address: "3 Rue Search Toulouse",
          city: "Toulouse",
          zip_code: "31000",
          country: "France",
          star_rating: 3,
        },
      ];

      for (const dto of hotels) {
        const hotel = await service.create(dto, testOwnerId);
        createdHotelIds.push(hotel.id);
      }
    });

    it("devrait rechercher des hôtels par ville (Paris)", async () => {
      const results = await service.searchByCity("Paris");

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Tous les résultats doivent contenir "Paris" dans la ville
      results.forEach((hotel) => {
        expect(hotel.city.toLowerCase()).toContain("paris");
      });
    });

    it("devrait rechercher des hôtels par ville (insensible à la casse)", async () => {
      const results = await service.searchByCity("bordeaux");

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it("devrait rechercher avec filtre par pays", async () => {
      const results = await service.search({ country: "France" });

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      results.forEach((hotel) => {
        expect(hotel.country).toBe("France");
      });
    });

    it("devrait rechercher avec filtre min_stars", async () => {
      const results = await service.search({ min_stars: 4 });

      expect(results).toBeDefined();

      results.forEach((hotel) => {
        expect(hotel.star_rating).toBeGreaterThanOrEqual(4);
      });
    });

    it("devrait rechercher avec filtre max_stars", async () => {
      const results = await service.search({ max_stars: 3 });

      expect(results).toBeDefined();

      results.forEach((hotel) => {
        expect(hotel.star_rating).toBeLessThanOrEqual(3);
      });
    });

    it("devrait rechercher avec plusieurs filtres combinés", async () => {
      const results = await service.search({
        city: "Paris",
        country: "France",
        min_stars: 4,
        max_stars: 5,
      });

      expect(results).toBeDefined();

      results.forEach((hotel) => {
        expect(hotel.city).toContain("Paris");
        expect(hotel.country).toBe("France");
        expect(hotel.star_rating).toBeGreaterThanOrEqual(4);
        expect(hotel.star_rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe("UPDATE - Mise à jour d'hôtels", () => {
    let updateTestHotelId: string;

    beforeAll(async () => {
      const createDto: CreateHotelDto = {
        name: "Test Hotel for Update",
        description:
          "Un hôtel créé spécifiquement pour tester les mises à jour de données",
        address: "200 Rue Update",
        city: "Strasbourg",
        zip_code: "67000",
        country: "France",
        star_rating: 3,
      };

      const hotel = await service.create(createDto, testOwnerId);
      updateTestHotelId = hotel.id;
      createdHotelIds.push(updateTestHotelId);
    });

    it("devrait mettre à jour le nom d'un hôtel", async () => {
      const updateDto: UpdateHotelDto = {
        name: "Test Hotel Updated Name",
      };

      const result = await service.update(
        updateTestHotelId,
        updateDto,
        testOwnerId,
        "hotel_owner",
      );

      expect(result).toBeDefined();
      expect(result.name).toBe("Test Hotel Updated Name");
      expect(result.slug).toContain("test-hotel-updated-name");
    });

    it("devrait mettre à jour la description", async () => {
      const updateDto: UpdateHotelDto = {
        description:
          "Description mise à jour avec de nouvelles informations sur l'hôtel",
      };

      const result = await service.update(
        updateTestHotelId,
        updateDto,
        testOwnerId,
        "hotel_owner",
      );

      expect(result.description).toBe(
        "Description mise à jour avec de nouvelles informations sur l'hôtel",
      );
    });

    it("devrait mettre à jour plusieurs champs en même temps", async () => {
      const updateDto: UpdateHotelDto = {
        phone: "+33388000000",
        email: "updated@hotel.fr",
        website: "https://updated-hotel.fr",
      };

      const result = await service.update(
        updateTestHotelId,
        updateDto,
        testOwnerId,
        "hotel_owner",
      );

      expect(result.phone).toBe("+33388000000");
      expect(result.email).toBe("updated@hotel.fr");
      expect(result.website).toBe("https://updated-hotel.fr");
    });

    it("devrait refuser la mise à jour si l'utilisateur n'est pas propriétaire", async () => {
      const updateDto: UpdateHotelDto = {
        name: "Unauthorized Update",
      };

      const fakeUserId = "00000000-0000-0000-0000-000000000001";

      await expect(
        service.update(updateTestHotelId, updateDto, fakeUserId, "hotel_owner"),
      ).rejects.toThrow();
    });

    it("devrait autoriser la mise à jour en tant qu'admin même si pas propriétaire", async () => {
      const updateDto: UpdateHotelDto = {
        is_featured: true,
      };

      const adminUserId = "00000000-0000-0000-0000-000000000001";

      const result = await service.update(
        updateTestHotelId,
        updateDto,
        adminUserId,
        "admin",
      );

      expect(result.is_featured).toBe(true);
    });

    it("devrait refuser la mise à jour d'un hôtel inexistant", async () => {
      const updateDto: UpdateHotelDto = {
        name: "Update Non Existent",
      };

      await expect(
        service.update(
          "00000000-0000-0000-0000-000000000000",
          updateDto,
          testOwnerId,
          "hotel_owner",
        ),
      ).rejects.toThrow();
    });
  });

  describe("DELETE - Suppression d'hôtels (soft delete)", () => {
    let deleteTestHotelId: string;

    beforeAll(async () => {
      const createDto: CreateHotelDto = {
        name: "Test Hotel for Deletion",
        description:
          "Un hôtel créé spécifiquement pour tester la suppression logique (soft delete)",
        address: "300 Rue Delete",
        city: "Nantes",
        zip_code: "44000",
        country: "France",
        star_rating: 3,
      };

      const hotel = await service.create(createDto, testOwnerId);
      deleteTestHotelId = hotel.id;
      createdHotelIds.push(deleteTestHotelId);
    });

    it("devrait soft delete un hôtel (is_active = false)", async () => {
      const result = await service.remove(
        deleteTestHotelId,
        testOwnerId,
        "hotel_owner",
      );

      expect(result).toBe(true);

      // Vérifier que l'hôtel est marqué comme inactif
      const hotel = await service.findOne(deleteTestHotelId);
      expect(hotel!.is_active).toBe(false);
    });

    it("ne devrait pas retourner les hôtels inactifs dans findAll", async () => {
      const results = await service.findAll();

      // L'hôtel supprimé ne doit pas apparaître
      const deletedHotel = results.find((h) => h.id === deleteTestHotelId);
      expect(deletedHotel).toBeUndefined();
    });

    it("ne devrait pas retourner les hôtels inactifs dans findBySlug", async () => {
      const result = await service.findBySlug("test-hotel-for-deletion");

      expect(result).toBeNull();
    });

    it("devrait toujours pouvoir récupérer l'hôtel inactif par ID avec findOne", async () => {
      const result = await service.findOne(deleteTestHotelId);

      expect(result).toBeDefined();
      expect(result!.is_active).toBe(false);
    });

    it("devrait refuser la suppression si l'utilisateur n'est pas propriétaire", async () => {
      const fakeUserId = "00000000-0000-0000-0000-000000000001";

      await expect(
        service.remove(deleteTestHotelId, fakeUserId, "hotel_owner"),
      ).rejects.toThrow();
    });

    it("devrait autoriser la suppression en tant qu'admin", async () => {
      // Créer un autre hôtel pour le test admin
      const createDto: CreateHotelDto = {
        name: "Test Hotel Admin Delete",
        description:
          "Un hôtel créé pour tester la suppression par un administrateur système",
        address: "400 Rue Admin",
        city: "Lille",
        zip_code: "59000",
        country: "France",
        star_rating: 3,
      };

      const hotel = await service.create(createDto, testOwnerId);
      createdHotelIds.push(hotel.id);

      const adminUserId = "00000000-0000-0000-0000-000000000001";
      const result = await service.remove(hotel.id, adminUserId, "admin");

      expect(result).toBe(true);
    });
  });

  describe("ADMIN - Opérations administrateur", () => {
    it("devrait récupérer tous les hôtels incluant les inactifs (admin)", async () => {
      const results = await service.findAllForAdmin();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Devrait contenir des hôtels actifs et inactifs
      const hasInactive = results.some((h) => h.is_active === false);
      expect(hasInactive).toBe(true);
    });
  });
});
