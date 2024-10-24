/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import {
  CrudConfigService,
  QueryBuilderService,
  RequestQueryBuilderOptions,
} from "@2amtech/crudx";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";

import { UserModule } from "./app/user/user.module";

/*
 * Default configuration for CRUD, can be overridden in each module.
 * Must be loaded before importing AppModule.
 */
CrudConfigService.load({
  query: {
    limit: 25,
    cache: 2000,
    alwaysPaginate: true,
  },
  routes: {
    updateOneBase: {
      allowParamsOverride: true,
    },
    deleteOneBase: {
      returnDeleted: true,
    },
  },
});

QueryBuilderService.setOptions(<RequestQueryBuilderOptions>{
  paramNamesMap: {
    search: "s",
    join: ["join[]", "join", "include[]", "include"],
  },
});

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "v1";
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  useContainer(app.select(UserModule), { fallbackOnErrors: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
