import { isEqual, isNil, isNumber, isObject, isUndefined, keys } from "lodash";
import { RequestQueryException } from "../exceptions";
import { CustomOperators, ParamOption, ParamsOptions } from "../interfaces";

import {
  ComparisonOperator,
  CondOperator,
  QueryFields,
  QueryFilter,
  QueryJoin,
  QuerySort,
} from "../types";

import {
  isArrayOfStrings,
  isArrayOfStringsFull,
  isStringFull,
} from "./checkers.helper";

export const comparisonOperatorsList: string[] = [
  ...keys(CondOperator).map(
    (n: string) => CondOperator[n as keyof typeof CondOperator]
  ),
];

export const sortOrdersList: string[] = ["ASC", "DESC"];

const sortOrdersListStr: string = sortOrdersList.join();

export function validateFields(fields: QueryFields): void {
  if (!isArrayOfStrings(fields)) {
    throw new RequestQueryException(
      "Invalid fields. Array of strings expected"
    );
  }
}

export function validateCondition(
  val: QueryFilter,
  cond: "filter" | "or" | "search",
  customOperators: CustomOperators
): void {
  if (!isObject(val) || !isStringFull(val.field)) {
    throw new RequestQueryException(
      `Invalid field type in ${cond} condition. String expected`
    );
  }
  validateComparisonOperator(val.operator, customOperators);
}

export function validateComparisonOperator(
  operator: ComparisonOperator,
  customOperators: CustomOperators = {}
): void {
  const extendedComparisonOperatorsList = [
    ...comparisonOperatorsList,
    ...Object.keys(customOperators),
  ];
  if (!extendedComparisonOperatorsList.includes(operator)) {
    throw new RequestQueryException(
      `Invalid comparison operator. ${extendedComparisonOperatorsList.join()} expected`
    );
  }
}

export function validateJoin(join: QueryJoin): void {
  if (!isObject(join) || !isStringFull(join.field)) {
    throw new RequestQueryException("Invalid join field. String expected");
  }
  if (!isUndefined(join.select) && !isArrayOfStringsFull(join.select)) {
    throw new RequestQueryException(
      "Invalid join select. Array of strings expected"
    );
  }
}

export function validateSort(sort: QuerySort): void {
  if (!isObject(sort) || !isStringFull(sort.field)) {
    throw new RequestQueryException("Invalid sort field. String expected");
  }
  if (
    !isEqual(sort.order, sortOrdersList[0]) &&
    !isEqual(sort.order, sortOrdersList[1])
  ) {
    throw new RequestQueryException(
      `Invalid sort order. ${sortOrdersListStr} expected`
    );
  }
}

export function validateNumeric(
  val: number,
  num: "limit" | "offset" | "page" | "cache" | "include_deleted" | string
): void {
  if (!isNumber(val)) {
    throw new RequestQueryException(`Invalid ${num}. Number expected`);
  }
}

export function validateParamOption(
  options: ParamsOptions,
  name: string
): void {
  if (!isObject(options)) {
    throw new RequestQueryException(
      `Invalid param ${name}. Invalid crud options`
    );
  }
  const option: ParamOption = options[name];
  if (option && option.disabled) {
    return;
  }
  if (!isObject(option) || isNil(option.field) || isNil(option.type)) {
    throw new RequestQueryException(`Invalid param option in Crud`);
  }
}

export function validateUUID(str: string, name: string): void {
  const uuid: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const uuidV4: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidV4.test(str) && !uuid.test(str)) {
    throw new RequestQueryException(
      `Invalid param ${name}. UUID string expected`
    );
  }
}
