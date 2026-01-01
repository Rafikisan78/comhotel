import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashUtil } from '../../common/utils/hash.util';
import { SupabaseService } from '../../common/database/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Méthode utilitaire pour exclure le mot de passe des réponses
  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Valider l'email
    if (!createUserDto.email || createUserDto.email.trim() === '') {
      throw new BadRequestException('L\'email est requis');
    }

    // SÉCURITÉ: Normaliser l'email (lowercase + trim) pour éviter les doublons
    const normalizedEmail = createUserDto.email.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Valider le mot de passe
    if (!createUserDto.password || createUserDto.password.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher le mot de passe
    const hashedPassword = await HashUtil.hash(createUserDto.password);

    // Créer l'utilisateur dans Supabase
    // SÉCURITÉ: Le rôle est forcé à 'guest' pour empêcher l'injection de rôle
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash: hashedPassword,
        first_name: createUserDto.firstName,
        last_name: createUserDto.lastName,
        phone: createUserDto.phone,
        role: UserRole.GUEST,
      })
      .select()
      .single();

    if (error) {
      // SÉCURITÉ: Gérer proprement l'erreur de duplication (race condition)
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
      throw new BadRequestException(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }

    // Retourner l'utilisateur sans le mot de passe
    const user: User = {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findAll(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      throw new BadRequestException(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }

    return data.map((row) => {
      const user: User = {
        id: row.id,
        email: row.email,
        password: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        role: row.role,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
      return this.excludePassword(user) as User;
    });
  }

  async findOne(id: string): Promise<User | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const user: User = {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return this.excludePassword(user) as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    // SÉCURITÉ: Normaliser l'email pour la recherche
    const normalizedEmail = email.toLowerCase().trim();

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Vérifier que l'utilisateur existe
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    const supabase = this.supabaseService.getClient();
    const updateData: any = {};

    // Gérer la mise à jour de l'email avec normalisation et vérification unicité
    if (updateUserDto.email) {
      const normalizedEmail = updateUserDto.email.toLowerCase().trim();

      // Vérifier que le nouvel email n'est pas déjà utilisé par un autre utilisateur
      const userWithEmail = await this.findByEmail(normalizedEmail);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      updateData.email = normalizedEmail;
    }

    // Gérer la mise à jour du mot de passe avec hashage
    if (updateUserDto.password) {
      if (updateUserDto.password.length < 8) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
      }
      updateData.password_hash = await HashUtil.hash(updateUserDto.password);
    }

    // Gérer les autres champs
    if (updateUserDto.firstName !== undefined) updateData.first_name = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) updateData.last_name = updateUserDto.lastName;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;

    // Si aucun champ à mettre à jour
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Aucune donnée à mettre à jour');
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Gérer l'erreur de duplication d'email
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }

    if (!data) {
      throw new BadRequestException('Échec de la mise à jour');
    }

    const user: User = {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return this.excludePassword(user) as User;
  }

  async remove(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('users').delete().eq('id', id);

    return !error;
  }

  /**
   * Soft delete: Mark user as deleted without removing from database
   * @param id - User ID to delete
   * @param deletedBy - ID of admin performing the deletion
   */
  async softDelete(id: string, deletedBy: string): Promise<User> {
    // Vérifier que l'utilisateur existe et n'est pas déjà supprimé
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    const supabase = this.supabaseService.getClient();

    // Vérifier si déjà supprimé
    const { data: checkData } = await supabase
      .from('users')
      .select('deleted_at')
      .eq('id', id)
      .single();

    if (checkData?.deleted_at) {
      throw new BadRequestException('Cet utilisateur est déjà supprimé');
    }

    // Soft delete: mettre à jour deleted_at et deleted_by
    const { data, error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(`Erreur lors de la suppression: ${error?.message}`);
    }

    const user: User = {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return this.excludePassword(user) as User;
  }

  /**
   * Restore a soft-deleted user
   * @param id - User ID to restore
   */
  async restore(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Vérifier que l'utilisateur existe et est bien supprimé
    const { data: checkData } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (!checkData) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (!checkData.deleted_at) {
      throw new BadRequestException('Cet utilisateur n\'est pas supprimé');
    }

    // Restaurer: remettre deleted_at et deleted_by à NULL
    const { data, error } = await supabase
      .from('users')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(`Erreur lors de la restauration: ${error?.message}`);
    }

    const user: User = {
      id: data.id,
      email: data.email,
      password: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return this.excludePassword(user) as User;
  }

  /**
   * Bulk soft delete multiple users
   * @param ids - Array of user IDs to delete
   * @param deletedBy - ID of admin performing the deletion
   */
  async bulkSoftDelete(ids: string[], deletedBy: string): Promise<{ deleted: number; errors: string[] }> {
    const supabase = this.supabaseService.getClient();
    const errors: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      try {
        // Vérifier que ce n'est pas l'admin lui-même
        if (id === deletedBy) {
          errors.push(`${id}: Impossible de supprimer votre propre compte`);
          continue;
        }

        // Vérifier que l'utilisateur existe
        const { data: userData } = await supabase
          .from('users')
          .select('role, deleted_at')
          .eq('id', id)
          .single();

        if (!userData) {
          errors.push(`${id}: Utilisateur introuvable`);
          continue;
        }

        if (userData.deleted_at) {
          errors.push(`${id}: Déjà supprimé`);
          continue;
        }

        if (userData.role === 'admin') {
          errors.push(`${id}: Impossible de supprimer un autre administrateur`);
          continue;
        }

        // Soft delete
        const { error } = await supabase
          .from('users')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: deletedBy,
          })
          .eq('id', id);

        if (error) {
          errors.push(`${id}: ${error.message}`);
        } else {
          deleted++;
        }
      } catch (err: any) {
        errors.push(`${id}: ${err.message}`);
      }
    }

    return { deleted, errors };
  }

  /**
   * Get all users including soft-deleted ones (admin only)
   */
  async findAllIncludingDeleted(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Erreur lors de la récupération: ${error.message}`);
    }

    return data.map((row) => {
      const user: User = {
        id: row.id,
        email: row.email,
        password: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        role: row.role,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
      return this.excludePassword(user) as User;
    });
  }
}
