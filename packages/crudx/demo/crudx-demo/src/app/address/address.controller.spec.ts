import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { FindManyOptions } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

import { AddressType } from "./address-type.entity";
import { Address } from "./address.entity";

describe("AddressControllerTest", () => {
  let app: INestApplication;
  let user: User;
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    service = module.get<UserService>(UserService);

    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    user = await getOneUser();

    Address.clear();

    const homeType: AddressType = await AddressType.create(<AddressType>{
      type: "Home",
    }).save();

    const workType: AddressType = await AddressType.create(<AddressType>{
      type: "work",
    }).save();

    for (let i = 0; i < 3; i++) {
      await Address.create({
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        street: faker.location.streetAddress(),
        number: faker.number.int({ max: 100 }),
        userId: user.id,
        typeId: i % 2 == 0 ? homeType.id : workType.id,
        isActive: true,
      }).save();
    }

    for (let i = 0; i < 10; i++) {
      await Address.create({
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        street: faker.location.streetAddress(),
        number: faker.number.int({ max: 100 }),
        userId: user.id,
        typeId: i % 2 == 0 ? homeType.id : workType.id,
        isActive: false,
      }).save();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("Should GET with filter by active status only", async () => {
    return request(app.getHttpServer())
      .get(`/users/${user.id}/addresses`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(3);
      });
  });

  it("Should GET without userId and typeId fields (filters)", async () => {
    return request(app.getHttpServer())
      .get(`/users/${user.id}/addresses`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((address) => {
          expect(address.userId).toBeUndefined();
          expect(address.typeId).toBeUndefined();
        });
      });
  });

  it("Should GET with JOIN relations: type (address)", async () => {
    return request(app.getHttpServer())
      .get(`/users/${user.id}/addresses`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        res.body.forEach((address) => {
          expect(address.type).toBeDefined();
          expect(address.type).toBeDefined();
        });
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
});
