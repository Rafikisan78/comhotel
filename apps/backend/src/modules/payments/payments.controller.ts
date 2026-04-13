import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

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
}
