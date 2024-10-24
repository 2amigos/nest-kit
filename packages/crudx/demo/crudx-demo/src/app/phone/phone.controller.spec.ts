import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { FindManyOptions } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

import { PhoneDto } from "./phone.dto";
import { Phone } from "./phone.entity";

describe("PhoneController - Overriden Routes", () => {
  let app: INestApplication;
  let service: UserService;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });

    service = module.get<UserService>(UserService);
    user = await getOneUser();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST create one user related resource (phone)", async () => {
    const phoneNumber = "999999999";

    return request(app.getHttpServer())
      .post("/users/" + user.id + "/phones")
      .send(<PhoneDto>{
        phoneNumber: phoneNumber,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.phoneNumber).toEqual(phoneNumber);
        expect(res.body.customProp).toEqual("custom added property");
      });
  });

  it("POST bulk create related resource (phone)", async () => {
    const bulk = [
      <Phone>{
        phoneNumber: "000x",
      },
      <Phone>{
        phoneNumber: "000y",
      },
    ];

    return request(app.getHttpServer())
      .post(`/users/${user.id}/phones/bulk`)
      .send({ bulk: bulk })
      .expect("Content-Type", /json/)
      .expect(201)
      .expect((res) => {
        expect(res.body.at(0).phoneNumber).toEqual("000x");
        expect(res.body.at(0).customProp).toEqual("custom added property");
        expect(res.body.at(1).phoneNumber).toEqual("000y");
        expect(res.body.at(1).customProp).toEqual("custom added property");
      });
  });

  it("GET Shoud get all user related resources (phone)", async () => {
    return request(app.getHttpServer())
      .get(`/users/${user.id}/phones`)
      .expect(200)
      .expect((res) => {
        user.phones.forEach((userPhone) => {
          expect(
            res.body.data.filter(
              (phone) => phone.phoneNumber === userPhone.phoneNumber
            )
          ).toBeDefined();
        });
        res.body.data.forEach((response) => {
          expect(response.customProp).toEqual("custom added property");
        });
      });
  });

  it("GET one user related resoruce (phone)", async () => {
    const phoneNumber = "000000000";

    const phone = new Phone();
    phone.phoneNumber = phoneNumber;
    phone.userId = user.id;
    await phone.save({ reload: true });

    return request(app.getHttpServer())
      .get(`/users/${user.id}/phones/${phone.id}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.phoneNumber).toEqual(phoneNumber);
        expect(res.body.customProp).toEqual("custom added property");
      });
  });

  it("DELETE user related resources (phone)", async () => {
    const phoneNumber = "000000000";

    const phone = new Phone();
    phone.phoneNumber = phoneNumber;
    phone.userId = user.id;
    await phone.save({ reload: true });

    return request(app.getHttpServer())
      .delete(`/users/${user.id}/phones/${phone.id}`)
      .expect(200);
  });

  async function getOneUser(): Promise<User> {
    const user = (
      await service.find(<FindManyOptions>{
        take: 1,
        relations: { phones: true },
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
