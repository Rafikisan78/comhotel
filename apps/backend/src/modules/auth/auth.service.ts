import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HashUtil } from '../../common/utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Valider les données
    if (!createUserDto.email || !createUserDto.password) {
      throw new BadRequestException('Email et mot de passe requis');
    }

    if (!createUserDto.firstName || !createUserDto.lastName) {
      throw new BadRequestException('Prénom et nom requis');
    }

    // Créer l'utilisateur (le hash du mot de passe est géré dans UsersService)
    const user = await this.usersService.create(createUserDto);

    // Générer le token JWT
    const accessToken = this.generateToken(user.id, user.email);

    return {
      user,
      accessToken,
    };
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(credentials.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await HashUtil.compare(
      credentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);

    // Exclure le mot de passe de la réponse
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
