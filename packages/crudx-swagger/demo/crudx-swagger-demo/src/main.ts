/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { CrudConfigService } from "@2amtech/crudx";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CrudxSwaggerRoutesFactory } from "../../../src/services/crudx.swagger.routes.factory";

CrudConfigService.load({
  query: {
    limit: 20,
  },
  routesFactory: CrudxSwaggerRoutesFactory,
});

import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle("Crudx Swagger")
    .setDescription("The Crudx-Swagger API Demo")
    .setVersion("1.0")
    .addTag("crudx-swagger")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
