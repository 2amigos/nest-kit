import { Controller, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Expose } from "class-transformer";
import { useContainer } from "class-validator";
import * as request from "supertest";

import {
  CreateQueryParams,
  Crud,
  CrudController,
  QueryBuilderService,
  QueryFilter,
  QueryJoin,
} from "../../src";
import { IdentityType } from "../__fixture__/model/identity-type.model";
import { Nested } from "../__fixture__/model/nested.model";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { RelationTestService } from "../__fixture__/service/relation.test.service";
import { TestingService } from "../__fixture__/service/testing-service.service";

const CONTROLLER_NAME = "/query-builder-search/";
const CONTROLLER_NOT_JOIN = "/not-join-search/";

class WithDatesDto {
  @Expose()
  readonly id: number | null = null;
  @Expose()
  readonly firstName: string | null = null;
  @Expose()
  readonly lastName: string | null = null;
  @Expose()
  readonly age: number | null = null;
  @Expose()
  readonly datesCreatedAt: Date | null = null;
  @Expose()
  readonly datesUpdatedAt: Date | null = null;
  @Expose()
  readonly relationTestId?: number | null = null;
}

@Crud({
  model: {
    type: TestingModel,
  },
  serialize: {
    get: WithDatesDto,
  },
  query: {
    persist: ["id"],
    exclude: ["createdAt", "updatedAt"],
    join: {
      relationTest: {
        allow: ["id", "name", "nestedId"],
        select: true,
        required: true,
        alias: "relationTest",
        persist: ["id"],
      },
      "relationTest.nested": {
        allow: ["identity"],
        select: true,
        required: false,
      },
      "relationTest.nested.type": {
        allow: ["type"],
        select: true,
        required: true,
      },
      // invalid on purpose
      "relationTest.id": {
        allow: ["identity"],
        select: true,
        required: false,
      },
    },
  },
})
@Controller(CONTROLLER_NAME)
class QueryBuilderSearchTestController implements CrudController<TestingModel> {
  constructor(public service: TestingService) {}
}

@Crud({
  model: {
    type: TestingModel,
  },
  query: {
    allow: ["name", "nestedId", "nested.identity"],
    join: {
      relationTest: {
        select: false,
      },
    },
  },
})
@Controller(CONTROLLER_NOT_JOIN)
class QueryBuilderWithoutAllowedJoinController
  implements CrudController<TestingModel>
{
  constructor(public service: TestingService) {}
}

