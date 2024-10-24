import {
  get,
  has,
  isDate,
  isEmpty,
  isNil,
  isObject,
  isString,
  keys,
  set,
} from "lodash";

import { RequestQueryException } from "../exceptions";

import {
  CustomOperators,
  ParamOption,
  ParamsNamesMap,
  ParamsOptions,
  ParsedRequestParams,
  RequestQueryBuilderOptions,
} from "../interfaces";

import {
  ComparisonOperator,
  CondOperator,
  ObjectLiteral,
  QueryExtra,
  QueryFields,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
  SConditionAND,
  SFields,
} from "../types";

import { ClassTransformOptions } from "class-transformer";

import { QueryBuilderService } from "./query-builder.service";
import {
  hasValue,
  isArrayFull,
  isDateString,
  isStringFull,
  validateCondition,
  validateJoin,
  validateNumeric,
  validateParamOption,
  validateSort,
  validateUUID,
} from "../helpers";

import { REQUEST_PREFIX_EXTRA } from "../constants";

export class QueryParserService implements ParsedRequestParams {
  public fields: QueryFields = [];
  public paramsFilter: (QueryFilter | undefined)[] = [];
  public authPersist: ObjectLiteral | undefined = undefined;

  public classTransformOptions: ClassTransformOptions | undefined = undefined;

  public search: SCondition | undefined = undefined;
  public filter: QueryFilter[] = [];
  public or: QueryFilter[] = [];
  public join: QueryJoin[] = [];
  public sort: QuerySort[] = [];
  public limit: number | undefined;
  public offset: number | undefined;
  public page: number | undefined;
  public cache: number | undefined;
  public includeDeleted: number | undefined;
  public extra: QueryExtra = {};

  private _params: any;
  private _query: any;
  private _paramNames: string[] = [];
  private _paramsOptions: ParamsOptions = {};

  private get _options(): RequestQueryBuilderOptions {
    return QueryBuilderService.getOptions();
  }

  static create(): QueryParserService {
    return new QueryParserService();
  }

  getParsed(): ParsedRequestParams {
    return {
      fields: this.fields,
      paramsFilter: this.paramsFilter,
      authPersist: this.authPersist,
      classTransformOptions: this.classTransformOptions,
      search: this.search,
      filter: this.filter,
      or: this.or,
      join: this.join,
      sort: this.sort,
      limit: this.limit,
      offset: this.offset,
      page: this.page,
      cache: this.cache,
      includeDeleted: this.includeDeleted,
      extra: this.extra,
    };
  }

  setAuthPersist(persist: ObjectLiteral = {}) {
    this.authPersist = persist || /* istanbul ignore next */ {};
  }

  setClassTransformOptions(options: ClassTransformOptions = {}) {
    this.classTransformOptions = options || /* istanbul ignore next */ {};
  }

  convertFilterToSearch(filter: QueryFilter): SFields | SConditionAND {
    const isEmptyValue = {
      isnull: true,
      notnull: true,
    };

    return filter
      ? {
          [filter.field]: {
            [filter.operator]: has(isEmptyValue, filter.operator)
              ? get(isEmptyValue, filter.operator)
              : filter.value,
          },
        }
      : /* istanbul ignore next */ {};
  }

  parseQuery(query: any, customOperators: CustomOperators = {}): this {
    if (isObject(query)) {
      const paramNames: string[] = keys(query);

      if (!isEmpty(paramNames)) {
        this._query = query;
        this._paramNames = paramNames;
        const searchData = this._query[this.getParamNames("search")[0]];
        this.search = this.parseSearchQueryParam(searchData) as any;
        if (isNil(this.search)) {
          this.filter = this.parseQueryParam(
            "filter",
            this.conditionParser.bind(this, "filter", customOperators)
          );
          this.or = this.parseQueryParam(
            "or",
            this.conditionParser.bind(this, "or", customOperators)
          );
        }
        this.fields =
          this.parseQueryParam("fields", this.fieldsParser.bind(this))[0] || [];
        this.join = this.parseQueryParam("join", this.joinParser.bind(this));
        this.sort = this.parseQueryParam("sort", this.sortParser.bind(this));
        this.limit = this.parseQueryParam(
          "limit",
          this.numericParser.bind(this, "limit")
        )[0];
        this.offset = this.parseQueryParam(
          "offset",
          this.numericParser.bind(this, "offset")
        )[0];
        this.page = this.parseQueryParam(
          "page",
          this.numericParser.bind(this, "page")
        )[0];
        this.cache = this.parseQueryParam(
          "cache",
          this.numericParser.bind(this, "cache")
        )[0];
        this.includeDeleted = this.parseQueryParam(
          "includeDeleted",
          this.numericParser.bind(this, "includeDeleted")
        )[0];

        this.extra = this.parseExtraFromQueryParam();
      }
    }

    return this;
  }

  parseParams(params: any, options: ParamsOptions): this {
    if (isObject(params)) {
      const paramNames: string[] = keys(params);

      if (!isNil(paramNames)) {
        this._params = params;
        this._paramsOptions = options;
        this.paramsFilter = paramNames
          .map((name: string) => this.paramParser(name))
          .filter((filter: QueryFilter | undefined) => filter);
      }
    }

    return this;
  }

  private getParamNames(type: keyof ParamsNamesMap): string[] {
    return this._paramNames.filter((p: string): boolean => {
      const name: string | string[] = get(
        this._options.paramNamesMap,
        type,
        ""
      );
      return isString(name)
        ? name === p
        : (name as string[]).some((m: string): boolean => m === p);
    });
  }

  private getParamValues(value: string | string[], parser: Function): any[] {
    if (isStringFull(value)) {
      return [parser.call(this, value)];
    }

    if (isArrayFull(value)) {
      return (value as string[]).map((val: string) => parser(val));
    }

    return [];
  }

