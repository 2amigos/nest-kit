import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidationError } from "class-validator";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

import { UserDto } from "./user.dto";
import { User } from "./user.entity";

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class UserService extends TypeOrmCrudService<User> {
  constructor(@InjectRepository(User) readonly repo) {
    super(repo);
  }

  async userExists(dto: Partial<UserDto>): Promise<boolean> {
    const user: User = await this.repo.findOneBy(dto);
    return Boolean(user);
  }
}
