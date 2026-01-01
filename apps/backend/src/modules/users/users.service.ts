import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashUtil } from '../../common/utils/hash.util';
import { SupabaseService } from '../../common/database/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Valider l'email
    if (!createUserDto.email || createUserDto.email.trim() === '') {
      throw new BadRequestException('L\'email est requis');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.findByEmail(createUserDto.email);
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
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: createUserDto.email,
        password_hash: hashedPassword,
        first_name: createUserDto.firstName,
        last_name: createUserDto.lastName,
        phone: createUserDto.phone,
        role: createUserDto.role || UserRole.GUEST,
      })
      .select()
      .single();

    if (error) {
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

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      password: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async findOne(id: string): Promise<User | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
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

  async findByEmail(email: string): Promise<User | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
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
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updateUserDto.firstName) updateData.first_name = updateUserDto.firstName;
    if (updateUserDto.lastName) updateData.last_name = updateUserDto.lastName;
    if (updateUserDto.phone) updateData.phone = updateUserDto.phone;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
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

  async remove(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('users').delete().eq('id', id);

    return !error;
  }
}
