import { QueryBuilderService } from "@2amtech/crudx";
import {
  MergedCrudOptions,
  ParamsOptions,
  RequestQueryBuilderOptions,
} from "@2amtech/crudx";
import { BaseRouteName } from "@2amtech/crudx";
import { R } from "@2amtech/crudx";
import { safeRequire } from "@2amtech/crudx";
import { HttpStatus } from "@nestjs/common";
import { getSchemaPath } from "@nestjs/swagger";
import * as SWAGGER_CONSTANTS from "@nestjs/swagger/dist/constants";
import { get, isArray, isString, keys } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluralize = require("pluralize");

export const swaggerPkgJson = safeRequire("@nestjs/swagger/package.json", () =>
  require("@nestjs/swagger/package.json")
);

export class Swagger {
  static operationsMap(modelName: string): { [key in BaseRouteName]: string } {
    return {
      getManyBase: `Retrieve multiple ${pluralize(modelName)}`,
      getOneBase: `Retrieve a single ${modelName}`,
      createManyBase: `Create multiple ${pluralize(modelName)}`,
      createOneBase: `Create a single ${modelName}`,
      updateOneBase: `Update a single ${modelName}`,
      replaceOneBase: `Replace a single ${modelName}`,
      deleteOneBase: `Delete a single ${modelName}`,
      recoverOneBase: `Recover one ${modelName}`,
    };
  }

  static setOperation(metadata: any, func: Function) {
    R.set(SWAGGER_CONSTANTS.DECORATORS.API_OPERATION, metadata, func);
  }

  static setParams(metadata: any, func: Function) {
    R.set(SWAGGER_CONSTANTS.DECORATORS.API_PARAMETERS, metadata, func);
  }

  static setExtraModels(swaggerModels: any) {
    /* istanbul ignore else */
    if (SWAGGER_CONSTANTS) {
      const meta = Swagger.getExtraModels(swaggerModels.get);
      const models: any[] = [
        ...meta,
        ...keys(swaggerModels)
          .map((name) => swaggerModels[name])
          .filter((one) => one && one.name !== swaggerModels.get.name),
      ];
      R.set(
        SWAGGER_CONSTANTS.DECORATORS.API_EXTRA_MODELS,
        models,
        swaggerModels.get
      );
    }
  }

  static setResponseOk(metadata: any, func: Function) {
    R.set(SWAGGER_CONSTANTS.DECORATORS.API_RESPONSE, metadata, func);
  }

  static getOperation(func: Function): any {
    return R.get(SWAGGER_CONSTANTS.DECORATORS.API_OPERATION, func) || {};
  }

  static getParams(func: Function): any[] {
    return R.get(SWAGGER_CONSTANTS.DECORATORS.API_PARAMETERS, func) || [];
  }

  static getExtraModels(target: any): any[] {
    return R.get(SWAGGER_CONSTANTS.DECORATORS.API_EXTRA_MODELS, target) || [];
  }

  static getResponseOk(func: Function): any {
    return R.get(SWAGGER_CONSTANTS.DECORATORS.API_RESPONSE, func) || {};
  }

  static createResponseMeta(
    name: BaseRouteName,
    options: MergedCrudOptions,
    swaggerModels: any
  ): any {
    const { routes, query } = options;

    switch (name) {
      case "getOneBase":
        return {
          [HttpStatus.OK]: {
            description: "Get one base response",
            type: swaggerModels?.get ?? {},
          },
        };
      case "getManyBase":
        return {
          [HttpStatus.OK]: query?.alwaysPaginate
            ? {
                description: "Get paginated response",
                type: swaggerModels.getMany,
              }
            : {
                description: "Get many base response",
                schema: {
                  oneOf: [
                    {
                      $ref: getSchemaPath(swaggerModels.getMany.name),
                    },
                    {
                      type: "array",
                      items: {
                        $ref: getSchemaPath(swaggerModels.get.name),
                      },
                    },
                  ],
                },
              },
        };
      case "createOneBase":
        return {
          [HttpStatus.CREATED]: {
            description: "Get create one base response",
            schema: {
              $ref: getSchemaPath(swaggerModels.create.name),
            },
          },
        };
      case "createManyBase":
        return {
          [HttpStatus.CREATED]: swaggerModels.createMany
            ? {
                description: "Get create many base response",
                schema: {
                  $ref: getSchemaPath(swaggerModels.createMany.name),
                },
              }
            : {
                description: "Get create many base response",
                schema: {
                  type: "array",
                  items: {
                    $ref: getSchemaPath(swaggerModels.create.name),
                  },
                },
              },
        };
      case "deleteOneBase":
        return {
          [HttpStatus.OK]: routes?.deleteOneBase?.returnDeleted
            ? {
                description: "Delete one base response",
                schema: {
                  $ref: getSchemaPath(swaggerModels.delete.name),
                },
              }
            : {
                description: "Delete one base response",
              },
        };
      case "recoverOneBase":
        return {
          [HttpStatus.OK]: routes?.recoverOneBase?.returnRecovered
            ? {
                description: "Recover one base response",
                schema: {
                  $ref: getSchemaPath(swaggerModels.recover.name),
                },
              }
            : {
                description: "Recover one base response",
              },
        };
      default:
        const dto = swaggerModels[name.split("OneBase")[0]];
        return {
          [HttpStatus.OK]: {
            description: "Response",
            schema: { $ref: getSchemaPath(dto.name) },
          },
        };
    }
  }

