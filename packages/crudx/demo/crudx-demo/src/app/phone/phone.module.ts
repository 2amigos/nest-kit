import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PhoneController } from "./phone.controller";
import { Phone } from "./phone.entity";
import { PhoneService } from "./phone.service";

@Module({
  imports: [TypeOrmModule.forFeature([Phone])],
  exports: [PhoneService],
  providers: [PhoneService],
  controllers: [PhoneController],
})
export class PhoneModule {}
