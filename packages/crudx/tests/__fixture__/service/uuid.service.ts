import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TypeOrmCrudService } from "../../../src";
import { UuidModel } from "../model/uuid.model";

@Injectable()
export class UuidService extends TypeOrmCrudService<UuidModel> {
  constructor(
    @InjectRepository(UuidModel) override repo: Repository<UuidModel>
  ) {
    super(repo);
  }
}
