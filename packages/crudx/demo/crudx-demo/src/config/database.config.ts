import { registerAs } from "@nestjs/config";

import { AddressType } from "../app/address/address-type.entity";
import { Address } from "../app/address/address.entity";
import { Claim } from "../app/claims/claim.entity";
import { Contract } from "../app/contract/contract.entity";
import { Phone } from "../app/phone/phone.entity";
import { User } from "../app/user/user.entity";

export const databaseConfig = registerAs("database", () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Phone, Contract, Claim, Address, AddressType],
  synchronize: true,
  autoLoadEntities: true,
  encoding: process.env.DB_CHARSET,
}));
