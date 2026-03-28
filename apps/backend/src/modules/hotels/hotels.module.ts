import { Module } from "@nestjs/common";
import { HotelsController } from "./hotels.controller";
import { HotelsService } from "./hotels.service";
import { SupabaseService } from "../../common/database/supabase.service";

@Module({
  controllers: [HotelsController],
  providers: [HotelsService, SupabaseService],
  exports: [HotelsService],
})
export class HotelsModule {}
