import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create-intent")
  createPaymentIntent(
    @Request() req: any,
    @Body("bookingId") bookingId: string,
  ) {
    return this.paymentsService.createPaymentIntent(
      bookingId,
      req.user.userId || req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("confirm")
  confirmPayment(
    @Request() req: any,
    @Body("bookingId") bookingId: string,
  ) {
    return this.paymentsService.confirmPayment(
      bookingId,
      req.user.userId || req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("confirm-onsite")
  confirmOnsitePayment(
    @Request() req: any,
    @Body("bookingId") bookingId: string,
  ) {
    return this.paymentsService.confirmOnsitePayment(
      bookingId,
      req.user.userId || req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("create-supplement")
  createSupplementPayment(
    @Request() req: any,
    @Body("bookingId") bookingId: string,
    @Body("amount") amount: number,
  ) {
    return this.paymentsService.createSupplementPayment(
      bookingId,
      req.user.userId || req.user.sub,
      amount,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  @Patch(":bookingId/capture")
  capturePayment(
    @Request() req: any,
    @Param("bookingId") bookingId: string,
  ) {
    return this.paymentsService.capturePayment(
      bookingId,
      req.user.userId || req.user.sub,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  @Patch(":bookingId/cancel")
  cancelAuthorizedPayment(
    @Request() req: any,
    @Param("bookingId") bookingId: string,
  ) {
    return this.paymentsService.cancelAuthorizedPayment(
      bookingId,
      req.user.userId || req.user.sub,
      req.user.role,
    );
  }

  // ─── Cartes sauvegardées ──────────────────────────────────────────────────

  /**
   * GET /payments/saved-cards — Liste les cartes sauvegardées de l'utilisateur
   */
  @UseGuards(JwtAuthGuard)
  @Get("saved-cards")
  getSavedCards(@Request() req: any) {
    return this.paymentsService.getSavedCards(
      req.user.userId || req.user.sub,
    );
  }

  /**
   * POST /payments/save-card — Sauvegarde une carte après paiement réussi
   * Body: { paymentMethodId: string }
   */
  @UseGuards(JwtAuthGuard)
  @Post("save-card")
  saveCard(
    @Request() req: any,
    @Body("paymentMethodId") paymentMethodId: string,
  ) {
    return this.paymentsService.saveCard(
      req.user.userId || req.user.sub,
      paymentMethodId,
    );
  }

  /**
   * DELETE /payments/saved-cards/:paymentMethodId — Supprime une carte
   */
  @UseGuards(JwtAuthGuard)
  @Delete("saved-cards/:paymentMethodId")
  deleteSavedCard(
    @Request() req: any,
    @Param("paymentMethodId") paymentMethodId: string,
  ) {
    return this.paymentsService.deleteSavedCard(
      req.user.userId || req.user.sub,
      paymentMethodId,
    );
  }

  /**
   * PATCH /payments/saved-cards/:paymentMethodId/default — Carte par défaut
   */
  @UseGuards(JwtAuthGuard)
  @Patch("saved-cards/:paymentMethodId/default")
  setDefaultCard(
    @Request() req: any,
    @Param("paymentMethodId") paymentMethodId: string,
  ) {
    return this.paymentsService.setDefaultCard(
      req.user.userId || req.user.sub,
      paymentMethodId,
    );
  }
}
