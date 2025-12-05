import {
  CanActivate,
  Controller,
  ExecutionContext,
  INestApplication,
  UseGuards,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import * as request from "supertest";

import {
  Crud,
  CrudAuth,
  CrudController,
  CrudOptions,
  ObjectLiteral,
} from "../../src";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { TestingService } from "../__fixture__/service/testing-service.service";

const BASE_CONTROLLER = "/controller-no-options/";
const BASE_AUTH_CONTROLLER = "/intercept-auth/";
const BASE_AUTH_CONTROLLER_OBJECT = "/intercept-auth-object/";

@Crud({
  model: {
    type: TestingModel,
  },
  query: {
    filter: () => ({
      age: {
        $eq: 57,
      },
    }),
  },
})
@Controller(BASE_CONTROLLER)
class CrudNoOptionsControllerTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

// dummy interceptor to simulate auth
class BaseGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = this.extractTokenFromHeader(request);

    request["model_id"] = key;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      (<any>request.headers)["authorization"]?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}

@Crud({
  model: {
    type: TestingModel,
  },
})
@CrudAuth({
  property: "model_id",
  filter: (model_id: any) => ({
    id: model_id,
  }),
  persist: (model_id) => ({
    model_id: model_id,
  }),
})
@Controller(BASE_AUTH_CONTROLLER)
@UseGuards(BaseGuard)
class CrudAuthInterceptorTest implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

// dummy interceptor to simulate auth with object exposed
class BaseObjectGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = <number>(this.extractTokenFromHeader(request) ?? -1);

    const model = await TestingModel.findOneBy({ id: key });
    request["model"] = model;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      (<any>request.headers)["authorization"]?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}
@Crud({
  model: {
    type: TestingModel,
  },
})
@CrudAuth({
  property: "model",
  or: (model: any) => ({
    id: model.id,
  }),
})
@Controller(BASE_AUTH_CONTROLLER_OBJECT)
@UseGuards(BaseObjectGuard)
class CrudAuthInterceptorObjectAuthTest
  implements CrudController<TestingModel> {
  constructor(public service: TestingService) { }
}

describe("Crud Decorators #with empty options Test", () => {
  let app: INestApplication;
  let server: any;
  let model: TestingModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [
        CrudNoOptionsControllerTest,
        CrudAuthInterceptorTest,
        CrudAuthInterceptorObjectAuthTest,
      ],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    server = app.getHttpServer();
    await TestingModel.createQueryBuilder().delete().execute();

    await TestingModel.create({
      firstName: "fn 1",
      age: 50,
    }).save();

    await TestingModel.create({
      firstName: "fn 2",
      age: 57,
    }).save();

    await TestingModel.create({
      firstName: "fn 3",
      age: 57,
    }).save();
  });

  afterAll(async () => {
    await TestingModel.createQueryBuilder().delete().execute();
    await server.close();
    await app.close();
  });

  it("Should return only with age 57 #filerQuery on #crudOptions", async () => {
    return request(server)
      .get(BASE_CONTROLLER)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        const validFn = ["fn 2", "fn 3"];
        res.body.forEach((body: any) => {
          expect(validFn.includes(body.firstName)).toBeTruthy();
          expect(body.age).toEqual(57);
        });
      });
  });

  it("Should auth with dummy base guard", async () => {
    const model = await TestingModel.findOneBy({ age: 57 });

    return request(server)
      .get(BASE_AUTH_CONTROLLER)
      .set("Authorization", `Bearer ${model!.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(body.firstName).toEqual(model?.firstName);
          expect(body.lastName).toEqual(model?.lastName);
          expect(body.age).toEqual(model?.age);
        });
      });
  });

  it("Should auth with dummy base object guard", async () => {
    const model = await TestingModel.findOneBy({ age: 57 });

    return request(server)
      .get(BASE_AUTH_CONTROLLER_OBJECT)
      .set("Authorization", `Bearer ${model!.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(body.firstName).toEqual(model?.firstName);
          expect(body.lastName).toEqual(model?.lastName);
          expect(body.age).toEqual(model?.age);
        });
      });
  });
});
