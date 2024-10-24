import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClaimController } from "./claim.controller";
import { Claim } from "./claim.entity";
import { ClaimService } from "./claim.service";

@Module({
  imports: [TypeOrmModule.forFeature([Claim])],
  providers: [ClaimService],
  controllers: [ClaimController],
  exports: [ClaimService],
})
export class ClaimModule {}
