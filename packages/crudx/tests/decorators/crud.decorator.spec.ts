import {
  BadRequestException,
  Controller,
  INestApplication,
  UseGuards,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import * as request from "supertest";

import {
  Action,
  CreateManyDto,
  Crud,
  CrudActions,
  CrudAuth,
  CrudController,
  CrudRequest,
  Feature,
  GetManyDefaultResponse,
  Override,
  ParsedBody,
  ParsedRequest,
} from "../../src";
import { ACLGuard } from "../__fixture__/guards/acl.guard";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { TestingService } from "../__fixture__/service/testing-service.service";

const BASE_CRUD_URL = "/test-base-decorator/";
const AUTH_CRUD_URL = "/test-auth-decorator/";
const GUARD_CONTROLLER = "/test-guard-decorator";
const OVERRIDE_CRUD_URL = "/test-override-decorator/";
const BASE_EXCLUDE_CONTROLLER = "/test-exclude-routes/";

@Crud({
  model: {
    type: TestingModel,
  },
})
@Controller(BASE_CRUD_URL)
class CrudBaseControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

@CrudAuth({
  property: "testingModel",
  filter: (model: any) => ({
    id: 1,
  }),
})
@Crud({
  model: {
    type: TestingModel,
  },
  routes: {
    only: ["getOneBase"],
  },
  params: {
    id: {
      primary: true,
      disabled: true,
    },
  },
})
@Feature("readMe")
@Action(CrudActions.ReadOne)
@UseGuards(ACLGuard)
@Controller(AUTH_CRUD_URL)
class CrudAuthControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

@Crud({
  model: {
    type: TestingModel,
  },
})
@UseGuards(ACLGuard)
@Controller(GUARD_CONTROLLER)
class CrudGuardControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

interface WithExtraProp extends TestingModel {
  customProp: string | null;
}

@Crud({
  model: {
    type: TestingModel,
  },
  routes: {
    only: ["getOneBase", "createOneBase", "createManyBase", "getManyBase"],
  },
})
@Controller(OVERRIDE_CRUD_URL)
class CrudOverrideControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }

  get base(): CrudController<TestingModel> {
    return this;
  }

  @Override("getOneBase")
  public overrideDecorator(@ParsedRequest() req: CrudRequest) {
    return { message: "route overriden!" };
  }

  @Override()
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: TestingModel
  ) {
    this.service.repo.create(dto);
    return { message: "overriden-body" };
  }

  @Override("createManyBase")
  async createManyOverriden(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<TestingModel>
  ): Promise<WithExtraProp[]> {
    const response = <WithExtraProp[]>(
      await Promise.resolve(this.base.createManyBase!(req, dto))
    );

    response.forEach((res) => {
      res["customProp"] = "extra prop added!";
    });

    return response;
  }

  @Override("getManyBase")
  async overrideAll(
    @ParsedRequest() req: CrudRequest
  ): Promise<GetManyDefaultResponse<WithExtraProp> | WithExtraProp[]> {
    const response = <WithExtraProp[]>(
      await Promise.resolve(this.base.getManyBase!(req))
    );

    response.forEach((res) => {
      res.customProp = "extra prop added!";
    });

    return response;
  }
}

@Crud({
  model: {
    type: TestingModel,
  },
  routes: {
    exclude: ["getManyBase"],
  },
})
@Controller(BASE_EXCLUDE_CONTROLLER)
class CrudExcludeRouteControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }

  get base(): CrudController<TestingModel> {
    return this;
  }
}

