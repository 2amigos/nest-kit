import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { v4 as uuidv4 } from "uuid";

import {
  CrudOptions,
  CrudRequest,
  CrudRequestOptions,
  JoinOption,
  ParamOption,
  ParamsOptions,
  ParsedRequestParams,
  QueryFilter,
  QueryJoin,
} from "../../src";
import { TestingModel } from "../__fixture__/model/testing-model.model";
import { TestModule } from "../__fixture__/module/test-module.module";
import { RelationTestService } from "../__fixture__/service/relation.test.service";
import { TestingService } from "../__fixture__/service/testing-service.service";

describe("Services - #TypeORMCrudService", () => {
  let service: TestingService;
  let relationTestService: RelationTestService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    service = module.get<TestingService>(TestingService);
    relationTestService = module.get<RelationTestService>(RelationTestService);
  });

  afterAll(async () => {
    await relationTestService.repo.createQueryBuilder().delete().execute();
    await service.repo.createQueryBuilder().delete().execute();
    await module.close();
  });

  it("Should clear database", async () => {
    await relationTestService.repo.createQueryBuilder().delete().execute();
    await service.repo.createQueryBuilder().delete().execute();
  });

  it("Should create a new record", async () => {
    const entity = service.repo.create({
      firstName: "testing",
      lastName: "create",
      age: 19,
    });

    await entity.save();

    expect(entity.firstName).toEqual("testing");
    expect(entity.lastName).toEqual("create");
    expect(entity.age).toEqual(19);
    expect(entity.id).toBeDefined();
  });

  it("Should find one", async () => {
    const entity = await service.repo
      .create({
        firstName: "findable",
        lastName: "entity",
        age: 19,
      })
      .save();

    const foundEntity = await service.findOne({ where: { id: entity.id } });

    expect(foundEntity?.id).toEqual(entity.id);
    expect(foundEntity?.firstName).toEqual(entity.firstName);
    expect(foundEntity?.lastName).toEqual(entity.lastName);
    expect(foundEntity?.age).toEqual(entity.age);
  });

  it("Should find one by property", async () => {
    const entity = await service.repo
      .create({
        firstName: "findable 2",
        lastName: "entity 2",
        age: 22,
      })
      .save();

    const foundEntity = await service.findOneBy({ id: entity.id });

    expect(foundEntity?.id).toEqual(entity.id);
    expect(foundEntity?.firstName).toEqual(entity.firstName);
    expect(foundEntity?.lastName).toEqual(entity.lastName);
    expect(foundEntity?.age).toEqual(entity.age);
  });

  it("Should find by expression", async () => {
    const entity = await service.repo
      .create({
        firstName: `${uuidv4()} unique name`,
        lastName: "entity 2",
        age: 22,
      })
      .save();

    const foundEntity = (
      await service.find({ where: { firstName: entity.firstName } })
    ).at(0);

    expect(foundEntity?.id).toEqual(entity.id);
    expect(foundEntity?.firstName).toEqual(entity.firstName);
    expect(foundEntity?.lastName).toEqual(entity.lastName);
    expect(foundEntity?.age).toEqual(entity.age);
  });

  it("Should create with return shallow and total entities count", async () => {
    await service.repo.createQueryBuilder().delete().execute();

    await service.repo
      .create({
        firstName: "en 1",
        lastName: `entity sample 1`,
        age: 20,
      })
      .save();

    await service.repo
      .create({
        firstName: "en 2",
        lastName: `entity sample 2`,
        age: 21,
      })
      .save();

    await service.repo
      .create({
        firstName: "en 3",
        lastName: `entity sample 3`,
        age: 22,
      })
      .save();

    const totalCount = await service.count();

    expect(totalCount).toEqual(3);
  });

  it("Should return soft deleted", async () => {
    const model = await service.repo
      .create({
        firstName: "soft",
        lastName: "deletion",
        age: 20,
      })
      .save();

    const removedId = model.id;

    await model.softRemove();

    const builder = await service.createBuilder(
      <ParsedRequestParams>{
        includeDeleted: 1,
      },
      <CrudRequestOptions>{
        query: {
          softDelete: true,
        },
      },
      true,
      true
    );

    const results = await builder.getMany();
    const removed = results.filter((entity) => entity.id === removedId).at(0);

    expect(removed).toBeDefined();
    expect(removed?.id).toEqual(removedId);
  });

  it("Should return param filters", () => {
    const parsedRequest = <ParsedRequestParams>{
      fields: [],
      paramsFilter: [
        {
          field: "name",
          operator: "$eq",
          value: "sample 1",
        },
      ],
      authPersist: undefined,
      classTransformOptions: undefined,
      search: undefined,
      filter: [],
      or: [],
      join: [],
      sort: [],
      limit: undefined,
      offset: undefined,
      page: undefined,
      cache: undefined,
      includeDeleted: undefined,
      extra: undefined,
    };

    const filters = service.getParamFilters(parsedRequest);

    expect(
      Object.keys(filters).filter((key: string) => key === "name")
    ).toBeDefined();
    expect(filters["name"]).toEqual("sample 1");
  });

  it("Should create query builder with join", async () => {
    const relation = await relationTestService.repo
      .create({
        name: "some testing relation",
      })
      .save();

    const model = await service.repo
      .create({
        firstName: "findable",
        lastName: "model",
        age: 32,
        relationTestId: relation.id,
      })
      .save();

    const builder = await service.createBuilder(
      <ParsedRequestParams>{
        join: [
          <QueryJoin>{
            field: "relationTest",
            select: ["relationTest.name", "relationTest.id"],
          },
        ],
      },
      <CrudOptions>{
        query: {
          join: <JoinOption>{
            allow: ["relationTest"],
            eager: true,
            relationTest: {
              eager: true,
            },
          },
        },
      }
    );

    builder.where({ relationTestId: relation.id });
    const foundEntity = await builder.getOne();

    expect(foundEntity).toBeDefined();
    expect(foundEntity?.id).toEqual(model.id);
    expect(foundEntity?.relationTestId).toEqual(relation.id);
    expect(foundEntity?.relationTest).toBeDefined();
    expect(foundEntity?.relationTest?.id).toEqual(relation.id);

    const builder2 = await service.createBuilder(
      <ParsedRequestParams>{
        join: [
          <QueryJoin>{
            select: ["relationTest.name", "relationTest.id"],
          },
        ],
      },
      <CrudOptions>{
        query: {
          join: <JoinOption>{
            relationTest: {
              eager: true,
            },
          },
        },
      }
    );

    builder2.where({ relationTestId: relation.id });
    const foundEntity2 = await builder2.getOne();

    expect(foundEntity2).toBeDefined();
    expect(foundEntity2?.id).toEqual(model.id);
    expect(foundEntity2?.relationTestId).toEqual(relation.id);
    expect(foundEntity2?.relationTest).toBeDefined();
    expect(foundEntity2?.relationTest?.id).toEqual(relation.id);
  });

  it("Should throw bad requewt", () => {
    const t = () => {
      service.throwBadRequestException("custom bad request");
    };

    expect(t).toThrow(BadRequestException);
  });

  it("Should return empty array for primary params (not defiend)", () => {
    const params = service.getPrimaryParams(<CrudRequestOptions>{});

    expect(params).toHaveLength(0);
  });
});
