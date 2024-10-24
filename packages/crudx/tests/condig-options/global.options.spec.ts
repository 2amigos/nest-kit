import { Controller, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import {
  CrudController,
  CrudGlobalConfig,
  ParamsNamesMap,
  RequestQueryBuilderOptions,
} from "../../src";
import { CrudConfigService } from "../../src";

const conf: CrudGlobalConfig = {
  query: {
    limit: 10,
    maxLimit: 10,
    cache: 2000,
    alwaysPaginate: true,
  },
  queryParser: <RequestQueryBuilderOptions>{
    delim: "|",
    delimStr: "s",
  },
  params: {
    id: {
      field: "id",
      type: "uuid",
      primary: true,
    },
  },
  routes: {
    exclude: ["createManyBase"],
    updateOneBase: {
      allowParamsOverride: true,
    },
    replaceOneBase: {
      allowParamsOverride: true,
    },
  },
  serialize: {
    get: false,
  },
};

CrudConfigService.load(conf);

import { Crud } from "../../src/decorators/crud.decorator";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestingService } from "../__fixture__/service/testing-service.service";
import { TestModule } from "../__fixture__/module/test-module.module";
import { useContainer } from "class-validator";

const BASE_CONTROLLER = "/config-options-test/";

@Crud({
  model: {
    type: TestingModel,
  },
})
@Controller(BASE_CONTROLLER)
class GlobalOptionsTestController implements CrudController<TestingModel> {
  constructor(public service: TestingService) {}
}

describe("#crud", () => {
  describe("#CrudConfigService", () => {
    let app: INestApplication;
    let server: any;
    let service: TestingService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TestModule],
        controllers: [GlobalOptionsTestController],
      }).compile();

      app = module.createNestApplication();
      useContainer(app, { fallbackOnErrors: true });
      await app.init();

      server = app.getHttpServer();
      service = module.get<TestingService>(TestingService);
    });

    afterAll(async () => {
      await server.close();
      await app.close();
    });

    it("should use global config", () => {
      return request(server)
        .get(BASE_CONTROLLER)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.count).toBeDefined();
          expect(res.body.page).toBeDefined();
          expect(res.body.pageCount).toBeDefined();
        });
    });
  });
});
