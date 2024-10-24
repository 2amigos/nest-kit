import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { AuthModule } from "../app/auth/auth.module";
import { ClaimModule } from "../app/claims/claim.module";
import { ContractModule } from "../app/contract/contract.module";
import { Phone } from "../app/phone/phone.entity";
import { PhoneModule } from "../app/phone/phone.module";
import { User } from "../app/user/user.entity";
import { UserModule } from "../app/user/user.module";
import { databaseConfig } from "../config";
import { AddressModule } from "../app/address/address.module";

async function loadUserModule() {
  return {
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [databaseConfig],
        envFilePath: ['.env.testing'],
      }),
      TypeOrmModule.forRootAsync({
        useFactory: (config: ConfigService) =>
          <TypeOrmModuleOptions>{
            type: config.get<string>("database.type"),
            host: config.get<string>("database.host"),
            port: config.get<number>("database.port"),
            username: config.get<string>("database.username"),
            password: config.get<string>("database.password"),
            database: config.get<string>("database.database"),
            entities: config.get<string[]>("database.entities"),
            synchronize: config.get<boolean>("database.synchronize"),
          },
        inject: [ConfigService],
      }),
      UserModule,
      PhoneModule,
      AuthModule,
      ContractModule,
      ClaimModule,
      AddressModule,
    ],
  };
}

export { loadUserModule };
