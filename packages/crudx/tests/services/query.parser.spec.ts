import { Controller, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import * as request from "supertest";

import {
  CreateQueryParams,
  Crud,
  CrudAuth,
  CrudController,
  QueryBuilderService,
  QueryFilter,
  QueryFilterOption,
} from "../../src";
import { UuidModel } from "../__fixture__/model/uuid.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { UuidService } from "../__fixture__/service/uuid.service";
import { QueryBuilder } from "typeorm";

const BASE_CRUD_OPTIONS = "/crud-options-test/";
const BASE_QUERY_FILTER_SAVE = "/crud-options-test/:age/with-filter";

@Crud({
  model: {
    type: UuidModel,
  },
  params: {
    id: {
      primary: true,
      field: "id",
      type: "uuid",
    },
  },
})
@Controller(BASE_CRUD_OPTIONS)
class CrudOptionsController implements CrudController<UuidModel> {
  constructor(public service: UuidService) { }
}

@Crud({
  model: {
    type: UuidModel,
  },
  params: {
    id: {
      primary: true,
      field: "id",
      type: "uuid",
    },
    age: {
      primary: false,
      field: "age",
      type: "number",
    },
  },
})
@Controller(BASE_QUERY_FILTER_SAVE)
class CrudQueryFilterController implements CrudController<UuidModel> {
  constructor(public service: UuidService) { }
}

describe("#QueryParser test", () => {
  let app: INestApplication;
  let server: any;
  let service: UuidService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [CrudOptionsController, CrudQueryFilterController],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    server = app.getHttpServer();
    service = module.get<UuidService>(UuidService);
  });

  afterAll(async () => {
    await service.repo.createQueryBuilder().delete().execute();
    await server.close();
    await app.close();
  });

  it("Should return 200 Ok", async () => {
    const uuidModel = await service.repo
      .create({
        name: "sample",
        age: 10,
      })
      .save();

    await uuidModel.reload();

    return request(server)
      .get(`${BASE_CRUD_OPTIONS}${uuidModel.id}`)
      .expect(200);
  });

  it("Should assign value from filter to given field `age = 22`", () => {
    const path = BASE_QUERY_FILTER_SAVE.replace(":age", "22");

    return request(server)
      .post(path)
      .send({
        name: "sample 22",
        age: 10,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.age).toEqual(22);
      });
  });
});
