import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { Base } from "./base.model";
import { BaseService } from "./base.service";
import { databaseConfig } from "./database.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.testing"],
      load: [databaseConfig],
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
    TypeOrmModule.forFeature([Base]),
  ],
  providers: [BaseService],
  exports: [BaseService],
})
export class BaseModule {}
