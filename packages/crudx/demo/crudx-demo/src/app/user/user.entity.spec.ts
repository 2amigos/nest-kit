import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import * as loader from "../../support/loader";

import { User } from "./user.entity";

describe("UserService", () => {
  let user: User;
  const userId = uuidv4();
  const userPwd = "1234!@#$";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule(
      await loader.loadUserModule()
    ).compile();
  });

  it("should create a new user", () => {
    user = User.create({
      id: userId,
      email: userId + "@email.com",
      password: userPwd,
    });

    expect(user.email).toEqual(userId + "@email.com");
  });

  it("should hash the password", async () => {
    expect(user.password).toEqual(userPwd);
    await user.save();

    bcrypt.compare(userPwd, user.password, (err, isValidHsh) => {
      expect(isValidHsh).toBeTruthy();
    });
  });

  it("should hash password on update", async () => {
    const newPassword = "xwty@#$%";
    user.password = newPassword;

    expect(user.password).toEqual(newPassword);
    await user.save();

    bcrypt.compare(newPassword, user.password, (err, isValidHash) => {
      expect(isValidHash).toBeTruthy();
    });
  });

  /*it("should failt to hash password on update", async () => {
    user.password = '';

    try {
      await user.save();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Unable to encrypt password: ");
    }
  });*/
});
