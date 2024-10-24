import { registerAs } from "@nestjs/config";

import { IdentityType } from "./model/identity-type.model";
import { Nested } from "./model/nested.model";
import { RelationTest } from "./model/relation-test.model";
import { TestingModel } from "./model/testing-model.model";
import { UuidModel } from "./model/uuid.model";

export const databaseConfig = registerAs("database", () => ({
  type: process.env["DB_TYPE"],
  host: process.env["DB_HOST"],
  port: process.env["DB_PORT"],
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_DATABASE"],
  entities: [TestingModel, RelationTest, Nested, IdentityType, UuidModel],
  synchronize: true,
  autoLoadEntities: true,
  encoding: process.env["DB_CHARSET"],
}));
