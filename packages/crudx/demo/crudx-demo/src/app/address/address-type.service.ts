import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { AddressType } from "./address-type.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class AddressTypeService extends TypeOrmCrudService<AddressType> {
  constructor(@InjectRepository(AddressType) readonly repo) {
    super(repo);
  }
}
