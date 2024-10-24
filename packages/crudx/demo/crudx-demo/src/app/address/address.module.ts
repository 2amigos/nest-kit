import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AddressType } from "./address-type.entity";
import { AddressTypeService } from "./address-type.service";
import { AddressController } from "./address.controller";
import { Address } from "./address.entity";
import { AddressService } from "./address.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Address]),
    TypeOrmModule.forFeature([AddressType]),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressTypeService],
  exports: [AddressService, AddressTypeService],
})
export class AddressModule {}
