import { Controller, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClassTransformOptions } from "class-transformer";
import { useContainer } from "class-validator";
import * as request from "supertest";

import { Crud, CrudAuth, CrudController } from "../../src";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { TestingService } from "../__fixture__/service/testing-service.service";

const BASE_CONTROLLER = "/auto-controller-test/";

@Crud({
  model: {
    type: TestingModel,
  },
})
@CrudAuth({
  property: "id",
  classTransformOptions: (req: any): ClassTransformOptions => {
    return <ClassTransformOptions>{ req };
  },
  groups: (req: any): string[] => {
    return ["Read-One"];
  },
  // dummy auth no user
  filter: (req: any) => ({
    id: undefined,
  }),
  persist: (req: any) => ({
    id: undefined,
  }),
})
@Controller(BASE_CONTROLLER)
export class CrudAuthController implements CrudController<TestingModel> {
  constructor(public service: TestingService) {}
}

describe("#CrudAuth", () => {
  let app: INestApplication;
  let server: any;
  let service: TestingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [CrudAuthController],
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

  it("Should return emtpy body (no user authenticated", async () => {
    return request(server)
      .get(BASE_CONTROLLER)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(0);
      });
  });
});
