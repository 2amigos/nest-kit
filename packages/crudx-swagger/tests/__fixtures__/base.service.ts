import { TypeOrmCrudService } from "@2amtech/crudx";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Base } from "./base.model";

@Injectable()
export class BaseService extends TypeOrmCrudService<Base> {
  constructor(@InjectRepository(Base) override readonly repo: any) {
    super(repo);
  }
}
