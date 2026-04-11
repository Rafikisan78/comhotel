import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { CreateHotelDto } from "./dto/create-hotel.dto";
import { UpdateHotelDto } from "./dto/update-hotel.dto";
import { Hotel } from "./entities/hotel.entity";
import { SupabaseService } from "../../common/database/supabase.service";

@Injectable()
export class HotelsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Méthode utilitaire pour mapper les données Supabase vers Hotel entity
  private mapRowToHotel(row: any): Hotel {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      description_en: row.description_en,
      description_es: row.description_es,
      description_de: row.description_de,
      short_description: row.short_description,
      address: row.address,
      city: row.city,
      zip_code: row.zip_code,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      phone: row.phone,
      email: row.email,
      website: row.website,
      check_in_time: row.check_in_time,
      check_out_time: row.check_out_time,
      reception_24h: row.reception_24h,
      reception_hours: row.reception_hours,
      arrival_instructions: row.arrival_instructions,
      star_rating: row.stars,
      chain_name: row.chain_name,
      is_independent: row.is_independent,
      labels: row.labels,
      certifications: row.certifications,
      images: row.images,
      cover_image: row.cover_image,
      video_url: row.video_url,
      virtual_tour_url: row.virtual_tour_url,
      amenities: row.amenities,
      slug: row.slug,
      is_active: row.is_active,
      is_featured: row.is_featured,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : 0,
      total_reviews: row.total_reviews || 0,
      commission_rate: row.commission_rate
        ? parseFloat(row.commission_rate)
        : 15.0,
      owner_id: row.owner_id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  // Générer un slug unique à partir du nom
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
      .replace(/[^a-z0-9\s-]/g, "") // Retirer les caractères spéciaux
      .replace(/\s+/g, "-") // Remplacer espaces par tirets
      .replace(/-+/g, "-") // Remplacer multiples tirets par un seul
      .replace(/^-|-$/g, ""); // Retirer tirets au début/fin
  }

  // Créer un nouvel hôtel
  async create(
    createHotelDto: CreateHotelDto,
    ownerId: string,
  ): Promise<Hotel> {
    const supabase = this.supabaseService.getClient();

    // Générer un slug si non fourni
    const slug = createHotelDto.slug || this.generateSlug(createHotelDto.name);

    // Vérifier si le slug existe déjà
    const { data: existingHotel } = await supabase
      .from("hotels")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingHotel) {
      throw new BadRequestException(
        `Un hôtel avec le slug "${slug}" existe déjà`,
      );
    }

    // Créer l'hôtel
    // Mapper star_rating -> stars pour Supabase
    const { star_rating, ...restDto } = createHotelDto;

    const { data, error } = await supabase
      .from("hotels")
      .insert({
        ...restDto,
        stars: star_rating,
        slug,
        owner_id: ownerId,
        is_active: createHotelDto.is_active ?? true,
        is_independent: createHotelDto.is_independent ?? true,
        reception_24h: createHotelDto.reception_24h ?? false,
        is_featured: createHotelDto.is_featured ?? false,
        average_rating: 0,
        total_reviews: 0,
        commission_rate: createHotelDto.commission_rate ?? 15.0,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la création de l'hôtel: ${error.message}`,
      );
    }

    return this.mapRowToHotel(data);
  }

  // Récupérer tous les hôtels actifs qui ont des chambres (pour les clients)
  async findAll(): Promise<Hotel[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*, rooms!inner(id)")
      .eq("is_active", true)
      .order("average_rating", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la récupération des hôtels: ${error.message}`,
      );
    }

    return data.map((row) => this.mapRowToHotel(row));
  }

  // Récupérer tous les hôtels d'un propriétaire (pour hotel_owner)
  async findByOwner(ownerId: string): Promise<Hotel[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la récupération des hôtels: ${error.message}`,
      );
    }

    return data.map((row) => this.mapRowToHotel(row));
  }

  // Récupérer tous les hôtels (pour admin)
  async findAllForAdmin(): Promise<Hotel[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la récupération des hôtels: ${error.message}`,
      );
    }

    return data.map((row) => this.mapRowToHotel(row));
  }

  // Récupérer un hôtel par ID
  async findOne(id: string): Promise<Hotel | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToHotel(data);
  }

  // Récupérer un hôtel par slug (pour page publique)
  async findBySlug(slug: string): Promise<Hotel | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToHotel(data);
  }

  // Mettre à jour un hôtel
  async update(
    id: string,
    updateHotelDto: UpdateHotelDto,
    userId: string,
    userRole: string,
  ): Promise<Hotel> {
    const supabase = this.supabaseService.getClient();

    // Vérifier que l'hôtel existe
    const existingHotel = await this.findOne(id);
    if (!existingHotel) {
      throw new NotFoundException("Hôtel introuvable");
    }

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== "admin" && existingHotel.owner_id !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cet hôtel",
      );
    }

    // Si le nom change, régénérer le slug
    let slug = updateHotelDto.slug;
    if (updateHotelDto.name && !updateHotelDto.slug) {
      slug = this.generateSlug(updateHotelDto.name);

      // Vérifier si le nouveau slug existe déjà (et n'est pas le même hôtel)
      const { data: existingWithSlug } = await supabase
        .from("hotels")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existingWithSlug) {
        // Ajouter un suffixe unique
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Mapper star_rating -> stars pour Supabase
    const { star_rating, ...restDto } = updateHotelDto;
    const updateData: any = {
      ...restDto,
      ...(star_rating !== undefined && { stars: star_rating }),
    };

    if (slug) {
      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from("hotels")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la mise à jour de l'hôtel: ${error.message}`,
      );
    }

    return this.mapRowToHotel(data);
  }

  // Supprimer un hôtel (soft delete)
  async remove(id: string, userId: string, userRole: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    // Vérifier que l'hôtel existe
    const existingHotel = await this.findOne(id);
    if (!existingHotel) {
      throw new NotFoundException("Hôtel introuvable");
    }

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== "admin" && existingHotel.owner_id !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer cet hôtel",
      );
    }

    // Soft delete: marquer comme inactif
    const { error } = await supabase
      .from("hotels")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la suppression de l'hôtel: ${error.message}`,
      );
    }

    return true;
  }

  // Rechercher des hôtels par ville
  async searchByCity(city: string): Promise<Hotel[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("is_active", true)
      .ilike("city", `%${city}%`)
      .order("average_rating", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la recherche: ${error.message}`,
      );
    }

    return data.map((row) => this.mapRowToHotel(row));
  }

  // Rechercher des hôtels avec filtres (uniquement ceux qui ont des chambres)
  async search(filters: {
    q?: string;
    city?: string;
    country?: string;
    min_stars?: number;
    max_stars?: number;
    min_rating?: number;
  }): Promise<Hotel[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from("hotels")
      .select("*, rooms!inner(id)")
      .eq("is_active", true);

    // Recherche textuelle générale (nom, ville, pays, description)
    if (filters.q) {
      const term = `%${filters.q}%`;
      query = query.or(
        `name.ilike.${term},city.ilike.${term},country.ilike.${term},description.ilike.${term},short_description.ilike.${term}`,
      );
    }

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
    }

    if (filters.min_stars) {
      query = query.gte("stars", filters.min_stars);
    }

    if (filters.max_stars) {
      query = query.lte("stars", filters.max_stars);
    }

    if (filters.min_rating) {
      query = query.gte("average_rating", filters.min_rating);
    }

    const { data, error } = await query.order("average_rating", {
      ascending: false,
    });

    if (error) {
      throw new BadRequestException(
        `Erreur lors de la recherche: ${error.message}`,
      );
    }

    return data.map((row) => this.mapRowToHotel(row));
  }
}
