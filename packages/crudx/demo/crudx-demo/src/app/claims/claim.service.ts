import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { Claim } from "./claim.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class ClaimService extends TypeOrmCrudService<Claim> {
  constructor(@InjectRepository(Claim) readonly repo) {
    super(repo);
  }
}
