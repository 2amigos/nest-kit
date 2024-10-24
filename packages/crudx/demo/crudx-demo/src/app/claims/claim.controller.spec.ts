import { QueryBuilderService } from "@2amtech/crudx";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { FindManyOptions } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";
import { Contract } from "../contract/contract.entity";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

import { Claim } from "./claim.entity";

describe("ClaimController demo", () => {
  let app: INestApplication;
  let user: User;
  let contract: Contract;

  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    service = module.get<UserService>(UserService);

    user = await getOneUser();
    contract = await getOneContract();
    await populateClaims();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET Should list all contract's claims", async () => {
    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(5);
      });
  });

  it("GET Should get only fields described on query allow", async () => {
    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.data.forEach((claim) => {
          expect(claim.id).toBeDefined();
          expect(claim.amount).toBeDefined();
          expect(claim.date).toBeDefined();
          expect(claim.contractId).toBeUndefined();
          expect(claim.user).toBeUndefined();
        });
      });
  });

  it("GET Should not get fields described on query exclude", async () => {
    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.data.forEach((claim) => {
          expect(claim.user).toBeUndefined();
        });
      });
  });

  it("GET Should sort response by id DESC", async () => {
    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        const first = res.body.data.at(0);
        const last = res.body.data.at(-1);

        expect(first.id).toBeGreaterThan(last.id);
      });
  });

  // request query params tests

  it("GET only claims with exact amount", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb
      .setFilter({ field: "amount", operator: "$eq", value: 100 })
      .query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.data.forEach((claim) => {
          expect(claim.amount).toEqual(100);
        });
      });
  });

  it("GET only claims with date greater or equal than", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb
      .setFilter({ field: "date", operator: "$gte", value: "2024-02-21" })
      .setLimit(2)
      .query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(2);
      });
  });

  it("GET only claims with date between", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb
      .setFilter({
        field: "date",
        operator: "$between",
        value: "2024-02-20,2024-02-21",
      })
      .setLimit(4)
      .query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(4);
      });
  });

  it("GET only field claim amount", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb.select(["amount"]).query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.data.forEach((claim) => {
          expect(claim.amount).toBeDefined();
          expect(claim.date).toBeUndefined();
          expect(claim.contractId).toBeUndefined();
        });
      });
  });

  it("GET by search condition", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb
      .search({ amount: "200", date: { $gte: "2024-02-21" } })
      .setLimit(3)
      .query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.count).toEqual(3);

        res.body.data.forEach((claim) => {
          expect(claim.amount).toEqual(200);
        });
      });
  });

  it("GET with contract relation", async () => {
    const qb = QueryBuilderService.create();

    const queryString = qb
      .setJoin({ field: "contract", select: ["contractNumber"] })
      .query();

    return request(app.getHttpServer())
      .get(`/contracts/${contract.id}/claims?${queryString}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.data.forEach((claim) => {
          expect(claim.contract).toBeDefined();
          expect(claim.contract.contractNumber).toBeDefined();
          expect(claim.contract.userId).toBeUndefined();
          expect(claim.contract.startedAt).toBeUndefined();
          expect(claim.contract.note).toBeUndefined();
        });
      });
  });

  async function populateClaims(): Promise<any> {
    Claim.clear();
    const amount1 = 100;
    const date1 = "2024-02-20";

    const amount2 = 200;
    const date2 = "2024-02-21";

    for (let i = 0; i < 10; i++) {
      await Claim.create({
        contractId: contract.id,
        amount: amount1,
        date: date1,
      }).save();

      await Claim.create({
        contractId: contract.id,
        amount: amount2,
        date: date2,
      }).save();
    }

    return Boolean<true>;
  }

  async function getOneUser(): Promise<User> {
    const user = (
      await service.find(<FindManyOptions>{
        take: 1,
        relations: { contracts: true },
      })
    ).at(0);

    if (user === undefined) {
      const id = uuidv4();
      const usr = User.create(<User>{
        email: `${id}-sample@email.com`,
        password: "1234!@#$",
      });

      return await usr.save({ reload: true });
    }

    return user;
  }

  async function getOneContract(): Promise<Contract> {
    if (user.contracts.at(0) !== undefined) {
      return user.contracts.at(0);
    }

    return Contract.create({
      userId: user.id,
      contractNumber: uuidv4(),
      startedAt: "2024-02-14",
    }).save({ reload: true });
  }
});
