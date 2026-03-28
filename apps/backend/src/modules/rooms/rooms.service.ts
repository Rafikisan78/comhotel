import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "@/common/database/supabase.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { Room } from "./entities/room.entity";

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(createRoomDto: CreateRoomDto, _userId?: string): Promise<Room> {
    try {
      // Verify hotel exists
      const { data: hotel, error: hotelError } = await this.supabase
        .getClient()
        .from("hotels")
        .select("id, owner_id")
        .eq("id", createRoomDto.hotel_id)
        .single();

      if (hotelError || !hotel) {
        throw new NotFoundException(
          `Hotel with ID ${createRoomDto.hotel_id} not found`,
        );
      }

      // Insert room
      const { data, error } = await this.supabase
        .getClient()
        .from("rooms")
        .insert({
          ...createRoomDto,
          is_active: createRoomDto.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Error creating room: ${error.message}`);
        throw new BadRequestException(
          `Failed to create room: ${error.message}`,
        );
      }

      this.logger.log(`Room created successfully: ${data.id}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error creating room: ${error.message}`);
      throw new BadRequestException("Failed to create room");
    }
  }

  async findAll(filters?: {
    hotel_id?: string;
    is_active?: boolean;
  }): Promise<Room[]> {
    try {
      let query = this.supabase
        .getClient()
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.hotel_id) {
        query = query.eq("hotel_id", filters.hotel_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      } else {
        // By default, only show active rooms
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error(`Error fetching rooms: ${error.message}`);
        throw new BadRequestException("Failed to fetch rooms");
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching rooms: ${error.message}`);
      throw new BadRequestException("Failed to fetch rooms");
    }
  }

  async findOne(id: string): Promise<Room> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Unexpected error fetching room: ${error.message}`);
      throw new BadRequestException("Failed to fetch room");
    }
  }

  async findByHotel(hotelId: string): Promise<Room[]> {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from("rooms")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("is_active", true)
        .order("room_number", { ascending: true });

      if (error) {
        this.logger.error(
          `Error fetching rooms for hotel ${hotelId}: ${error.message}`,
        );
        throw new BadRequestException("Failed to fetch hotel rooms");
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error fetching hotel rooms: ${error.message}`,
      );
      throw new BadRequestException("Failed to fetch hotel rooms");
    }
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId?: string,
  ): Promise<Room> {
    try {
      // Verify room exists
      await this.findOne(id);

      const { data, error } = await this.supabase
        .getClient()
        .from("rooms")
        .update({
          ...updateRoomDto,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating room ${id}: ${error.message}`);
        throw new BadRequestException(
          `Failed to update room: ${error.message}`,
        );
      }

      this.logger.log(`Room updated successfully: ${id}`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error updating room: ${error.message}`);
      throw new BadRequestException("Failed to update room");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: string, _userId?: string): Promise<boolean> {
    try {
      // Verify room exists
      await this.findOne(id);

      // Soft delete: set is_active to false
      const { error } = await this.supabase
        .getClient()
        .from("rooms")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        this.logger.error(`Error deleting room ${id}: ${error.message}`);
        throw new BadRequestException(
          `Failed to delete room: ${error.message}`,
        );
      }

      this.logger.log(`Room soft deleted successfully: ${id}`);
      return true;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error deleting room: ${error.message}`);
      throw new BadRequestException("Failed to delete room");
    }
  }
}
