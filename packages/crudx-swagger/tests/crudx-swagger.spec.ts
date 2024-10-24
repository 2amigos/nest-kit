import { Crud, CrudController, Override, CrudRequest } from "@2amtech/crudx";
import { CrudConfigService } from "@2amtech/crudx";
import { Controller, INestApplication } from "@nestjs/common";
import {
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  ApiResponseOptions,
  DocumentBuilder,
  SwaggerModule,
} from "@nestjs/swagger";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import { get } from "lodash";
import * as request from "supertest";

import { CrudxSwaggerRoutesFactory, Swagger } from "../src";

import { Base } from "./__fixtures__/base.model";
import { BaseModule } from "./__fixtures__/base.module";
import { BaseService } from "./__fixtures__/base.service";

CrudConfigService.load({
  routesFactory: CrudxSwaggerRoutesFactory,
});

@Crud({
  model: {
    type: Base,
  },
  query: {
    softDelete: true,
  },
})
@Controller("/base/")
class BaseController implements CrudController<Base> {
  constructor(public service: BaseService) {}
}

@Crud({
  model: {
    type: Base,
  },
})
@Controller("/override/")
class OverideController implements CrudController<Base> {
  constructor(public service: BaseService) {}

  get base(): CrudController<Base> {
    return this;
  }

  @Override()
  @ApiResponse(<ApiResponseOptions>{
    status: 200,
    description: "Overriden description",
  })
  @ApiOperation(<ApiOperationOptions>{
    summary: "Overriden Summary",
  })
  async getOne(req: CrudRequest): Promise<Base> {
    return this.base.getOneBase!(req);
  }
}

describe("Crudx Swagger Test", () => {
  let app: INestApplication;
  let server: any;
  let model: Base;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BaseModule],
      controllers: [BaseController, OverideController],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });

    const config = new DocumentBuilder()
      .setTitle("Crudx Swagger")
      .setDescription("The Crudx-Swagger API Demo")
      .setVersion("1.0")
      .addTag("crudx-swagger")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    await app.init();

    server = app.getHttpServer();

    model = await Base.create(<Base>{
      name: "sample",
      age: 20,
    }).save();
  });

  afterAll(async () => {
    await Base.delete({});
    await server.close();
    await app.close();
  });

  describe("It should assert base routes are documented with default lib descriptions", () => {
    it("Should return 200", async () => {
      return request(server).get("/base").expect(200);
    });

    it("Should recover one", async () => {
      await model.softRemove();

      return request(server)
        .patch("/base/" + model.id + "/recover")
        .expect(200);
    });

    it("Should return 200 to overriden route", async () => {
      return request(server).get("/override/").expect(200);
    });

    it("Should check the docs", async () => {
      const mapping = Swagger.operationsMap("Base");
      const validSummaries: string[] = [];

      const summaryKeys = Object.keys(mapping);
      summaryKeys.forEach((key: string) =>
        validSummaries.push(get(mapping, key))
      );
      validSummaries.push("Overriden Summary");

      return await request(server)
        .get("/api/docs-json")
        .expect(200)
        .expect("Content-type", /json/)
        .expect((res) => {
          Object.keys(res.body.paths).forEach((path: string) => {
            const methods = Object.keys(res.body.paths[path]);

            methods.forEach((method: string) => {
              const summary = res.body.paths[path][method].summary;
              expect(validSummaries.includes(summary)).toBeTruthy();
            });
          });
        });
    });
  });
});
