import { Catch, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { TypeOrmCrudService } from "@2amtech/crudx";
import { TestingModel } from "../model/testing-model.model";
import { Repository } from "typeorm";
import { RequestQueryException } from "../../../src";

@Injectable()
export class TestingService extends TypeOrmCrudService<TestingModel> {
  constructor(
    @InjectRepository(TestingModel) override repo: Repository<TestingModel>
  ) {
    super(repo);
  }
}
