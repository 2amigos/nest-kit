import { registerAs } from "@nestjs/config";

import { Base } from "./base.model";

export const databaseConfig = registerAs("database", () => ({
  type: process.env["DB_TYPE"],
  host: process.env["DB_HOST"],
  port: process.env["DB_PORT"],
  username: process.env["DB_USERNAME"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_DATABASE"],
  entities: [Base],
  synchronize: true,
  autoLoadEntities: true,
  encoding: process.env["DB_CHARSET"],
}));