import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { HashUtil } from "../../common/utils/hash.util";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Valider les données
    if (!createUserDto.email || !createUserDto.password) {
      throw new BadRequestException("Email et mot de passe requis");
    }

    if (!createUserDto.firstName || !createUserDto.lastName) {
      throw new BadRequestException("Prénom et nom requis");
    }

    // Créer l'utilisateur (le hash du mot de passe est géré dans UsersService)
    const user = await this.usersService.create(createUserDto);

    // Générer le token JWT avec le rôle
    const accessToken = this.generateToken(user.id, user.email, user.role);

    return {
      user,
      accessToken,
    };
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(credentials.email);

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException("Account is inactive");
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await HashUtil.compare(
      credentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.email, user.role);

    // Exclure le mot de passe de la réponse
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  /**
   * Valider ou créer un utilisateur OAuth (Google).
   * Si l'utilisateur existe déjà (même email), on le connecte.
   * Sinon, on crée un nouveau compte sans mot de passe.
   */
  async validateOAuthUser(oauthData: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    googleId: string;
  }) {
    const normalizedEmail = oauthData.email.toLowerCase().trim();

    // Chercher un utilisateur existant avec cet email
    let user = await this.usersService.findByEmail(normalizedEmail);

    if (user) {
      // L'utilisateur existe déjà — on le connecte directement
      // Mettre à jour l'avatar si absent
      if (!user.avatarUrl && oauthData.avatarUrl) {
        await this.usersService.update(user.id, {
          avatarUrl: oauthData.avatarUrl,
        });
      }
    } else {
      // Créer un nouvel utilisateur OAuth (sans mot de passe)
      user = await this.usersService.createOAuthUser({
        email: normalizedEmail,
        firstName: oauthData.firstName,
        lastName: oauthData.lastName,
        avatarUrl: oauthData.avatarUrl || undefined,
      });
    }

    const accessToken = this.generateToken(user.id, user.email, user.role);

    // Exclure le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
