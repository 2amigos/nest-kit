import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { databaseConfig } from "../config";

import { AddressModule } from "./address/address.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ClaimModule } from "./claims/claim.module";
import { ContractModule } from "./contract/contract.module";
import { PhoneModule } from "./phone/phone.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.testing']
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
