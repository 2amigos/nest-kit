import { Crud, CrudController } from "@2amtech/crudx";
import { Controller } from "@nestjs/common";

import { Address } from "./address.entity";
import { AddressService } from "./address.service";

@Crud({
  model: {
    type: Address,
  },
  params: {
    userId: {
      type: "uuid",
      field: "userId",
    },
  },
  query: {
    exclude: ["userId", "typeId"],
    join: {
      type: {
        allow: ["id", "type"],
        required: true,
        eager: true,
      },
    },
    filter: {
      isActive: {
        $eq: true,
      },
    },
  },
})
@Controller("/users/:userId/addresses")
export class AddressController implements CrudController<Address> {
  constructor(public service: AddressService) {}

  get base(): CrudController<Address> {
    return this;
  }
}
