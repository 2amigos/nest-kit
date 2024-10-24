import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TypeOrmCrudService } from "../../../src";
import { RelationTest } from "../model/relation-test.model";

@Injectable()
export class RelationTestService extends TypeOrmCrudService<RelationTest> {
  constructor(
    @InjectRepository(RelationTest) override repo: Repository<RelationTest>
  ) {
    super(repo);
  }
}
