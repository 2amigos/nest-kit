import { ClassTransformOptions } from "class-transformer";
import {
  QueryFields,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
  ObjectLiteral,
} from "../types";

export interface ParsedRequestParams {
  fields: QueryFields;
  paramsFilter: (QueryFilter | undefined)[];
  authPersist: ObjectLiteral | undefined;
  classTransformOptions: ClassTransformOptions | undefined;
  search: SCondition | undefined;
  filter: QueryFilter[];
  or: QueryFilter[];
  join: QueryJoin[];
  sort: QuerySort[];
  limit: number | undefined;
  offset: number | undefined;
  page: number | undefined;
  cache: number | undefined;
  includeDeleted: number | undefined;
  /**
   * Extra options.
   *
   * Custom extra option come from Request and can be used anywhere you want for your business rules.
   * CrudRequest lib. do not evaluate this attribute.
   */
  extra: ObjectLiteral | undefined;
}
