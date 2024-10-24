import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { useContainer } from "class-validator";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

describe("Authcontroller", () => {
  let app: INestApplication;
  let user: User;
  let userService: UserService;
  let authService: AuthService;

  const email = `${uuidv4()}testing@emailcom`;
  const password = "1234!@#$";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    app = module.createNestApplication();
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);

    useContainer(app, { fallbackOnErrors: true });
    await app.init();

    user = (await userService.find({ take: 1 })).at(0);
    user.email = email;
    user.password = password;
    await user.save();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Should authenticate and return token", () => {
    expect(user.id).toBeDefined();
  });

  it("POST Should authenticate user and return token", async () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: email,
        pass: password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it("POST shoud fail authentication TInput extends AuthService = anyredentials", async () => {
    return request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({
        email: email,
        pass: "xxx",
      })
      .expect("Content-Type", /json/)
      .expect(401)
      .expect((res) => {
        expect(res.body.access_token).toBeUndefined();
        expect(res.body.message).toEqual("Unauthorized");
      });
  });

  it("GET should unauthorize access to /me rout when not authenticated", async () => {
    return request(app.getHttpServer())
      .get("/me")
      .expect("Content-Type", /json/)
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toEqual("Unauthorized");
      });
  });

  it("GET /me should return authenticated user info", async () => {
    const credentials = await authService.signIn(email, password);
    expect(credentials.access_token).toBeDefined();

    return request(app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${credentials.access_token}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        const body = res.body;

        expect(body.email).toEqual(email);
        expect(body.id).toEqual(user.id);
      });
  });
});