  static createPathParamsMeta(options: ParamsOptions): any[] {
    return SWAGGER_CONSTANTS
      ? keys(options).map((param) => ({
          name: param,
          required: true,
          in: "path",
          type: options[param].type === "number" ? Number : String,
          enum: isArray(options[param]?.enum)
            ? Object.values(<Array<string>>options[param].enum)
            : undefined,
        }))
      : [];
  }

  static createQueryParamsMeta(
    name: BaseRouteName,
    options: MergedCrudOptions
  ) {
    const {
      delim: d,
      delimStr: coma,
      fields,
      search,
      filter,
      or,
      join,
      sort,
      limit,
      offset,
      page,
      cache,
      includeDeleted,
    } = Swagger.getQueryParamsNames();
    const docsLink = (a: string) =>
      // TODO: to modify
      `<a href="https://github.com/2am.tech/crudx/wiki/Requests#${a}" target="_blank">Docs</a>`;

    const fieldsMetaBase = {
      name: fields,
      description: `Selects resource fields. ${docsLink("select")}`,
      required: false,
      in: "query",
    };
    const fieldsMeta = {
      ...fieldsMetaBase,
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
      style: "form",
      explode: false,
    };

    const searchMetaBase = {
      name: search,
      description: `Adds search condition. ${docsLink("search")}`,
      required: false,
      in: "query",
    };

    const searchMeta = { ...searchMetaBase, schema: { type: "string" } };

    const filterMetaBase = {
      name: filter,
      description: `Adds filter condition. ${docsLink("filter")}`,
      required: false,
      in: "query",
    };

    const filterMeta = {
      ...filterMetaBase,
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
      style: "form",
      explode: true,
    };

    const orMetaBase = {
      name: or,
      description: `Adds OR condition. ${docsLink("or")}`,
      required: false,
      in: "query",
    };

    const orMeta = {
      ...orMetaBase,
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
      style: "form",
      explode: true,
    };

    const sortMetaBase = {
      name: sort,
      description: `Adds sort by field. ${docsLink("sort")}`,
      required: false,
      in: "query",
    };

    const sortMeta = {
      ...sortMetaBase,
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
      style: "form",
      explode: true,
    };

    const joinMetaBase = {
      name: join,
      description: `Adds relational resources. ${docsLink("join")}`,
      required: false,
      in: "query",
    };

    const joinMeta = {
      ...joinMetaBase,
      schema: {
        type: "array",
        items: {
          type: "string",
        },
      },
      style: "form",
      explode: true,
    };

    const limitMetaBase = {
      name: limit,
      description: `Limit amount of resources. ${docsLink("limit")}`,
      required: false,
      in: "query",
    };

    const limitMeta = { ...limitMetaBase, schema: { type: "integer" } };

    const offsetMetaBase = {
      name: offset,
      description: `Offset amount of resources. ${docsLink("offset")}`,
      required: false,
      in: "query",
    };

    const offsetMeta = { ...offsetMetaBase, schema: { type: "integer" } };

    const pageMetaBase = {
      name: page,
      description: `Page portion of resources. ${docsLink("page")}`,
      required: false,
      in: "query",
    };

    const pageMeta = { ...pageMetaBase, schema: { type: "integer" } };

    const cacheMetaBase = {
      name: cache,
      description: `Reset cache (if was enabled). ${docsLink("cache")}`,
      required: false,
      in: "query",
    };

    const cacheMeta = {
      ...cacheMetaBase,
      schema: { type: "integer", minimum: 0, maximum: 1 },
    };

    const includeDeletedMetaBase = {
      name: includeDeleted,
      description: `Include deleted. ${docsLink("includeDeleted")}`,
      required: false,
      in: "query",
    };

    const includeDeletedMeta = {
      ...includeDeletedMetaBase,
      schema: { type: "integer", minimum: 0, maximum: 1 },
    };

    switch (name) {
      case "getManyBase":
        return options.query?.softDelete
          ? [
              fieldsMeta,
              searchMeta,
              filterMeta,
              orMeta,
              sortMeta,
              joinMeta,
              limitMeta,
              offsetMeta,
              pageMeta,
              cacheMeta,
              includeDeletedMeta,
            ]
          : [
              fieldsMeta,
              searchMeta,
              filterMeta,
              orMeta,
              sortMeta,
              joinMeta,
              limitMeta,
              offsetMeta,
              pageMeta,
              cacheMeta,
            ];
      case "getOneBase":
        return options.query?.softDelete
          ? [fieldsMeta, joinMeta, cacheMeta, includeDeletedMeta]
          : [fieldsMeta, joinMeta, cacheMeta];
      default:
        return [];
    }
  }

  static getQueryParamsNames() {
    const qbOptions: RequestQueryBuilderOptions =
      QueryBuilderService.getOptions();
    const name = (n: any) => {
      const selected = get(qbOptions, `paramNamesMap[${n}]`);
      return isString(selected) ? selected : selected?.[0];
    };

    return {
      delim: qbOptions.delim,
      delimStr: qbOptions.delimStr,
      fields: name("fields"),
      search: name("search"),
      filter: name("filter"),
      or: name("or"),
      join: name("join"),
      sort: name("sort"),
      limit: name("limit"),
      offset: name("offset"),
      page: name("page"),
      cache: name("cache"),
      includeDeleted: name("includeDeleted"),
    };
  }
}
