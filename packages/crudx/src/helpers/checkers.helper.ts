import {
  every,
  isEqual,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isNumber,
  isString,
  keys,
  isNil,
} from "lodash";

export const isArrayOfStrings = (arr: unknown[]): boolean => {
  return isArray(arr) && every(arr, isString);
};
export const isArrayFull = (val: any): boolean =>
  Array.isArray(val) && !isEmpty(val);

export const isStringFull = (val: unknown): boolean =>
  isString(val) && !isEmpty(val);

export const isArrayOfStringsFull = (val: any): boolean =>
  isArrayFull(val) && (val as string[]).every((v: string) => isStringFull(v));

export const isValue = (val: any): boolean =>
  isStringFull(val) || isNumber(val) || isBoolean(val) || isDate(val);
export const hasValue = (val: any): boolean =>
  isArrayFull(val) ? (val as any[]).every((o) => isValue(o)) : isValue(val);

export const isDateString = (val: any): boolean => {
  const timestamp: number = Date.parse(val);
  return !isNaN(timestamp) && isDate(new Date(timestamp));
};

export const isFalse = (val: any): boolean => val === false;

export const isTrue = (val: any): boolean => val === true;

export const isIn = (val: any, arr: any[] = []): boolean =>
  arr.some((o) => isEqual(val, o));

export const isObject = (val: any): boolean =>
  typeof val === "object" && !isNil(val);
export const isObjectFull = (val: any) => isObject(val) && keys(val).length > 0;
