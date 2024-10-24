import { Catch, Injectable } from "@nestjs/common";
import { User } from "./user.model";
import { TypeOrmCrudService } from "@2amtech/crudx";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { ValidationError } from "class-validator";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class AppService extends TypeOrmCrudService<User> {
  constructor(@InjectRepository(User) readonly repo) {
    super(repo);
  }
}
