import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  createPaymentIntent(@Body() body: any) {
    return this.paymentsService.createPaymentIntent(body);
  }

  @Post('confirm')
  confirmPayment(@Body() body: any) {
    return this.paymentsService.confirmPayment(body);
  }
}
