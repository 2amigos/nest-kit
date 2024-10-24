import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { databaseConfig } from "../database.config";
import { IdentityType } from "../model/identity-type.model";
import { Nested } from "../model/nested.model";
import { RelationTest } from "../model/relation-test.model";
import { TestingModel } from "../model/testing-model.model";
import { UuidModel } from "../model/uuid.model";
import { RelationTestService } from "../service/relation.test.service";
import { TestingService } from "../service/testing-service.service";
import { UuidService } from "../service/uuid.service";

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
    TypeOrmModule.forFeature([
      TestingModel,
      RelationTest,
      Nested,
      IdentityType,
      UuidModel,
    ]),
  ],
  providers: [TestingService, RelationTestService, UuidService],
  exports: [TestingService, RelationTestService, UuidService],
})
export class TestModule {}
