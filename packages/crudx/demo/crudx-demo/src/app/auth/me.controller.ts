import { Crud, CrudAuth, CrudController, Feature } from "@2amtech/crudx";
import { Controller, UseGuards, UseInterceptors } from "@nestjs/common";

import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";

import { AuthGuard } from "./auth.guard";

@Crud({
  model: {
    type: User,
  },
  routes: {
    only: ["getOneBase"],
  },
  params: {
    id: {
      primary: true,
      disabled: true,
    },
  },
})
@CrudAuth({
  property: "user",
  filter: (user: any) => ({
    id: user.sub,
  }),
})
@Controller("me")
@Feature("GetMyInfo")
@UseGuards(AuthGuard)
export class MeController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }
}
