import {
  Controller,
  Post,
  Patch,
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

  /**
   * POST /payments/create-supplement - Créer un PaymentIntent pour un supplément
   * (différence de prix après modification de réservation)
   */
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

  /**
   * PATCH /payments/:bookingId/capture - Capturer un paiement autorisé
   * Réservé au hotel_owner ou admin
   */
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

  /**
   * PATCH /payments/:bookingId/cancel - Annuler un paiement autorisé
   * Réservé au hotel_owner ou admin
   */
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
}
