import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import { ChatbotService } from "./chatbot.service";

/**
 * Contrôleur du chatbot sécurisé
 *
 * Endpoints publics pour la recherche d'hôtels via chat
 * Toutes les entrées sont validées et sanitisées par le service
 */

interface ChatMessageDto {
  message: string;
  sessionId: string;
}

@Controller("chatbot")
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * Envoie un message au chatbot
   * POST /chatbot/message
   */
  @Post("message")
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() body: ChatMessageDto, @Req() req: Request) {
    // Validation basique des entrées
    if (!body.message || typeof body.message !== "string") {
      throw new BadRequestException("Le message est requis");
    }

    if (!body.sessionId || typeof body.sessionId !== "string") {
      throw new BadRequestException("L'identifiant de session est requis");
    }

    // Validation du format de sessionId (UUID ou chaîne alphanumérique)
    const sessionIdPattern = /^[a-zA-Z0-9\-]{8,64}$/;
    if (!sessionIdPattern.test(body.sessionId)) {
      throw new BadRequestException("Format d'identifiant de session invalide");
    }

    // Récupération de l'IP client pour le logging de sécurité
    const clientIp = this.getClientIp(req);

    // Traitement du message par le service sécurisé
    return this.chatbotService.processMessage(
      body.sessionId,
      body.message,
      clientIp,
    );
  }

  /**
   * Récupère l'historique de conversation
   * GET /chatbot/history/:sessionId
   */
  @Get("history/:sessionId")
  getHistory(@Param("sessionId") sessionId: string) {
    // Validation du sessionId
    const sessionIdPattern = /^[a-zA-Z0-9\-]{8,64}$/;
    if (!sessionIdPattern.test(sessionId)) {
      throw new BadRequestException("Format d'identifiant de session invalide");
    }

    const history = this.chatbotService.getConversationHistory(sessionId);

    return {
      sessionId,
      messages: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  }

  /**
   * Réinitialise une session de chat
   * DELETE /chatbot/session/:sessionId
   */
  @Delete("session/:sessionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  resetSession(@Param("sessionId") sessionId: string) {
    // Validation du sessionId
    const sessionIdPattern = /^[a-zA-Z0-9\-]{8,64}$/;
    if (!sessionIdPattern.test(sessionId)) {
      throw new BadRequestException("Format d'identifiant de session invalide");
    }

    this.chatbotService.resetSession(sessionId);
  }

  /**
   * Endpoint de santé pour le chatbot
   * GET /chatbot/health
   */
  @Get("health")
  health() {
    return {
      status: "ok",
      service: "chatbot",
      timestamp: new Date().toISOString(),
      security: {
        owasp: "LLM Top 10 2026",
        mitre: "ATLAS Framework",
      },
    };
  }

  /**
   * Récupère l'adresse IP du client
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    return req.ip || req.socket?.remoteAddress || "unknown";
  }
}
