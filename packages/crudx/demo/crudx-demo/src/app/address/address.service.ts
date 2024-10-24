import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { Address } from "./address.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class AddressService extends TypeOrmCrudService<Address> {
  constructor(@InjectRepository(Address) readonly repo) {
    super(repo);
  }
}
