import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { FindManyOptions } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";

import { UserController } from "./user.controller";
import { UserDto } from "./user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { randomInt } from "crypto";

describe("UserController", () => {
  let app: INestApplication;
  let controller: UserController;
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    useContainer(app, { fallbackOnErrors: true });
    await app.init();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("GET all users", async () => {
    const users = await service.find(
      <FindManyOptions>{
        take: 25,
        relations: {
          phones: false,
        },
      } // app builds up with pagination enabled, loading first page only
    );

    return request(app.getHttpServer())
      .get("/users/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        users.forEach((user) => {
          expect(JSON.stringify(res.body)).toContain(user.id);
        });
      });
  });

  it("GET one user by id", async () => {
    const user = (await service.find(<FindManyOptions>{ take: 1 })).at(0);

    return request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toEqual(user.id);
        expect(res.body.email).toEqual(user.email);
      });
  });

  it("GET bad request, ID should be UUID", async () => {
    return request(app.getHttpServer())
      .get("/users/some-invalid-id")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .then((res) => {
        expect(res.body.message).toEqual(
          "Invalid param id. UUID string expected"
        );
      });
  });

  it("GET no found, ID not associated with user", async () => {
    return request(app.getHttpServer())
      .get(`/users/${uuidv4()}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404);
  });

  it("POST create new user", async () => {
    const userEmail = uuidv4() + "-my-entry@email.com";

    const user = <UserDto>{
      email: userEmail,
      password: "1234!@#$",
    };

    return request(app.getHttpServer())
      .post("/users")
      .send(user)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toEqual(user.email);
      });
  });

  it("POST create user failure, email already exists", async () => {
    const user = User.create({
      email: `invalid${randomInt(0, 9999)}@email.com`,
      password: "1234!@#$",
    });
    await user.save();

    return request(app.getHttpServer())
      .post("/users")
      .send(<UserDto>{
        email: user.email,
        password: "1234!@#$",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(["Email already exists"]);
      });
  });

  it("POST bulk create users", async () => {
    const bulk = [
      <UserDto>{
        email: uuidv4() + "-my-entry@email.com",
        password: "1234!@#$",
      },
      <UserDto>{
        email: uuidv4() + "-my-entry@email.com",
        password: "1234!@#$",
      },
    ];

    return request(app.getHttpServer())
      .post("/users/bulk")
      .send({
        bulk: bulk,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .expect((res) => {
        expect(res.body.at(0).email).toEqual(bulk.at(0).email);
        expect(res.body.at(1).email).toEqual(bulk.at(1).email);
      });
  });

  it("PATCH updates user", async () => {
    const user = (await service.find(<FindManyOptions>{ take: 1 })).at(0);
    user.email = uuidv4() + "updated-resource@email.com";
    user.password = "1234!@#$";

    return request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send(user)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toEqual(user.email);
      });
  });

  it("PUT replace user", async () => {
    const user = (await service.find(<FindManyOptions>{ take: 1 })).at(0);
    user.email = uuidv4() + "updated-resource@email.com";
    user.password = "1234!@#$";

    return request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send(user)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toEqual(user.email);
      });
  });

  it("DELETE user", async () => {
    const user = User.create({
      id: uuidv4(),
      email: `${uuidv4()}email@test.com`,
      password: "1234!@#$",
    });

    await user.save({ reload: true });

    return request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set("Accept", "application/json")
      .expect(200);
  });

  it("GET should return emails list - custom added route", async () => {
    const users = await service.find();

    return request(app.getHttpServer())
      .get("/users/emails")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        users.forEach((user) => {
          expect(
            res.body.filter((userMail) => userMail.email === user.email)
          ).toBeDefined();
        });
      });
  });
});