describe("Crud Decorators Test", () => {
  let app: INestApplication;
  let server: any;
  let model: TestingModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [
        CrudBaseControllerTest,
        CrudAuthControllerTest,
        CrudGuardControllerTest,
        CrudOverrideControllerTest,
      ],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    server = app.getHttpServer();

    model = await TestingModel.create(<TestingModel>{
      id: 1,
      firstName: "FName1",
      lastName: "LName1",
      age: 20,
    }).save();
  });

  afterAll(async () => {
    await TestingModel.createQueryBuilder().delete().execute();
    await server.close();
    await app.close();
  });

  describe("#Crud Base", () => {
    it("#getMany - Should return 200", () => {
      return request(server).get(BASE_CRUD_URL).expect(200);
    });

    it("#getOne - Should return 200", async () => {
      const testModel = await TestingModel.create(<TestingModel>{
        firstName: "FName xx",
        lastName: "LName xx",
        age: 20,
      }).save();

      return request(server)
        .get(`${BASE_CRUD_URL}${testModel.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id === testModel.id);
        });
    });

    it("#getOne - Should return 404", () => {
      return request(server).get(`${BASE_CRUD_URL}1999`).expect(404);
    });

    it("#createOne - Should return 201", () => {
      return request(server)
        .post(BASE_CRUD_URL)
        .send({
          id: 99,
          firstName: "FName99",
          lastName: "LName99",
          age: 99,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toEqual(99);
        });
    });

    it("#createMany - Should return 201", () => {
      const bulk = [
        {
          id: 100,
          firstName: "FName100",
          lastName: "LName100",
          age: 100,
        },
        {
          id: 101,
          firstName: "FName101",
          lastName: "LName101",
          age: 101,
        },
      ];

      return request(server)
        .post(`${BASE_CRUD_URL}bulk`)
        .send({
          bulk: bulk,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body[0].id).toEqual(bulk[0].id);
          expect(res.body[1].id).toEqual(bulk[1].id);
        });
    });

    it("#putOne - Should return 200", async () => {
      return request(server)
        .put(`${BASE_CRUD_URL}${model.id}`)
        .send({
          firstName: "FName1-updated",
          lastName: "ln",
          age: 21,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toEqual("FName1-updated");
          expect(res.body.age).toEqual(21);
        });
    });

    it("#patchOne - Should return 200", () => {
      return request(server)
        .patch(`${BASE_CRUD_URL}${model.id}`)
        .send({
          id: model.id,
          firstName: "FName1-updated2",
          lastName: "ln",
          age: 22,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toEqual("FName1-updated2");
          expect(res.body.lastName).toEqual("ln");
          expect(res.body.age).toEqual(22);
        });
    });

    it("#deleteOne - Should return 200 and empty body", async () => {
      const deleteable = await TestingModel.create({
        firstName: "deletable",
        lastName: "delete it",
        age: 9,
      }).save();

      return request(server)
        .delete(`${BASE_CRUD_URL}${deleteable.id}`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toHaveLength(0);
        });
    });
  });

  describe("#Crud Auth", () => {
    it("Should return the model assigned to auth decorator", () => {
      model.reload();

      return request(server)
        .get(AUTH_CRUD_URL)
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toEqual(model.firstName);
          expect(res.body.lastName).toEqual(model.lastName);
          expect(res.body.age).toEqual(model.age);
        });
    });

    it("Should throw Unauthorized", () => {
      return request(server).get(GUARD_CONTROLLER).expect(401);
    });
  });

  describe("#Crud Routes Override", () => {
    it("Should override getOneBase", () => {
      return request(server)
        .get(`${OVERRIDE_CRUD_URL}${model.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual("route overriden!");
        });
    });

    it("Should override createOneBase", () => {
      return request(server)
        .post(OVERRIDE_CRUD_URL)
        .send({
          firstName: "override1",
          lastName: "ln",
          age: "25",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toEqual("overriden-body");
        });
    });

    it("Should override getManyBase", () => {
      return request(server)
        .get(OVERRIDE_CRUD_URL)
        .expect(200)
        .expect((res) => {
          res.body.forEach((body: any) => {
            expect(body.customProp).toBeDefined();
            expect(body.customProp).toEqual("extra prop added!");
          });
        });
    });

    it("Should override createManyBase", () => {
      return request(server)
        .post(`${OVERRIDE_CRUD_URL}bulk`)
        .send({
          bulk: [
            {
              firstName: "first",
              lastName: "last",
              age: 19,
            },
            {
              firstName: "first 2",
              lastName: "last 2",
              age: 21,
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          res.body.forEach((body: any) => {
            expect(body.customProp).toBeDefined();
            expect(body.customProp).toEqual("extra prop added!");
          });
        });
    });
  });

  it("#Crud Should return 404 for get many", () => {
    return request(server).get(BASE_EXCLUDE_CONTROLLER).expect(404);
  });

  it("Should throw bad request exception", () => {
    return request(server).get(`${BASE_CRUD_URL}invalid-id`).expect(400);
  });
});
