import { Controller, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import * as request from "supertest";
import { v4 as uuidv4 } from "uuid";

import { Crud, CrudController, JoinOptions } from "../../src";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { RelationTestService } from "../__fixture__/service/relation.test.service";
import { TestingService } from "../__fixture__/service/testing-service.service";
import { RelationTest } from "../__fixture__/model/relation-test.model";
import { Exclude, Expose } from "class-transformer";
import { last } from "lodash";

const BASE_CRUD_OPTIONS = "/crud-options-test/";
const BASE_CRUD_PARSED = "/crud-options-parsed/";
const BASE_CRUD_SERIALIZE = "/crud-options-serialize/";

@Crud({
  model: {
    type: TestingModel,
  },
  params: {
    id: {
      primary: true,
      field: "id",
      type: "number",
    },
  },
  query: {
    join: <JoinOptions>{
      type: {
        allow: ["relationTest"],
      },
      relationTest: {
        eager: true,
      },
    },
    softDelete: true,
  },
  routes: {
    createOneBase: {
      returnShallow: true,
    },
    updateOneBase: {
      returnShallow: true,
    },
    replaceOneBase: {
      returnShallow: true,
    },
    deleteOneBase: {
      returnDeleted: true,
    },
  },
})
@Controller(BASE_CRUD_OPTIONS)
export class CrudOptionsController implements CrudController<TestingModel> {
  constructor(public service: TestingService) {}
}

@Crud({
  model: {
    type: TestingModel,
  },
  query: {
    alwaysPaginate: true,
    cache: 200,
    limit: 2,
    maxLimit: 2,
    sort: [
      {
        field: "id",
        order: "ASC",
      },
    ],
  },
  params: undefined,
})
@Controller(BASE_CRUD_PARSED)
export class CrudOptionsWithQueryParserTest
  implements CrudController<TestingModel>
{
  constructor(public service: TestingService) {}
}

class BaseModelDto {
  @Expose()
  readonly id: number | null = null;
  @Expose()
  readonly firstName: string | null = null;
  @Exclude()
  readonly lastName: string | null = null;
  @Exclude()
  readonly age: number | null = null;
  @Exclude()
  readonly relationTestId: number | null = null;
  @Exclude()
  readonly relationTest: RelationTest | null = null;
  @Exclude()
  readonly deletedAt: Date | null = null;
}

@Crud({
  model: {
    type: TestingModel,
  },
  serialize: {
    get: BaseModelDto,
    create: BaseModelDto,
  },
})
@Controller(BASE_CRUD_SERIALIZE)
export class CrudOptionsWithSerializeTest
  implements CrudController<TestingModel>
{
  constructor(public service: TestingService) {}
}

describe("Crud Decorators Test", () => {
  let app: INestApplication;
  let server: any;
  let service: TestingService;
  let relationTestService: RelationTestService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [
        CrudOptionsController,
        CrudOptionsWithQueryParserTest,
        CrudOptionsWithSerializeTest,
      ],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    server = app.getHttpServer();
    service = module.get<TestingService>(TestingService);
    relationTestService = module.get<RelationTestService>(RelationTestService);
  });

  afterAll(async () => {
    await relationTestService.repo.delete({});
    await service.repo.delete({});
    await server.close();
    await app.close();
  });

  it("Should create and return shallow result", async () => {
    const firstName = `${uuidv4()} fname`;

    return request(server)
      .post(BASE_CRUD_OPTIONS)
      .send({
        firstName: firstName,
        lastName: "testing-options",
        age: 20,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.firstName).toEqual(firstName);
      });
  });

  it("Should update and return shallow result", async () => {
    const model = await service.repo
      .create({
        firstName: "updatable",
        lastName: "lname",
        age: 20,
      })
      .save();

    return request(server)
      .put(`${BASE_CRUD_OPTIONS}${model.id}`)
      .send({
        firstName: "updated fname",
      })
      .expect(200)
      .expect((res) => {
        model.reload();

        expect(res.body.firstName).toEqual("updated fname");
        expect(res.body.lastName).toEqual("");
        expect(model.lastName).toEqual("lname");
      });
  });

  it("Should replace and return shallow result", async () => {
    const model = await service.repo
      .create({
        firstName: "updatable 2",
        lastName: "lname 2",
        age: 20,
      })
      .save();

    return request(server)
      .patch(`${BASE_CRUD_OPTIONS}${model.id}`)
      .send({
        firstName: "updated fname 2",
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toEqual("updated fname 2");
        expect(res.body.lastName).toEqual("");
      });
  });

  it("Should create relation and return allowed join", async () => {
    const relationTest = await relationTestService.repo
      .create({
        name: "relation test",
      })
      .save();

    const model = await service.repo
      .create({
        firstName: "with relation",
        lastName: "repo",
        age: 22,
        relationTestId: relationTest.id,
      })
      .save();

    return request(server)
      .get(`${BASE_CRUD_OPTIONS}${model.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toEqual("with relation");
        expect(res.body.relationTest.id).toEqual(relationTest.id);
        expect(res.body.relationTest.name).toEqual(relationTest.name);
      });
  });

  it("Should #recorver an entity", async () => {
    const model = await service.repo
      .create({
        firstName: "with relation",
        lastName: "repo",
        age: 22,
      })
      .save();

    const id = model.id;
    await model.softRemove();

    return request(server)
      .patch(`${BASE_CRUD_OPTIONS}${id}/recover`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(model.id);
        expect(res.body.firstName).toEqual(model.firstName);
        expect(res.body.lastName).toEqual(model.lastName);
        expect(res.body.age).toEqual(model.age);
        expect(res.body.deletedAt).toBeNull();
      });
  });

  it("Should load results from page two 2", async () => {
    await service.repo
      .create({
        firstName: "rep 1",
        lastName: "ln 1",
        age: 46,
      })
      .save();

    await service.repo
      .create({
        firstName: "rep 2",
        lastName: "ln 2",
        age: 46,
      })
      .save();

    await service.repo
      .create({
        firstName: "rep 3",
        lastName: "ln 3",
        age: 46,
      })
      .save();

    await service.repo
      .create({
        firstName: "rep 4",
        lastName: "ln 4",
        age: 46,
      })
      .save();

    return request(server)
      .get(`${BASE_CRUD_PARSED}?page=2&offset=1&limit=2`)
      .expect(200)
      .expect((res) => {
        expect(res.body.page).toEqual(2);
        expect(res.body.data).toBeDefined();
      });
  });

  it("Should return serialzied model at GET response", async () => {
    const model = await service.repo
      .create({
        firstName: "testinx w",
        lastName: "serialize",
        age: 59,
      })
      .save();

    return request(server)
      .get(`${BASE_CRUD_SERIALIZE}${model.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.firstName).toBeDefined();
        expect(res.body.lastName).toBeUndefined();
        expect(res.body.age).toBeUndefined();
        expect(res.body.relationTestId).toBeUndefined();
        expect(res.body.relationTest).toBeUndefined();
        expect(res.body.deletedAt).toBeUndefined();
      });
  });

  it("Should return serialzied model at POST response", async () => {
    return request(server)
      .post(`${BASE_CRUD_SERIALIZE}`)
      .send({
        firstName: "post test",
        lastName: "ln",
        age: 72,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.firstName).toBeDefined();
        expect(res.body.lastName).toBeUndefined();
        expect(res.body.age).toBeUndefined();
        expect(res.body.relationTestId).toBeUndefined();
        expect(res.body.relationTest).toBeUndefined();
        expect(res.body.deletedAt).toBeUndefined();
      });
  });

  it("Should return deleted", async () => {
    const model = await service.repo
      .create({
        firstName: "deleted",
        lastName: "ln deleted",
        age: 91,
      })
      .save();

    return request(server)
      .delete(`${BASE_CRUD_OPTIONS}${model.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toEqual("deleted");
        expect(res.body.lastName).toEqual("ln deleted");
        expect(res.body.age).toEqual(91);
      });
  });
});
