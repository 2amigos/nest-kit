import {
  CreateManyDto,
  Crud,
  CrudController,
  CrudRequest,
  GetManyDefaultResponse,
  Override,
  ParsedBody,
  ParsedRequest,
} from "@2amtech/crudx";
import { Controller } from "@nestjs/common";

import { PhoneDto } from "./phone.dto";
import { Phone } from "./phone.entity";
import { PhoneService } from "./phone.service";

@Crud({
  model: {
    type: Phone,
  },
  dto: {
    create: PhoneDto,
    update: PhoneDto,
  },
  params: {
    id: {
      field: "id",
      type: "uuid",
      primary: true,
    },
    userId: {
      field: "userId",
      type: "uuid",
    },
  },
  query: {
    limit: 25,
    cache: 2000,
    alwaysPaginate: true,
  },
})
@Controller("/users/:userId/phones")
export class PhoneController implements CrudController<Phone> {
  constructor(public service: PhoneService) {}

  get base(): CrudController<Phone> {
    return this;
  }

  @Override()
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto
  ): Promise<Phone> {
    const response = await Promise.resolve(this.base.createOneBase(req, dto));

    response["customProp"] = "custom added property";

    return response;
  }

  @Override()
  async createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<Phone>
  ): Promise<Phone[]> {
    const response = await Promise.resolve(this.base.createManyBase(req, dto));
    response.forEach((res) => {
      res["customProp"] = "custom added property";
    });

    return response;
  }

  @Override()
  async getOne(@ParsedRequest() req: CrudRequest): Promise<Phone> {
    const response = await Promise.resolve(this.base.getOneBase(req));

    response["customProp"] = "custom added property";

    return response;
  }

  @Override()
  async getMany(
    @ParsedRequest() req: CrudRequest
  ): Promise<GetManyDefaultResponse<Phone> | Phone[]> {
    const response = <GetManyDefaultResponse<Phone>>(
      await this.base.getManyBase(req)
    );

    response.data.forEach((res) => {
      res["customProp"] = "custom added property";
    });

    return response;
  }
}
