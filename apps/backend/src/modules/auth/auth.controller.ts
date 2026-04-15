import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { GoogleAuthGuard } from "../../common/guards/google-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  /**
   * GET /auth/google — Redirige vers la page de consentement Google
   */
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Le guard redirige automatiquement vers Google
  }

  /**
   * GET /auth/google/callback — Callback après authentification Google
   * Redirige vers le frontend avec le token JWT en query param
   */
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") ||
      "https://www.goungwamwe.com";

    // Rediriger vers le frontend avec les données en query params
    const params = new URLSearchParams({
      token: result.accessToken,
      userId: result.user.id,
      role: result.user.role,
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