describe("TypeORMCrudService Query Builders Search Test", () => {
  let app: INestApplication;
  let server: any;
  let service: TestingService;
  let relationTestService: RelationTestService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
      controllers: [
        QueryBuilderSearchTestController,
        QueryBuilderWithoutAllowedJoinController,
      ],
    }).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });

    server = await app.getHttpServer();
    service = module.get<TestingService>(TestingService);
    relationTestService = module.get<RelationTestService>(RelationTestService);

    await app.init();
  });

  afterAll(async () => {
    await Nested.delete({});
    await relationTestService.repo.delete({});
    await service.repo.delete({});

    await server.close();
    await app.close();
  });

  it("Cleanup database and create entities", async () => {
    await Nested.delete({});
    await relationTestService.repo.delete({});
    await service.repo.delete({});

    const samples1 = [0, 1, 2, 3, 4];
    const samples2 = [99, 100];

    for (const i in samples1) {
      await service.repo
        .create({
          firstName: "fname " + samples1[i],
          lastName: "ln " + samples1[i],
          age: 22 + samples1[i],
        })
        .save();
    }

    for (const i in samples2) {
      await service.repo
        .create({
          firstName: "fname " + samples2[i],
          lastName: "ln " + samples2[i],
          age: 57,
        })
        .save();
    }

    const type = await IdentityType.create({
      type: "testing type",
    });
    const nested = await Nested.create({
      identity: "identifier 01",
      typeId: type.id,
    }).save();

    const sample1 = await relationTestService.repo
      .create({
        name: "sample 1",
        nestedId: nested.id,
      })
      .save();

    const sample2 = await relationTestService.repo
      .create({
        name: "sample 2",
        nestedId: nested.id,
      })
      .save();

    await service.repo
      .create({
        firstName: "fname 44",
        lastName: "ln 44",
        age: 44,
        relationTestId: sample1.id,
      })
      .save();

    await service.repo
      .create({
        firstName: "fname 45",
        lastName: "ln 45",
        age: 45,
        relationTestId: sample2.id,
      })
      .save();

    expect(1).toEqual(1);
  });

  it("Should #filter by {age} and #fetch {firstName} and {lastName}", async () => {
    const params = <CreateQueryParams>{
      fields: ["firstName", "lastName"],
      filter: [
        <QueryFilter>{
          field: "age",
          operator: "$eq",
          value: 57,
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);

        const validFNames = ["fname 99", "fname 100"];
        const validLNames = ["ln 99", "ln 100"];

        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
          expect(validLNames.includes(body.lastName)).toBeTruthy();
          expect(body.age).toEqual(0);
          expect(body.relationTestId).toBeNull();
          expect(body.relationTest).toBeNull();
          expect(body.datesCreatedAt).toBeDefined();
          expect(body.datesCreatedAt).toBeNull();
        });
      });
  });

  it("Should #search with #orWhere condition", async () => {
    const params = <CreateQueryParams>{
      search: {
        $or: [
          { firstName: "fname 1" },
          { firstName: "fname 2" },
          { firstName: "fname 3" },
        ],
        age: { $gte: 1 },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 1", "fname 2", "fname 3"];
        expect(res.body).toHaveLength(3);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
        });
      });
  });

  it("Should #search with #$and and #euqal condition", async () => {
    const params = <CreateQueryParams>{
      search: {
        $and: [{ firstName: "fname 100" }],
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(body.firstName).toEqual("fname 100");
        });
      });
  });

  it("Should #search with #or condition only (only one condition)", async () => {
    const params = <CreateQueryParams>{
      search: {
        $or: [{ firstName: "fname 1" }],
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 1"];
        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
        });
      });
  });

  it("Should #search with multiple #or condition", async () => {
    const params = <CreateQueryParams>{
      search: {
        $or: [
          { firstName: "fname 1" },
          { firstName: "fname 2" },
          { firstName: "fname 3" },
        ],
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 1", "fname 2", "fname 3"];
        expect(res.body).toHaveLength(3);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
        });
      });
  });

  it("Should #search with #orWhere condition + #plain or condition", async () => {
    const params = <CreateQueryParams>{
      search: {
        $or: [{ firstName: "fname 0" }],
        lastName: "ln 0",
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 0"];
        const validLNames = ["ln 0"];

        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
          expect(validLNames.includes(body.lastName)).toBeTruthy();
        });
      });
  });

  it("Should #search with implicit #$and condigiton", async () => {
    const params = <CreateQueryParams>{
      search: {
        age: 57,
        firstName: "fname 100",
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 100"];
        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
        });
      });
  });

  it("Should #search with implicit #$and (with object) condigiton", async () => {
    const params = <CreateQueryParams>{
      search: {
        age: 57,
        firstName: { $eq: "fname 100" },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        const validFNames = ["fname 100"];

        expect(res.body).toHaveLength(1);
        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
        });
      });
  });

  it("Shoud return #relation from #join", async () => {
    const params = <CreateQueryParams>{
      fields: ["firstName", "relationTest.name"],
      search: {
        relationTestId: { $notnull: true },
      },
      join: [
        <QueryJoin>{
          field: "relationTest",
          select: ["name"],
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        const validFNames = ["fname 44", "fname 45"];
        const validRNames = ["sample 1", "sample 2"];

        res.body.forEach((body: any) => {
          expect(validFNames.includes(body.firstName)).toBeTruthy();
          expect(validRNames.includes(body.relationTest.name)).toBeTruthy();
        });
      });
  });

  it("Should not return #relation as #join is not allowed", () => {
    const params = <CreateQueryParams>{
      search: {
        relationTestId: { $notnull: true },
      },
      join: [
        <QueryJoin>{
          field: "relationTest",
          select: ["name"],
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query(false);

    return request(server)
      .get(`${CONTROLLER_NOT_JOIN}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.relationTest).toBeNull();
        });
      });
  });

  it("Should load #nested #relation with #sort", () => {
    const params = <CreateQueryParams>{
      fields: ["firstName", "relationTest.name"],
      search: {
        relationTestId: { $notnull: true },
      },
      join: [
        <QueryJoin>{
          field: "relationTest",
          select: ["name", "nestedId"],
        },
        <QueryJoin>{
          field: "relationTest.nested",
          select: ["identity"],
        },
        <QueryJoin>{
          field: "nested.type",
          select: ["type"],
        },
      ],
      sort: [
        {
          field: "id",
          order: "DESC",
        },
        {
          field: "nested.identity",
          order: "DESC",
        },
        {
          field: "relationTest.nested.id",
          order: "ASC",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.relationTest).toBeDefined();
          expect(body.relationTest.nested).toBeDefined();
          expect(body.relationTest.nested.identity).toEqual("identifier 01");
        });
      });
  });

  it("Should apply #$gte, #$lte and $isnull filters", () => {
    const params = <CreateQueryParams>{
      search: {
        age: { $gte: 20, $lte: 30 },
        relationTestId: { $isnull: true },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(5);
      });
  });

  it("Should apply #$gt and #$lt filters", () => {
    const params = <CreateQueryParams>{
      search: {
        age: { $gt: 20, $lt: 30 },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(5);
      });
  });

  it("Should apply #starts, #ends and #in filters - with #custom operator", async () => {
    const params = <CreateQueryParams>{
      search: {
        age: { in: [22, 23, 55, 56, 57] },
        firstName: { $starts: "fname", $ends: "100" },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });

  it("Should apply #contains and excludes filter", async () => {
    const params = <CreateQueryParams>{
      search: {
        firstName: { $cont: "name", $excl: "100" },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(8);
      });
  });

  it("Should apply #not-in and between filter", async () => {
    const params = <CreateQueryParams>{
      search: {
        age: { $between: [20, 30], $notin: [23, 24, 25] },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
      });
  });

  it("Should apply #eqL, #ne, #neL filters", () => {
    const params = <CreateQueryParams>{
      search: {
        age: { $ne: 20, $neL: 30 },
        firstName: { $eqL: "fname 100" },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });

  it("Should apply #startsL, #endsL, $contL and $exclL filters", async () => {
    const params = <CreateQueryParams>{
      search: {
        firstName: {
          $startsL: "fname",
          $endsL: "100",
          $contL: "name",
          $exclL: "99",
        },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });

  it("Should apply #notinL and #inL filters", async () => {
    const params = <CreateQueryParams>{
      search: {
        firstName: {
          $inL: ["fname 1", "fname 2", "fname 0"],
          $notinL: ["fname 0"],
        },
      },
      extra: [
        {
          maxLimitPage1: 10,
          payloadTime: 22,
          sampler: "none",
          parser: [
            {
              limit: 1,
            },
          ],
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
      });
  });

  it("Should throw #Sql inject detected", async () => {
    const params = <CreateQueryParams>{
      sort: [
        {
          field: "'id'",
          order: "DESC",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain("SQL injection detected");
      });
  });

  it("Should apply #$ne filer", async () => {
    const params = <CreateQueryParams>{
      search: {
        age: { $ne: 57 },
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeFalsy();
        });
      });
  });

  it("Shouold apply many $ne filter", async () => {
    const params = <CreateQueryParams>{
      search: {
        $ne: [{ age: 57 }],
        $not: [{ age: 57 }],
      },
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeFalsy();
        });
      });
  });

  it("Should apply one #filter and #or", async () => {
    const params = <CreateQueryParams>{
      filter: [
        <QueryFilter>{
          field: "age",
          operator: "$eq",
          value: 57,
        },
      ],
      or: [
        {
          field: "firstName",
          operator: "$cont",
          value: "100",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeTruthy();
        });
      });
  });

  it("Should apply many #filter and #or operators", async () => {
    const params = <CreateQueryParams>{
      filter: [
        <QueryFilter>{
          field: "age",
          operator: "$eq",
          value: 57,
        },
      ],
      or: [
        {
          field: "firstName",
          operator: "$cont",
          value: "100",
        },
        {
          field: "firstName",
          operator: "$cont",
          value: "99",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeTruthy();
        });
      });
  });

  it("Should apply one #or bare condition", async () => {
    const params = <CreateQueryParams>{
      or: [
        {
          field: "age",
          operator: "$eq",
          value: "57",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeTruthy();
        });
      });
  });

  it("Should apply many #or bare condition", async () => {
    const params = <CreateQueryParams>{
      or: [
        {
          field: "firstName",
          operator: "$cont",
          value: "100",
        },
        {
          field: "firstName",
          operator: "$cont",
          value: "99",
        },
      ],
    };

    const qb = QueryBuilderService.create(params);
    const qs = qb.query();

    return request(server)
      .get(`${CONTROLLER_NAME}?${qs}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        res.body.forEach((body: any) => {
          expect(body.age == 57).toBeTruthy();
        });
      });
  });
});
