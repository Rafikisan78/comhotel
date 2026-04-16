import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { StripeService } from "./stripe/stripe.service";
import { SupabaseService } from "../../common/database/supabase.service";
import { UsersService } from "../users/users.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, SupabaseService, UsersService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
