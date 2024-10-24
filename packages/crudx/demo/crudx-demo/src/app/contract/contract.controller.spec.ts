import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { FindManyOptions } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

import { Contract } from "./contract.entity";
import { ContractService } from "./contract.service";

describe("ContractController demo", () => {
  let app: INestApplication;
  let service: UserService;
  let contractService: ContractService;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });

    service = module.get<UserService>(UserService);
    contractService = module.get<ContractService>(ContractService);
    user = await getOneUser();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("DELETE Should return 404 on delete route", async () => {
    const contract = await getOneContract();

    return request(app.getHttpServer())
      .delete(`/users/${user.id}/contracts/${contract.id}`)
      .expect(404);
  });

  it("POST should create contract and respond with serialize dto", async () => {
    return request(app.getHttpServer())
      .post(`/users/${user.id}/contracts`)
      .send({
        contractNumber: uuidv4(),
        startedAt: "2024-02-14",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.contractNumber).toBeDefined();
        expect(res.body.startedAt).toBeDefined();
        expect(res.body.note).toBeDefined();
        expect(res.body.userId).toBeUndefined();
      });
  });

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
