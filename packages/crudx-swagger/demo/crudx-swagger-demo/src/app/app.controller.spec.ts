import { Test, TestingModule } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { AppModule } from "./app.module";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { useContainer } from "class-validator";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { databaseConfig } from "../database.config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

describe("AppController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        AppModule,
      ],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();
  });

  describe("getData", () => {
    it('should return 200', async () => {
      return request(app.getHttpServer())
        .get('/user')
        .expect(200);
    });
  });
});
