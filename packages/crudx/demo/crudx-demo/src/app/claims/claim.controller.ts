import { Crud, CrudController } from "@2amtech/crudx";
import { Controller } from "@nestjs/common";

import { Claim } from "./claim.entity";
import { ClaimService } from "./claim.service";

@Crud({
  model: {
    type: Claim,
  },
  params: {
    contractId: {
      type: "number",
      field: "contractId",
    },
  },
  query: {
    allow: ["id", "amount", "date"],
    persist: ["id"],
    limit: 5,
    maxLimit: 5,
    alwaysPaginate: true,
    sort: [
      {
        field: "id",
        order: "DESC",
      },
    ],
    cache: 2000,
    join: {
      contract: {
        eager: true,
      },
    },
  },
})
@Controller("/contracts/:contractId/claims")
export class ClaimController implements CrudController<Claim> {
  constructor(public service: ClaimService) {}

  get base(): CrudController<Claim> {
    return this;
  }
}
