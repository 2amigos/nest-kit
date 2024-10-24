import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { databaseConfig } from "../database.config";
import { User } from "./user.model";

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
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
