import { Crud, CrudController, SerializeOptions } from "@2amtech/crudx";
import { Controller, Type } from "@nestjs/common";

import { ContractCreateDto } from "./contract.create.dto";
import { ContractCreateResponseDto } from "./contract.create.response.dto";
import { Contract } from "./contract.entity";
import { ContractService } from "./contract.service";

@Crud({
  model: {
    type: Contract,
  },
  dto: {
    create: ContractCreateDto,
  },
  routes: {
    exclude: ["deleteOneBase"],
  },
  params: {
    userId: {
      field: "userId",
      type: "uuid",
    },
  },
  serialize: <SerializeOptions>{
    create: ContractCreateResponseDto,
  },
})
@Controller("/users/:userId/contracts")
export class ContractController implements CrudController<Contract> {
  constructor(public service: ContractService) {}

  get base(): CrudController<Contract> {
    return this;
  }
}
