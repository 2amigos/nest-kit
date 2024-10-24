import { ContextIdFactory } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";

import { UserDto } from "./user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";

describe("UserService", () => {
  const contextId = ContextIdFactory.create();
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();

    jest
      .spyOn(ContextIdFactory, "getByRequest")
      .mockImplementation(() => contextId);
    service = await module.resolve<UserService>(UserService, contextId);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UserService);
  });

  it("should check user record existence", async () => {
    const id = uuidv4();
    const email = id + "testing@email.com";
    const pwd = "1234!@#$";

    const user = User.create({
      id: id,
      email: email,
      password: pwd,
    });

    const userDto = new UserDto();
    userDto.email = user.email;
    userDto.password = user.password;

    expect(await service.userExists(userDto)).toBeFalsy();

    await user.save();
    expect(user.id).toBeDefined();

    userDto.password = user.password;
    expect(await service.userExists(userDto)).toBeTruthy();
  });
});
