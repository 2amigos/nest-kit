import { SCondition, QueryFilter } from "./request-query.types";
export type BaseRouteName = "getManyBase" | "getOneBase" | "createOneBase" | "createManyBase" | "updateOneBase" | "replaceOneBase" | "deleteOneBase" | "recoverOneBase";
export type QueryFilterFunction = (search?: SCondition, getMany?: boolean) => SCondition | void;
export type QueryFilterOption = QueryFilter[] | SCondition | QueryFilterFunction;
