import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { SupabaseService } from "@/common/database/supabase.service";

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, SupabaseService],
  exports: [RoomsService],
})
export class RoomsModule {}
