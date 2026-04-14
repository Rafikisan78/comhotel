import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { HotelsService } from "./hotels.service";
import { CreateHotelDto } from "./dto/create-hotel.dto";
import { UpdateHotelDto } from "./dto/update-hotel.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("hotels")
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  /**
   * POST /hotels - Créer un hôtel (hotel_owner ou admin)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHotelDto: CreateHotelDto, @Request() req: any) {
    const userId = req.user.sub; // ID du user depuis le JWT
    return this.hotelsService.create(createHotelDto, userId);
  }

  /**
   * GET /hotels - Liste des hôtels actifs (public)
   */
  @Get()
  async findAll() {
    return this.hotelsService.findAll();
  }

  /**
   * GET /hotels/my-hotels - Mes hôtels (hotel_owner)
   */
  @Get("my-hotels")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  async findMyHotels(@Request() req: any) {
    const userId = req.user.sub;
    return this.hotelsService.findByOwner(userId);
  }

  /**
   * GET /hotels/admin/all - Tous les hôtels (admin)
   */
  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async findAllForAdmin() {
    return this.hotelsService.findAllForAdmin();
  }

  /**
   * GET /hotels/search - Recherche avancée (public)
   */
  @Get("search")
  async search(
    @Query("q") q?: string,
    @Query("city") city?: string,
    @Query("country") country?: string,
    @Query("min_stars") min_stars?: number,
    @Query("max_stars") max_stars?: number,
    @Query("min_rating") min_rating?: number,
  ) {
    return this.hotelsService.search({
      q,
      city,
      country,
      min_stars: min_stars ? Number(min_stars) : undefined,
      max_stars: max_stars ? Number(max_stars) : undefined,
      min_rating: min_rating ? Number(min_rating) : undefined,
    });
  }

  /**
   * GET /hotels/search/city/:city - Recherche par ville (public)
   */
  @Get("search/city/:city")
  async searchByCity(@Param("city") city: string) {
    return this.hotelsService.searchByCity(city);
  }

  /**
   * GET /hotels/slug/:slug - Récupérer par slug (public)
   */
  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    const hotel = await this.hotelsService.findBySlug(slug);
    if (!hotel) {
      throw new NotFoundException("Hôtel introuvable");
    }
    return hotel;
  }

  /**
   * GET /hotels/:id - Récupérer un hôtel par ID (public)
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const hotel = await this.hotelsService.findOne(id);
    if (!hotel) {
      throw new NotFoundException("Hôtel introuvable");
    }
    return hotel;
  }

  /**
   * PATCH /hotels/:id - Mettre à jour un hôtel (hotel_owner ou admin)
   */
  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  async update(
    @Param("id") id: string,
    @Body() updateHotelDto: UpdateHotelDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.hotelsService.update(id, updateHotelDto, userId, userRole);
  }

  /**
   * DELETE /hotels/:id - Supprimer un hôtel (soft delete) (hotel_owner ou admin)
   */
  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string, @Request() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const result = await this.hotelsService.remove(id, userId, userRole);
    return { success: result, message: "Hôtel supprimé avec succès" };
  }
}
