import {
  Crud,
  CrudController,
  CrudRequest,
  CrudRequestInterceptor,
  ParsedRequest,
} from "@2amtech/crudx";
import { Controller, Get, UseInterceptors } from "@nestjs/common";

import { UserDto } from "./user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Crud({
  model: {
    type: User,
  },
  dto: {
    create: UserDto,
    update: UserDto,
  },
  params: {
    id: {
      type: "uuid",
      field: "id",
      primary: true,
    },
  },
})
@Controller("users")
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }

  @UseInterceptors(CrudRequestInterceptor)
  @Get("/emails")
  async emails(@ParsedRequest() req: CrudRequest) {
    return this.service.find({ select: ["email"] });
  }
}
