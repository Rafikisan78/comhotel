import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { RoomsService } from "../rooms.service";
import { SupabaseService } from "@/common/database/supabase.service";
import { CreateRoomDto, RoomType, ViewType } from "../dto/create-room.dto";
import { UpdateRoomDto } from "../dto/update-room.dto";
import { Room } from "../entities/room.entity";

describe("RoomsService", () => {
  let service: RoomsService;
  let supabase: any;

  const mockHotel = {
    id: "hotel-123",
    owner_id: "owner-456",
  };

  const mockRoom: Room = {
    id: "room-123",
    hotel_id: "hotel-123",
    room_number: "101",
    room_type: RoomType.DOUBLE,
    floor: 1,
    capacity_adults: 2,
    capacity_children: 1,
    capacity_infants: 0,
    base_price: 150,
    size_sqm: 25,
    view_type: ViewType.SEA,
    description: "Beautiful sea view room",
    is_accessible: false,
    is_smoking_allowed: false,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(async () => {
    supabase = {
      from: jest.fn(),
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue(supabase),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe("create", () => {
    const createRoomDto: CreateRoomDto = {
      hotel_id: "hotel-123",
      room_number: "101",
      room_type: RoomType.DOUBLE,
      floor: 1,
      capacity_adults: 2,
      capacity_children: 1,
      base_price: 150,
      size_sqm: 25,
      view_type: ViewType.SEA,
      description: "Beautiful sea view room",
      is_accessible: false,
      is_smoking_allowed: false,
      is_active: true,
    };

    it("devrait créer une chambre avec succès", async () => {
      // Mock hotel check
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockHotel, error: null });

      // Mock room insert
      supabase.from.mockReturnValueOnce(supabase);
      supabase.insert.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

      const result = await service.create(createRoomDto);

      expect(result).toEqual(mockRoom);
    });

    it("devrait lever une NotFoundException si l'hôtel n'existe pas", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Hotel not found" },
      });

      await expect(service.create(createRoomDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("devrait lever une BadRequestException si l'insertion échoue", async () => {
      // Mock hotel check success
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockHotel, error: null });

      // Mock room insert failure
      supabase.from.mockReturnValueOnce(supabase);
      supabase.insert.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert failed" },
      });

      await expect(service.create(createRoomDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    const mockRooms: Room[] = [mockRoom, { ...mockRoom, id: "room-456" }];

    it("devrait retourner toutes les chambres actives par défaut", async () => {
      const mockQuery = Promise.resolve({ data: mockRooms, error: null });
      (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.order.mockReturnValueOnce(mockQuery);

      const result = await service.findAll();

      expect(result).toEqual(mockRooms);
      expect((mockQuery as any).eq).toHaveBeenCalledWith("is_active", true);
    });

    it("devrait filtrer par hotel_id si fourni", async () => {
      const mockQuery = Promise.resolve({ data: mockRooms, error: null });
      (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.order.mockReturnValueOnce(mockQuery);

      const result = await service.findAll({ hotel_id: "hotel-123" });

      expect(result).toEqual(mockRooms);
      expect((mockQuery as any).eq).toHaveBeenCalledWith(
        "hotel_id",
        "hotel-123",
      );
      expect((mockQuery as any).eq).toHaveBeenCalledWith("is_active", true);
    });

    it("devrait filtrer par is_active si fourni explicitement", async () => {
      const inactiveRooms = [{ ...mockRoom, is_active: false }];
      const mockQuery = Promise.resolve({ data: inactiveRooms, error: null });
      (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.order.mockReturnValueOnce(mockQuery);

      const result = await service.findAll({ is_active: false });

      expect(result).toEqual(inactiveRooms);
      expect((mockQuery as any).eq).toHaveBeenCalledWith("is_active", false);
    });

    it("devrait retourner un tableau vide si aucune chambre trouvée", async () => {
      const mockQuery = Promise.resolve({ data: null, error: null });
      (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.order.mockReturnValueOnce(mockQuery);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it("devrait lever une BadRequestException si la requête échoue", async () => {
      const mockQuery = Promise.resolve({
        data: null,
        error: { message: "Query failed" },
      });
      (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.order.mockReturnValueOnce(mockQuery);

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe("findOne", () => {
    it("devrait retourner une chambre par son ID", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

      const result = await service.findOne("room-123");

      expect(result).toEqual(mockRoom);
    });

    it("devrait lever une NotFoundException si la chambre n'existe pas", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      await expect(service.findOne("nonexistent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByHotel", () => {
    const mockRooms: Room[] = [mockRoom, { ...mockRoom, id: "room-456" }];

    it("devrait retourner toutes les chambres actives d'un hôtel", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.order.mockResolvedValueOnce({ data: mockRooms, error: null });

      const result = await service.findByHotel("hotel-123");

      expect(result).toEqual(mockRooms);
      expect(supabase.eq).toHaveBeenCalledWith("hotel_id", "hotel-123");
      expect(supabase.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("devrait retourner un tableau vide si aucune chambre trouvée", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.order.mockResolvedValueOnce({ data: null, error: null });

      const result = await service.findByHotel("hotel-123");

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    const updateRoomDto: UpdateRoomDto = {
      base_price: 200,
      description: "Updated description",
    };

    it("devrait mettre à jour une chambre avec succès", async () => {
      const updatedRoom = { ...mockRoom, ...updateRoomDto };

      // Mock findOne
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

      // Mock update
      supabase.from.mockReturnValueOnce(supabase);
      supabase.update.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: updatedRoom, error: null });

      const result = await service.update("room-123", updateRoomDto);

      expect(result).toEqual(updatedRoom);
    });

    it("devrait vérifier que la chambre existe avant la mise à jour", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      await expect(
        service.update("nonexistent-id", updateRoomDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("devrait effectuer une suppression douce (soft delete)", async () => {
      // Mock findOne
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

      // Mock update
      supabase.from.mockReturnValueOnce(supabase);
      supabase.update.mockReturnValueOnce(supabase);
      supabase.eq.mockResolvedValueOnce({ data: null, error: null });

      const result = await service.remove("room-123");

      expect(result).toBe(true);
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
        }),
      );
    });

    it("devrait vérifier que la chambre existe avant la suppression", async () => {
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      await expect(service.remove("nonexistent-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("devrait lever une BadRequestException si la suppression échoue", async () => {
      // Mock findOne success
      supabase.from.mockReturnValueOnce(supabase);
      supabase.select.mockReturnValueOnce(supabase);
      supabase.eq.mockReturnValueOnce(supabase);
      supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

      // Mock update failure
      supabase.from.mockReturnValueOnce(supabase);
      supabase.update.mockReturnValueOnce(supabase);
      supabase.eq.mockResolvedValueOnce({
        data: null,
        error: { message: "Delete failed" },
      });

      await expect(service.remove("room-123")).rejects.toThrow(
        "Failed to delete room: Delete failed",
      );
    });
  });

  describe("Error Handling & Edge Cases", () => {
    describe("create - error scenarios", () => {
      it("devrait gérer les erreurs inattendues lors de la création", async () => {
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockRejectedValueOnce(new Error("Unexpected DB error"));

        await expect(
          service.create({
            hotel_id: "hotel-123",
            room_number: "101",
            room_type: RoomType.SINGLE,
            capacity_adults: 1,
            base_price: 100,
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it("devrait définir is_active à true si non fourni", async () => {
        const createDto = {
          hotel_id: "hotel-123",
          room_number: "101",
          room_type: RoomType.SINGLE,
          capacity_adults: 1,
          base_price: 100,
        };

        // Mock hotel check
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockHotel, error: null });

        // Mock room insert
        supabase.from.mockReturnValueOnce(supabase);
        supabase.insert.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({
          data: { ...mockRoom, is_active: true },
          error: null,
        });

        const result = await service.create(createDto);

        expect(result.is_active).toBe(true);
        const insertCall = supabase.insert.mock.calls[0][0];
        expect(insertCall.is_active).toBe(true);
      });
    });

    describe("findOne - error scenarios", () => {
      it("devrait gérer les erreurs inattendues", async () => {
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockRejectedValueOnce(new Error("Unexpected error"));

        await expect(service.findOne("room-123")).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.findOne("room-123")).rejects.toThrow(
          "Failed to fetch room",
        );
      });
    });

    describe("findByHotel - error scenarios", () => {
      it("devrait lever une BadRequestException si la requête échoue", async () => {
        const mockQuery = Promise.resolve({
          data: null,
          error: { message: "Query failed" },
        });
        (mockQuery as any).eq = jest.fn().mockReturnValue(mockQuery);

        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(mockQuery);

        await expect(service.findByHotel("hotel-123")).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.findByHotel("hotel-123")).rejects.toThrow(
          "Failed to fetch hotel rooms",
        );
      });

      it("devrait gérer les erreurs inattendues", async () => {
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockImplementationOnce(() => {
          throw new Error("Unexpected error");
        });

        await expect(service.findByHotel("hotel-123")).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("update - error scenarios", () => {
      it("devrait lever une BadRequestException si la mise à jour échoue", async () => {
        // Mock findOne success
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        // Mock update failure
        supabase.from.mockReturnValueOnce(supabase);
        supabase.update.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({
          data: null,
          error: { message: "Update failed" },
        });

        await expect(
          service.update("room-123", { base_price: 200 }),
        ).rejects.toThrow("Failed to update room: Update failed");
      });

      it("devrait gérer les erreurs inattendues", async () => {
        // Mock findOne success
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        // Mock unexpected error during update
        supabase.from.mockReturnValueOnce(supabase);
        supabase.update.mockImplementationOnce(() => {
          throw new Error("Unexpected error");
        });

        await expect(
          service.update("room-123", { base_price: 200 }),
        ).rejects.toThrow(BadRequestException);
      });

      it("devrait inclure updated_at automatiquement", async () => {
        // Mock findOne
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        // Mock update
        supabase.from.mockReturnValueOnce(supabase);
        supabase.update.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        await service.update("room-123", { base_price: 200 });

        const updateCall = supabase.update.mock.calls[0][0];
        expect(updateCall.updated_at).toBeDefined();
        expect(typeof updateCall.updated_at).toBe("string");
      });
    });

    describe("remove - soft delete verification", () => {
      it("devrait inclure updated_at lors de la suppression", async () => {
        // Mock findOne
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        // Mock update
        supabase.from.mockReturnValueOnce(supabase);
        supabase.update.mockReturnValueOnce(supabase);
        supabase.eq.mockResolvedValueOnce({ data: null, error: null });

        await service.remove("room-123");

        const updateCall = supabase.update.mock.calls[0][0];
        expect(updateCall.is_active).toBe(false);
        expect(updateCall.updated_at).toBeDefined();
        expect(typeof updateCall.updated_at).toBe("string");
      });

      it("devrait gérer les erreurs inattendues", async () => {
        // Mock findOne success
        supabase.from.mockReturnValueOnce(supabase);
        supabase.select.mockReturnValueOnce(supabase);
        supabase.eq.mockReturnValueOnce(supabase);
        supabase.single.mockResolvedValueOnce({ data: mockRoom, error: null });

        // Mock unexpected error
        supabase.from.mockReturnValueOnce(supabase);
        supabase.update.mockImplementationOnce(() => {
          throw new Error("Unexpected error");
        });

        await expect(service.remove("room-123")).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("Validation des types d'énumération", () => {
      it("devrait accepter tous les RoomType valides", async () => {
        const roomTypes = [
          RoomType.SINGLE,
          RoomType.DOUBLE,
          RoomType.SUITE,
          RoomType.DELUXE,
        ];

        for (const roomType of roomTypes) {
          // Mock hotel check
          supabase.from.mockReturnValueOnce(supabase);
          supabase.select.mockReturnValueOnce(supabase);
          supabase.eq.mockReturnValueOnce(supabase);
          supabase.single.mockResolvedValueOnce({
            data: mockHotel,
            error: null,
          });

          // Mock room insert
          supabase.from.mockReturnValueOnce(supabase);
          supabase.insert.mockReturnValueOnce(supabase);
          supabase.select.mockReturnValueOnce(supabase);
          supabase.single.mockResolvedValueOnce({
            data: { ...mockRoom, room_type: roomType },
            error: null,
          });

          const result = await service.create({
            hotel_id: "hotel-123",
            room_number: "101",
            room_type: roomType,
            capacity_adults: 2,
            base_price: 100,
          });

          expect(result.room_type).toBe(roomType);
        }
      });

      it("devrait accepter tous les ViewType valides", async () => {
        const viewTypes = [ViewType.SEA, ViewType.MOUNTAIN, ViewType.CITY];

        for (const viewType of viewTypes) {
          // Mock hotel check
          supabase.from.mockReturnValueOnce(supabase);
          supabase.select.mockReturnValueOnce(supabase);
          supabase.eq.mockReturnValueOnce(supabase);
          supabase.single.mockResolvedValueOnce({
            data: mockHotel,
            error: null,
          });

          // Mock room insert
          supabase.from.mockReturnValueOnce(supabase);
          supabase.insert.mockReturnValueOnce(supabase);
          supabase.select.mockReturnValueOnce(supabase);
          supabase.single.mockResolvedValueOnce({
            data: { ...mockRoom, view_type: viewType },
            error: null,
          });

          const result = await service.create({
            hotel_id: "hotel-123",
            room_number: "101",
            room_type: RoomType.DOUBLE,
            capacity_adults: 2,
            base_price: 100,
            view_type: viewType,
          });

          expect(result.view_type).toBe(viewType);
        }
      });
    });
  });
});
