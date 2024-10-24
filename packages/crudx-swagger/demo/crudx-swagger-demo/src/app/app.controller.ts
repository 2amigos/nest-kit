import { Controller } from "@nestjs/common";

import { AppService } from "./app.service";
import { User } from "./user.model";
import { Crud, CrudController, CrudRequest, Override } from "@2amtech/crudx";
import {
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  ApiResponseOptions,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("v1")
@Crud({
  model: {
    type: User,
  },
})
@Controller("/user")
export class AppController implements CrudController<User> {
  constructor(public service: AppService) {}

  get base(): CrudController<User> {
    return this;
  }

  @Override("getOneBase")
  @ApiResponse(<ApiResponseOptions>{
    status: 200,
    description: "Overriden description",
  })
  @ApiOperation(<ApiOperationOptions>{
    summary: "Overriden Summary",
  })
  async getOneOverride(req: CrudRequest): Promise<User> {
    return this.base.getOneBase(req);
  }
}
