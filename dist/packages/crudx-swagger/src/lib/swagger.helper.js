"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swagger = exports.swaggerPkgJson = void 0;
const crudx_1 = require("@2amtech/crudx");
const crudx_2 = require("@2amtech/crudx");
const crudx_3 = require("@2amtech/crudx");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const SWAGGER_CONSTANTS = require("@nestjs/swagger/dist/constants");
const lodash_1 = require("lodash");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluralize = require("pluralize");
exports.swaggerPkgJson = (0, crudx_3.safeRequire)("@nestjs/swagger/package.json", () => require("@nestjs/swagger/package.json"));
class Swagger {
    static operationsMap(modelName) {
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
    static setOperation(metadata, func) {
        crudx_2.R.set(SWAGGER_CONSTANTS.DECORATORS.API_OPERATION, metadata, func);
    }
    static setParams(metadata, func) {
        crudx_2.R.set(SWAGGER_CONSTANTS.DECORATORS.API_PARAMETERS, metadata, func);
    }
    static setExtraModels(swaggerModels) {
        /* istanbul ignore else */
        if (SWAGGER_CONSTANTS) {
            const meta = Swagger.getExtraModels(swaggerModels.get);
            const models = [
                ...meta,
                ...(0, lodash_1.keys)(swaggerModels)
                    .map((name) => swaggerModels[name])
                    .filter((one) => one && one.name !== swaggerModels.get.name),
            ];
            crudx_2.R.set(SWAGGER_CONSTANTS.DECORATORS.API_EXTRA_MODELS, models, swaggerModels.get);
        }
    }
    static setResponseOk(metadata, func) {
        crudx_2.R.set(SWAGGER_CONSTANTS.DECORATORS.API_RESPONSE, metadata, func);
    }
    static getOperation(func) {
        return crudx_2.R.get(SWAGGER_CONSTANTS.DECORATORS.API_OPERATION, func) || {};
    }
    static getParams(func) {
        return crudx_2.R.get(SWAGGER_CONSTANTS.DECORATORS.API_PARAMETERS, func) || [];
    }
    static getExtraModels(target) {
        return crudx_2.R.get(SWAGGER_CONSTANTS.DECORATORS.API_EXTRA_MODELS, target) || [];
    }
    static getResponseOk(func) {
        return crudx_2.R.get(SWAGGER_CONSTANTS.DECORATORS.API_RESPONSE, func) || {};
    }
    static createResponseMeta(name, options, swaggerModels) {
        const { routes, query } = options;
        switch (name) {
            case "getOneBase":
                return {
                    [common_1.HttpStatus.OK]: {
                        description: "Get one base response",
                        type: swaggerModels?.get ?? {},
                    },
                };
            case "getManyBase":
                return {
                    [common_1.HttpStatus.OK]: query?.alwaysPaginate
                        ? {
                            description: "Get paginated response",
                            type: swaggerModels.getMany,
                        }
                        : {
                            description: "Get many base response",
                            schema: {
                                oneOf: [
                                    {
                                        $ref: (0, swagger_1.getSchemaPath)(swaggerModels.getMany.name),
                                    },
                                    {
                                        type: "array",
                                        items: {
                                            $ref: (0, swagger_1.getSchemaPath)(swaggerModels.get.name),
                                        },
                                    },
                                ],
                            },
                        },
                };
            case "createOneBase":
                return {
                    [common_1.HttpStatus.CREATED]: {
                        description: "Get create one base response",
                        schema: {
                            $ref: (0, swagger_1.getSchemaPath)(swaggerModels.create.name),
                        },
                    },
                };
            case "createManyBase":
                return {
                    [common_1.HttpStatus.CREATED]: swaggerModels.createMany
                        ? {
                            description: "Get create many base response",
                            schema: {
                                $ref: (0, swagger_1.getSchemaPath)(swaggerModels.createMany.name),
                            },
                        }
                        : {
                            description: "Get create many base response",
                            schema: {
                                type: "array",
                                items: {
                                    $ref: (0, swagger_1.getSchemaPath)(swaggerModels.create.name),
                                },
                            },
                        },
                };
            case "deleteOneBase":
                return {
                    [common_1.HttpStatus.OK]: routes?.deleteOneBase?.returnDeleted
                        ? {
                            description: "Delete one base response",
                            schema: {
                                $ref: (0, swagger_1.getSchemaPath)(swaggerModels.delete.name),
                            },
                        }
                        : {
                            description: "Delete one base response",
                        },
                };
            case "recoverOneBase":
                return {
                    [common_1.HttpStatus.OK]: routes?.recoverOneBase?.returnRecovered
                        ? {
                            description: "Recover one base response",
                            schema: {
                                $ref: (0, swagger_1.getSchemaPath)(swaggerModels.recover.name),
                            },
                        }
                        : {
                            description: "Recover one base response",
                        },
                };
            default:
                const dto = swaggerModels[name.split("OneBase")[0]];
                return {
                    [common_1.HttpStatus.OK]: {
                        description: "Response",
                        schema: { $ref: (0, swagger_1.getSchemaPath)(dto.name) },
                    },
                };
        }
    }
    static createPathParamsMeta(options) {
        return SWAGGER_CONSTANTS
            ? (0, lodash_1.keys)(options).map((param) => ({
                name: param,
                required: true,
                in: "path",
                type: options[param].type === "number" ? Number : String,
                enum: (0, lodash_1.isArray)(options[param]?.enum)
                    ? Object.values(options[param].enum)
                    : undefined,
            }))
            : [];
    }
    static createQueryParamsMeta(name, options) {
        const { delim: d, delimStr: coma, fields, search, filter, or, join, sort, limit, offset, page, cache, includeDeleted, } = Swagger.getQueryParamsNames();
        const docsLink = (a) => 
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
        const qbOptions = crudx_1.QueryBuilderService.getOptions();
        const name = (n) => {
            const selected = (0, lodash_1.get)(qbOptions, `paramNamesMap[${n}]`);
            return (0, lodash_1.isString)(selected) ? selected : selected?.[0];
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
exports.Swagger = Swagger;
//# sourceMappingURL=swagger.helper.js.map