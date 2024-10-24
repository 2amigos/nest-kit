import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { Contract } from "./contract.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class ContractService extends TypeOrmCrudService<Contract> {
  constructor(@InjectRepository(Contract) readonly repo) {
    super(repo);
  }
}
