import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { Phone } from "./phone.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class PhoneService extends TypeOrmCrudService<Phone> {
  constructor(@InjectRepository(Phone) readonly repo) {
    super(repo);
  }
}