  private parseQueryParam(type: keyof ParamsNamesMap, parser: Function): any[] {
    const param: string[] = this.getParamNames(type);

    if (isArrayFull(param)) {
      // @ts-ignore
      return param.reduce(
        // @ts-ignore
        (a: [], name: string): string[] => [
          ...a,
          ...this.getParamValues(this._query[name], parser),
        ],
        []
      );
    }

    return [];
  }

  private parseExtraFromQueryParam(): QueryExtra {
    const extraParam: string | string[] | [] = get(
      this._options.paramNamesMap,
      "extra",
      []
    );
    const params: string[] = Array.isArray(extraParam)
      ? extraParam
      : [extraParam];
    const extraKeys: {} = keys(this._query || {})
      .filter((k: string) => params.find((p: string) => k?.startsWith(p)))
      .reduce((o: {}, k: string) => {
        const key: string = k.replace(REQUEST_PREFIX_EXTRA, "");
        this.parseDotChainToObject(this._query[k], key, o);
        return o;
      }, {});
    return keys(extraKeys).length > 0 ? extraKeys : undefined;
  }

  /**
   * Build an object from data and composite key.
   *
   * @param data to used on parse workflow
   * @param key composite key as 'foo.bar.hero'
   * @param result object with parsed "data" and "key" structure
   * @private
   */
  private parseDotChainToObject(data: any, key: string, result: {} = {}): void {
    if (key.includes(".")) {
      const keys: string[] = key.split(".");
      const firstKey: string | undefined = keys.shift();
      set(result, firstKey as string, {});
      this.parseDotChainToObject(
        data,
        keys.join("."),
        get(result, firstKey as string)
      );
    } else {
      set(result, key, this.parseValue(data));
    }
  }

  private parseValue(val: any) {
    try {
      const parsed = JSON.parse(val);

      // throw new Error('Don\'t support object now')
      if (
        (!isDate(parsed) && isObject(parsed)) ||
        // JS cannot handle big numbers. Leave it as a string to prevent data loss
        (typeof parsed === "number" &&
          parsed.toLocaleString("fullwide", { useGrouping: false }) !== val)
      ) {
        return val;
      }
      return parsed;
    } catch (_) {
      if (isDateString(val)) {
        return new Date(val);
      }
      return val;
    }
  }

  private parseValues(values: any) {
    return isArrayFull(values)
      ? values.map((v: any) => this.parseValue(v))
      : this.parseValue(values);
  }

  private parseSearchQueryParam(d: any): SCondition | undefined {
    if (isNil(d)) {
      return undefined;
    }
    try {
      const data = JSON.parse(d);

      if (!isObject(data)) {
        throw new Error();
      }

      return data;
    } catch (_) {
      throw new RequestQueryException("Invalid search param. JSON expected");
    }
  }

  private fieldsParser(data: string): QueryFields {
    // @ts-ignore
    return data.split(this._options.delimStr);
  }

  private conditionParser(
    cond: "filter" | "or" | "search",
    customOperators: CustomOperators,
    data: string
  ): QueryFilter {
    const isArrayValue: string[] = [
      CondOperator.IN as string,
      CondOperator.NOT_IN as string,
      CondOperator.BETWEEN as string,
      CondOperator.IN_LOW as string,
      CondOperator.NOT_IN_LOW as string,
    ].concat(
      Object.keys(customOperators).filter(
        (op: string) => customOperators[op].isArray
      )
    );
    const isEmptyValue: string[] = [
      CondOperator.IS_NULL as string,
      CondOperator.NOT_NULL as string,
    ];
    // @ts-ignore
    const param: string[] = data.split(this._options.delim);
    const field: string = param[0];
    const operator: string = param[1] as ComparisonOperator;
    let value: string = param[2] || "";

    if (isArrayValue.some((name: string): boolean => name === operator)) {
      // @ts-ignore
      value = value.split(this._options.delimStr) as any;
    }

    value = this.parseValues(value);

    if (
      !isEmptyValue.some((name: string): boolean => name === operator) &&
      !hasValue(value)
    ) {
      throw new RequestQueryException(`Invalid ${cond} value`);
    }

    const condition: QueryFilter = { field, operator, value };
    validateCondition(condition, cond, customOperators);

    return condition;
  }

  private joinParser(data: string): QueryJoin {
    // @ts-ignore
    const param: string[] = data.split(this._options.delim);

    const join: QueryJoin = {
      field: param[0],
      select: isStringFull(param[1])
        ? // @ts-ignore
          param[1].split(this._options.delimStr)
        : undefined,
    };
    validateJoin(join);

    return join;
  }

  private sortParser(data: string): QuerySort {
    const param: string[] = data.split(this._options.delimStr);
    const sort: QuerySort = {
      field: param[0],
      order: param[1] as any,
    };
    validateSort(sort);

    return sort;
  }

  private numericParser(
    num: "limit" | "offset" | "page" | "cache" | "includeDeleted",
    data: string
  ): number {
    const val = this.parseValue(data);
    validateNumeric(val, num);

    return val;
  }

  private paramParser(name: string): QueryFilter | undefined {
    validateParamOption(this._paramsOptions, name);
    const option: ParamOption = this._paramsOptions[name];

    if (option.disabled) {
      return undefined;
    }

    let value = this._params[name];

    switch (option.type) {
      case "number":
        value = this.parseValue(value);
        validateNumeric(value, `param ${name}`);
        break;
      case "uuid":
        validateUUID(value, name);
        break;
      default:
        break;
    }

    return { field: option.field as string, operator: "$eq", value };
  }
}
