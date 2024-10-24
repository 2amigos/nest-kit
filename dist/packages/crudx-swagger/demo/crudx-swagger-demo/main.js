/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(3), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(13), exports);
tslib_1.__exportStar(__webpack_require__(24), exports);
tslib_1.__exportStar(__webpack_require__(10), exports);
tslib_1.__exportStar(__webpack_require__(39), exports);
tslib_1.__exportStar(__webpack_require__(52), exports);
tslib_1.__exportStar(__webpack_require__(6), exports);
tslib_1.__exportStar(__webpack_require__(26), exports);


/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("tslib");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(4), exports);
tslib_1.__exportStar(__webpack_require__(47), exports);
tslib_1.__exportStar(__webpack_require__(48), exports);
tslib_1.__exportStar(__webpack_require__(49), exports);
tslib_1.__exportStar(__webpack_require__(50), exports);
tslib_1.__exportStar(__webpack_require__(51), exports);


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Crud = void 0;
const lodash_1 = __webpack_require__(5);
const services_1 = __webpack_require__(6);
const Crud = (options) => (target) => {
    const factoryMethod = options.routesFactory || services_1.RoutesFactoryService;
    const factory = (0, lodash_1.isUndefined)(services_1.CrudConfigService.config?.routesFactory)
        ? new factoryMethod(target, options)
        : new services_1.CrudConfigService.config.routesFactory(target, options);
};
exports.Crud = Crud;


/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("lodash");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(7), exports);
tslib_1.__exportStar(__webpack_require__(9), exports);
tslib_1.__exportStar(__webpack_require__(34), exports);
tslib_1.__exportStar(__webpack_require__(37), exports);
tslib_1.__exportStar(__webpack_require__(38), exports);
tslib_1.__exportStar(__webpack_require__(44), exports);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudService = void 0;
const common_1 = __webpack_require__(8);
const lodash_1 = __webpack_require__(5);
class CrudService {
    throwBadRequestException(msg) {
        throw new common_1.BadRequestException(msg);
    }
    throwNotFoundException(name) {
        throw new common_1.NotFoundException(`${name} not found`);
    }
    /**
     * Wrap page into page-info
     * override this method to create custom page-info response
     * or set custom `serialize.getMany` dto in the controller's CrudOption
     * @param data
     * @param total
     * @param limit
     * @param offset
     */
    createPageInfo(data, total, limit, offset) {
        return {
            data,
            count: data.length,
            total,
            page: limit ? Math.floor(offset / limit) + 1 : 1,
            pageCount: limit && total ? Math.ceil(total / limit) : 1,
        };
    }
    /**
     * Determine if need paging
     * @param parsed
     * @param options
     */
    decidePagination(parsed, options) {
        return (options.query?.alwaysPaginate ||
            ((Number.isFinite(parsed.page) || Number.isFinite(parsed.offset)) &&
                !!this.getTake(parsed, options.query)));
    }
    /**
     * Get number of resources to be fetched
     * @param query
     * @param options
     */
    getTake(query, options) {
        if (query.limit) {
            return options.maxLimit
                ? query.limit <= options.maxLimit
                    ? query.limit
                    : options.maxLimit
                : query.limit;
        }
        /* istanbul ignore if */
        if (options.limit) {
            return options.maxLimit
                ? options.limit <= options.maxLimit
                    ? options.limit
                    : options.maxLimit
                : options.limit;
        }
        return options.maxLimit ? options.maxLimit : null;
    }
    /**
     * Get number of resources to be skipped
     * @param query
     * @param take
     */
    getSkip(query, take) {
        return query.page && take
            ? take * (query.page - 1)
            : query.offset
                ? query.offset
                : null;
    }
    /**
     * Get primary param name from CrudOptions
     * @param options
     */
    getPrimaryParams(options) {
        if ((0, lodash_1.isEmpty)(options.params)) {
            return [];
        }
        // @ts-ignore
        return (0, lodash_1.keys)(options.params)
            .filter((n) => (0, lodash_1.get)(options, `params[${n}].primary`, false))
            .map((p) => (0, lodash_1.get)(options, `params[${p}].field`));
    }
}
exports.CrudService = CrudService;


/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/common");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudConfigService = void 0;
const lodash_1 = __webpack_require__(5);
const helpers_1 = __webpack_require__(10);
const query_builder_service_1 = __webpack_require__(34);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = __webpack_require__(36);
class CrudConfigService {
    static load(config = {}) {
        const auth = (0, helpers_1.isObjectFull)(config.auth) ? config.auth : {};
        const query = (0, helpers_1.isObjectFull)(config.query) ? config.query : {};
        const routes = (0, helpers_1.isObjectFull)(config.routes) ? config.routes : {};
        const operators = (0, helpers_1.isObjectFull)(config.operators) ? config.operators : {};
        const params = (0, helpers_1.isObjectFull)(config.params) ? config.params : {};
        const serialize = (0, helpers_1.isObjectFull)(config.serialize) ? config.serialize : {};
        const routesFactory = !(0, lodash_1.isUndefined)(config.routesFactory) ? config.routesFactory : undefined;
        if ((0, helpers_1.isObjectFull)(config.queryParser)) {
            query_builder_service_1.QueryBuilderService.setOptions({
                ...config.queryParser,
            });
        }
        CrudConfigService.config = deepmerge(CrudConfigService.config, { auth, query, routes, operators, params, serialize, routesFactory }, 
        // @ts-ignore
        { arrayMerge: (destinationArray, sourceArray, _options) => sourceArray });
    }
}
exports.CrudConfigService = CrudConfigService;
CrudConfigService.config = {
    auth: {},
    query: {
        alwaysPaginate: false,
    },
    operators: {},
    routes: {
        getManyBase: { interceptors: [], decorators: [] },
        getOneBase: { interceptors: [], decorators: [] },
        createOneBase: { interceptors: [], decorators: [], returnShallow: false },
        createManyBase: { interceptors: [], decorators: [] },
        updateOneBase: {
            interceptors: [],
            decorators: [],
            allowParamsOverride: false,
            returnShallow: false,
        },
        replaceOneBase: {
            interceptors: [],
            decorators: [],
            allowParamsOverride: false,
            returnShallow: false,
        },
        deleteOneBase: { interceptors: [], decorators: [], returnDeleted: false },
        recoverOneBase: {
            interceptors: [],
            decorators: [],
            returnRecovered: false,
        },
    },
    params: {},
    routesFactory: undefined,
};


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(11), exports);
tslib_1.__exportStar(__webpack_require__(12), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(23), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);
tslib_1.__exportStar(__webpack_require__(32), exports);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isObjectFull = exports.isObject = exports.isIn = exports.isTrue = exports.isFalse = exports.isDateString = exports.hasValue = exports.isValue = exports.isArrayOfStringsFull = exports.isStringFull = exports.isArrayFull = exports.isArrayOfStrings = void 0;
const lodash_1 = __webpack_require__(5);
const isArrayOfStrings = (arr) => {
    return (0, lodash_1.isArray)(arr) && (0, lodash_1.every)(arr, lodash_1.isString);
};
exports.isArrayOfStrings = isArrayOfStrings;
const isArrayFull = (val) => Array.isArray(val) && !(0, lodash_1.isEmpty)(val);
exports.isArrayFull = isArrayFull;
const isStringFull = (val) => (0, lodash_1.isString)(val) && !(0, lodash_1.isEmpty)(val);
exports.isStringFull = isStringFull;
const isArrayOfStringsFull = (val) => (0, exports.isArrayFull)(val) && val.every((v) => (0, exports.isStringFull)(v));
exports.isArrayOfStringsFull = isArrayOfStringsFull;
const isValue = (val) => (0, exports.isStringFull)(val) || (0, lodash_1.isNumber)(val) || (0, lodash_1.isBoolean)(val) || (0, lodash_1.isDate)(val);
exports.isValue = isValue;
const hasValue = (val) => (0, exports.isArrayFull)(val) ? val.every((o) => (0, exports.isValue)(o)) : (0, exports.isValue)(val);
exports.hasValue = hasValue;
const isDateString = (val) => {
    const timestamp = Date.parse(val);
    return !isNaN(timestamp) && (0, lodash_1.isDate)(new Date(timestamp));
};
exports.isDateString = isDateString;
const isFalse = (val) => val === false;
exports.isFalse = isFalse;
const isTrue = (val) => val === true;
exports.isTrue = isTrue;
const isIn = (val, arr = []) => arr.some((o) => (0, lodash_1.isEqual)(val, o));
exports.isIn = isIn;
const isObject = (val) => typeof val === "object" && !(0, lodash_1.isNil)(val);
exports.isObject = isObject;
const isObjectFull = (val) => (0, exports.isObject)(val) && (0, lodash_1.keys)(val).length > 0;
exports.isObjectFull = isObjectFull;


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createBulkDto = exports.getValidationPipe = exports.BulkDto = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const helpers_1 = __webpack_require__(10);
const lodash_1 = __webpack_require__(5);
const enums_1 = __webpack_require__(13);
const swagger_1 = __webpack_require__(16);
const class_validator_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(18);
class BulkDto {
}
exports.BulkDto = BulkDto;
const getValidationPipe = (options, group) => {
    return !(0, helpers_1.isFalse)(options.validation)
        ? new common_1.ValidationPipe({
            ...(options.validation || {}),
            groups: group ? [group] : undefined,
        })
        : undefined;
};
exports.getValidationPipe = getValidationPipe;
const createBulkDto = (options) => {
    if (!(0, helpers_1.isFalse)(options.validation)) {
        const hasDto = !(0, lodash_1.isNil)(options.dto?.create);
        const groups = !hasDto
            ? [enums_1.CrudValidationGroups.CREATE]
            : undefined;
        const always = hasDto ? true : undefined;
        const Model = hasDto ? options.dto?.create : options.model.type;
        class BulkDtoImpl {
        }
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: Model, isArray: true }),
            (0, class_validator_1.IsArray)({ groups, always }),
            (0, class_validator_1.ArrayNotEmpty)({ groups, always }),
            (0, class_validator_1.ValidateNested)({ each: true, groups, always }),
            (0, class_transformer_1.Type)(() => Model)
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Array)
        ], BulkDtoImpl.prototype, "bulk", void 0);
        Object.defineProperty(BulkDtoImpl, "name", {
            writable: false,
            value: `CreateMany${options.model.type.name}Dto`,
        });
        return BulkDtoImpl;
    }
    else {
        return BulkDto;
    }
};
exports.createBulkDto = createBulkDto;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(14), exports);
tslib_1.__exportStar(__webpack_require__(15), exports);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudActions = void 0;
var CrudActions;
(function (CrudActions) {
    CrudActions["ReadAll"] = "Read-All";
    CrudActions["ReadOne"] = "Read-One";
    CrudActions["CreateOne"] = "Create-One";
    CrudActions["CreateMany"] = "Create-Many";
    CrudActions["UpdateOne"] = "Update-One";
    CrudActions["ReplaceOne"] = "Replace-One";
    CrudActions["DeleteOne"] = "Delete-One";
    CrudActions["DeleteAll"] = "Delete-All";
    CrudActions["RecoverOne"] = "Recover-One";
})(CrudActions || (exports.CrudActions = CrudActions = {}));


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudValidationGroups = void 0;
var CrudValidationGroups;
(function (CrudValidationGroups) {
    CrudValidationGroups["CREATE"] = "CRUD-CREATE";
    CrudValidationGroups["UPDATE"] = "CRUD-UPDATE";
})(CrudValidationGroups || (exports.CrudValidationGroups = CrudValidationGroups = {}));


/***/ }),
/* 16 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/swagger");

/***/ }),
/* 17 */
/***/ ((module) => {

"use strict";
module.exports = require("class-validator");

/***/ }),
/* 18 */
/***/ ((module) => {

"use strict";
module.exports = require("class-transformer");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.R = void 0;
const route_paramtypes_enum_1 = __webpack_require__(20);
const constants_1 = __webpack_require__(21);
const lodash_1 = __webpack_require__(5);
const constants_2 = __webpack_require__(22);
class R {
    static set(metadataKey, metadataValue, target, propertyKey = undefined) {
        if (propertyKey) {
            Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        else {
            Reflect.defineMetadata(metadataKey, metadataValue, target);
        }
    }
    static get(metadataKey, target, propertyKey = undefined) {
        return propertyKey
            ? Reflect.getMetadata(metadataKey, target, propertyKey)
            : Reflect.getMetadata(metadataKey, target);
    }
    static createCustomRouteArg(paramType, index, pipes = [], data = undefined) {
        // @ts-ignore
        return {
            [`${paramType}${constants_1.CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
                index,
                factory: (_, ctx) => R.getContextRequest(ctx)[paramType],
                data,
                pipes,
            },
        };
    }
    static createRouteArg(paramTypes, index, pipes = [], data = undefined) {
        return {
            [`${paramTypes}:${index}`]: {
                index,
                pipes,
                data,
            },
        };
    }
    static setDecorators(decorators, target, name) {
        // this makes metadata decorator works
        const decoratedDescriptor = Reflect.decorate(decorators, target, name, Reflect.getOwnPropertyDescriptor(target, name));
        // this makes proxy decorator works
        Reflect.defineProperty(target, name, decoratedDescriptor);
    }
    static setParsedRequestArg(index) {
        return R.createCustomRouteArg(constants_2.PARSED_CRUD_REQUEST_KEY, index);
    }
    static setBodyArg(index, pipes = []) {
        return R.createRouteArg(route_paramtypes_enum_1.RouteParamtypes.BODY, index, pipes);
    }
    static setCrudOptions(options, target) {
        R.set(constants_2.CRUD_OPTIONS_METADATA, options, target);
    }
    static setRoute(route, func) {
        R.set(constants_1.PATH_METADATA, route.path, func);
        R.set(constants_1.METHOD_METADATA, route.method, func);
    }
    static setInterceptors(interceptors, func) {
        R.set(constants_1.INTERCEPTORS_METADATA, interceptors, func);
    }
    static setRouteArgs(metadata, target, name) {
        R.set(constants_1.ROUTE_ARGS_METADATA, metadata, target, name);
    }
    static setRouteArgsTypes(metadata, target, name) {
        R.set(constants_1.PARAMTYPES_METADATA, metadata, target, name);
    }
    static setAction(action, func) {
        R.set(constants_2.ACTION_NAME_METADATA, action, func);
    }
    static setCrudAuthOptions(metadata, target) {
        R.set(constants_2.CRUD_AUTH_OPTIONS_METADATA, metadata, target);
    }
    static getCrudAuthOptions(target) {
        return R.get(constants_2.CRUD_AUTH_OPTIONS_METADATA, target);
    }
    static getCrudOptions(target) {
        return R.get(constants_2.CRUD_OPTIONS_METADATA, target);
    }
    static getAction(func) {
        return R.get(constants_2.ACTION_NAME_METADATA, func);
    }
    static getOverrideRoute(func) {
        return R.get(constants_2.OVERRIDE_METHOD_METADATA, func);
    }
    static getInterceptors(func) {
        return R.get(constants_1.INTERCEPTORS_METADATA, func) || [];
    }
    static getRouteArgs(target, name) {
        return R.get(constants_1.ROUTE_ARGS_METADATA, target, name);
    }
    static getRouteArgsTypes(target, name) {
        return R.get(constants_1.PARAMTYPES_METADATA, target, name) || [];
    }
    static getParsedBody(func) {
        return R.get(constants_2.PARSED_BODY_METADATA, func);
    }
    static getContextRequest(ctx) {
        return (0, lodash_1.isFunction)(ctx.switchToHttp) ? ctx.switchToHttp().getRequest() : ctx;
    }
}
exports.R = R;


/***/ }),
/* 20 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/common/enums/route-paramtypes.enum");

/***/ }),
/* 21 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/common/constants");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CRUD_AUTH_OPTIONS_METADATA = exports.CRUD_OPTIONS_METADATA = exports.PARSED_CRUD_REQUEST_KEY = exports.PARSED_BODY_METADATA = exports.OVERRIDE_METHOD_METADATA = exports.ACTION_NAME_METADATA = exports.FEATURE_NAME_METADATA = exports.REQUEST_PREFIX_EXTRA = exports.REQUEST_DELIM_STR = exports.REQUEST_DELIM = void 0;
exports.REQUEST_DELIM = "||";
exports.REQUEST_DELIM_STR = ",";
exports.REQUEST_PREFIX_EXTRA = "extra.";
exports.FEATURE_NAME_METADATA = "CRUDX_FEATURE_NAME_METADATA";
exports.ACTION_NAME_METADATA = "CRUDX_ACTION_NAME_METADATA";
exports.OVERRIDE_METHOD_METADATA = "CRUDX_OVERRIDE_METHOD_METADATA";
exports.PARSED_BODY_METADATA = "CRUDX_PARSED_BODY_METADATA";
exports.PARSED_CRUD_REQUEST_KEY = "CRUDX_PARSED_CRUD_REQUEST_KEY";
exports.CRUD_OPTIONS_METADATA = "CRUDX_CRUD_OPTIONS_METADATA";
exports.CRUD_AUTH_OPTIONS_METADATA = "CRUDX_CRUD_AUTH_OPTIONS_METADATA";


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateUUID = exports.validateParamOption = exports.validateNumeric = exports.validateSort = exports.validateJoin = exports.validateComparisonOperator = exports.validateCondition = exports.validateFields = exports.sortOrdersList = exports.comparisonOperatorsList = void 0;
const lodash_1 = __webpack_require__(5);
const exceptions_1 = __webpack_require__(24);
const types_1 = __webpack_require__(26);
const checkers_helper_1 = __webpack_require__(11);
exports.comparisonOperatorsList = [
    ...(0, lodash_1.keys)(types_1.CondOperator).map((n) => types_1.CondOperator[n]),
];
exports.sortOrdersList = ["ASC", "DESC"];
const sortOrdersListStr = exports.sortOrdersList.join();
function validateFields(fields) {
    if (!(0, checkers_helper_1.isArrayOfStrings)(fields)) {
        throw new exceptions_1.RequestQueryException("Invalid fields. Array of strings expected");
    }
}
exports.validateFields = validateFields;
function validateCondition(val, cond, customOperators) {
    if (!(0, lodash_1.isObject)(val) || !(0, checkers_helper_1.isStringFull)(val.field)) {
        throw new exceptions_1.RequestQueryException(`Invalid field type in ${cond} condition. String expected`);
    }
    validateComparisonOperator(val.operator, customOperators);
}
exports.validateCondition = validateCondition;
function validateComparisonOperator(operator, customOperators = {}) {
    const extendedComparisonOperatorsList = [
        ...exports.comparisonOperatorsList,
        ...Object.keys(customOperators),
    ];
    if (!extendedComparisonOperatorsList.includes(operator)) {
        throw new exceptions_1.RequestQueryException(`Invalid comparison operator. ${extendedComparisonOperatorsList.join()} expected`);
    }
}
exports.validateComparisonOperator = validateComparisonOperator;
function validateJoin(join) {
    if (!(0, lodash_1.isObject)(join) || !(0, checkers_helper_1.isStringFull)(join.field)) {
        throw new exceptions_1.RequestQueryException("Invalid join field. String expected");
    }
    if (!(0, lodash_1.isUndefined)(join.select) && !(0, checkers_helper_1.isArrayOfStringsFull)(join.select)) {
        throw new exceptions_1.RequestQueryException("Invalid join select. Array of strings expected");
    }
}
exports.validateJoin = validateJoin;
function validateSort(sort) {
    if (!(0, lodash_1.isObject)(sort) || !(0, checkers_helper_1.isStringFull)(sort.field)) {
        throw new exceptions_1.RequestQueryException("Invalid sort field. String expected");
    }
    if (!(0, lodash_1.isEqual)(sort.order, exports.sortOrdersList[0]) &&
        !(0, lodash_1.isEqual)(sort.order, exports.sortOrdersList[1])) {
        throw new exceptions_1.RequestQueryException(`Invalid sort order. ${sortOrdersListStr} expected`);
    }
}
exports.validateSort = validateSort;
function validateNumeric(val, num) {
    if (!(0, lodash_1.isNumber)(val)) {
        throw new exceptions_1.RequestQueryException(`Invalid ${num}. Number expected`);
    }
}
exports.validateNumeric = validateNumeric;
function validateParamOption(options, name) {
    if (!(0, lodash_1.isObject)(options)) {
        throw new exceptions_1.RequestQueryException(`Invalid param ${name}. Invalid crud options`);
    }
    const option = options[name];
    if (option && option.disabled) {
        return;
    }
    if (!(0, lodash_1.isObject)(option) || (0, lodash_1.isNil)(option.field) || (0, lodash_1.isNil)(option.type)) {
        throw new exceptions_1.RequestQueryException(`Invalid param option in Crud`);
    }
}
exports.validateParamOption = validateParamOption;
function validateUUID(str, name) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidV4.test(str) && !uuid.test(str)) {
        throw new exceptions_1.RequestQueryException(`Invalid param ${name}. UUID string expected`);
    }
}
exports.validateUUID = validateUUID;


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(25), exports);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestQueryException = void 0;
class RequestQueryException extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.RequestQueryException = RequestQueryException;


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(27), exports);
tslib_1.__exportStar(__webpack_require__(28), exports);
tslib_1.__exportStar(__webpack_require__(29), exports);
tslib_1.__exportStar(__webpack_require__(30), exports);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CondOperator = void 0;
var CondOperator;
(function (CondOperator) {
    CondOperator["EQUALS"] = "$eq";
    CondOperator["NOT_EQUALS"] = "$ne";
    CondOperator["GREATER_THAN"] = "$gt";
    CondOperator["LOWER_THAN"] = "$lt";
    CondOperator["GREATER_THAN_EQUALS"] = "$gte";
    CondOperator["LOWER_THAN_EQUALS"] = "$lte";
    CondOperator["STARTS"] = "$starts";
    CondOperator["ENDS"] = "$ends";
    CondOperator["CONTAINS"] = "$cont";
    CondOperator["EXCLUDES"] = "$excl";
    CondOperator["IN"] = "$in";
    CondOperator["NOT_IN"] = "$notin";
    CondOperator["IS_NULL"] = "$isnull";
    CondOperator["NOT_NULL"] = "$notnull";
    CondOperator["BETWEEN"] = "$between";
    CondOperator["EQUALS_LOW"] = "$eqL";
    CondOperator["NOT_EQUALS_LOW"] = "$neL";
    CondOperator["STARTS_LOW"] = "$startsL";
    CondOperator["ENDS_LOW"] = "$endsL";
    CondOperator["CONTAINS_LOW"] = "$contL";
    CondOperator["EXCLUDES_LOW"] = "$exclL";
    CondOperator["IN_LOW"] = "$inL";
    CondOperator["NOT_IN_LOW"] = "$notinL";
})(CondOperator || (exports.CondOperator = CondOperator = {}));


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SerializeHelper = void 0;
const tslib_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(18);
const swagger_1 = __webpack_require__(16);
class SerializeHelper {
    static createGetManyDto(dto, resourceName) {
        class GetManyResponseDto {
        }
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: dto, isArray: true }),
            (0, class_transformer_1.Type)(() => dto)
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Array)
        ], GetManyResponseDto.prototype, "data", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "count", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "total", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "page", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "pageCount", void 0);
        Object.defineProperty(GetManyResponseDto, "name", {
            writable: false,
            value: `GetMany${resourceName}ResponseDto`,
        });
        return GetManyResponseDto;
    }
    static createGetOneResponseDto(resourceName) {
        class GetOneResponseDto {
        }
        Object.defineProperty(GetOneResponseDto, "name", {
            writable: false,
            value: `${resourceName}ResponseDto`,
        });
        return GetOneResponseDto;
    }
}
exports.SerializeHelper = SerializeHelper;


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeRequire = void 0;
function safeRequire(path, loader) {
    try {
        return loader ? loader() : __webpack_require__(33)(path);
    }
    catch (_) {
        return null;
    }
}
exports.safeRequire = safeRequire;


/***/ }),
/* 33 */
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 33;
module.exports = webpackEmptyContext;

/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryBuilderService = void 0;
const lodash_1 = __webpack_require__(5);
const qs_1 = __webpack_require__(35);
const helpers_1 = __webpack_require__(10);
const constants_1 = __webpack_require__(22);
class QueryBuilderService {
    constructor() {
        this.paramNames = {};
        this.queryObject = {};
        this.queryString = "";
        this.setParamNames();
    }
    static setOptions(options) {
        QueryBuilderService._options = {
            ...QueryBuilderService._options,
            ...options,
            paramNamesMap: {
                ...QueryBuilderService._options.paramNamesMap,
                ...(options.paramNamesMap ? options.paramNamesMap : {}),
            },
        };
    }
    static getOptions() {
        return QueryBuilderService._options;
    }
    static create(params, customOperators = {}) {
        const qb = new QueryBuilderService();
        return (0, lodash_1.isObject)(params)
            ? qb.createFromParams(params, customOperators)
            : qb;
    }
    get options() {
        return QueryBuilderService._options;
    }
    setParamNames() {
        if (QueryBuilderService._options.paramNamesMap) {
            Object.keys(QueryBuilderService._options.paramNamesMap).forEach((key) => {
                const name = (0, lodash_1.get)(QueryBuilderService._options.paramNamesMap, key);
                this.paramNames[key] = (0, lodash_1.isString)(name)
                    ? name
                    : name[0];
            });
        }
    }
    query(encode = true) {
        if (this.queryObject[this.paramNames["search"]]) {
            this.queryObject[this.paramNames["filter"]] = undefined;
            this.queryObject[this.paramNames["or"]] = undefined;
        }
        this.queryString = (0, qs_1.stringify)(this.queryObject, { encode });
        return this.queryString;
    }
    select(fields) {
        if (!(0, lodash_1.isNil)(fields) && (0, helpers_1.isArrayFull)(fields)) {
            (0, helpers_1.validateFields)(fields);
            this.queryObject[this.paramNames["fields"]] = fields.join(this.options.delimStr);
        }
        return this;
    }
    search(s) {
        if (!(0, lodash_1.isNil)(s) && (0, lodash_1.isObject)(s)) {
            this.queryObject[this.paramNames["search"]] = JSON.stringify(s);
        }
        return this;
    }
    setFilter(f, customOperators = {}) {
        this.setCondition(f, "filter", customOperators);
        return this;
    }
    setOr(f, customOperators = {}) {
        this.setCondition(f, "or", customOperators);
        return this;
    }
    setJoin(j) {
        if (!(0, lodash_1.isNil)(j)) {
            const param = this.checkQueryObjectParam("join", []);
            this.queryObject[param] = [
                ...this.queryObject[param],
                ...(Array.isArray(j) && !(0, lodash_1.isString)(j[0])
                    ? j.map((o) => this.addJoin(o))
                    : [this.addJoin(j)]),
            ];
        }
        return this;
    }
    sortBy(s) {
        if (!(0, lodash_1.isNil)(s)) {
            const param = this.checkQueryObjectParam("sort", []);
            this.queryObject[param] = [
                ...this.queryObject[param],
                ...(Array.isArray(s) && !(0, lodash_1.isString)(s[0])
                    ? s.map((o) => this.addSortBy(o))
                    : [this.addSortBy(s)]),
            ];
        }
        return this;
    }
    setLimit(n) {
        this.setNumeric(n, "limit");
        return this;
    }
    setOffset(n) {
        this.setNumeric(n, "offset");
        return this;
    }
    setPage(n) {
        this.setNumeric(n, "page");
        return this;
    }
    resetCache() {
        this.setNumeric(0, "cache");
        return this;
    }
    setIncludeDeleted(n) {
        this.setNumeric(n, "includeDeleted");
        return this;
    }
    cond(f, cond = "search", customOperators = {}) {
        const filter = Array.isArray(f)
            ? { field: f[0], operator: f[1], value: f[2] }
            : f;
        (0, helpers_1.validateCondition)(filter, cond, customOperators);
        const d = this.options.delim;
        return (filter.field +
            d +
            filter.operator +
            ((0, helpers_1.hasValue)(filter.value) ? d + filter.value : ""));
    }
    addJoin(j) {
        const join = Array.isArray(j)
            ? { field: j[0], select: j[1] }
            : j;
        (0, helpers_1.validateJoin)(join);
        const d = this.options.delim;
        const ds = this.options.delimStr;
        return (join.field +
            ((0, helpers_1.isArrayFull)(join.select) ? d + (join.select?.join(ds) ?? "") : ""));
    }
    addSortBy(s) {
        const sort = Array.isArray(s) ? { field: s[0], order: s[1] } : s;
        (0, helpers_1.validateSort)(sort);
        const ds = this.options.delimStr;
        return sort.field + ds + sort.order;
    }
    createFromParams(params, customOperators) {
        this.select(params.fields);
        this.search(params.search);
        this.setFilter(params.filter, customOperators);
        this.setOr(params.or, customOperators);
        this.setJoin(params.join);
        this.setLimit(params.limit);
        this.setOffset(params.offset);
        this.setPage(params.page);
        this.sortBy(params.sort);
        if (params.resetCache) {
            this.resetCache();
        }
        this.setIncludeDeleted(params.includeDeleted);
        return this;
    }
    checkQueryObjectParam(cond, defaults) {
        const param = this.paramNames[cond];
        if ((0, lodash_1.isNil)(this.queryObject[param]) && !(0, lodash_1.isUndefined)(defaults)) {
            this.queryObject[param] = defaults;
        }
        return param;
    }
    setCondition(f, cond, customOperators) {
        if (!(0, lodash_1.isNil)(f)) {
            const param = this.checkQueryObjectParam(cond, []);
            this.queryObject[param] = [
                ...this.queryObject[param],
                ...(Array.isArray(f) && !(0, lodash_1.isString)(f[0])
                    ? f.map((o) => this.cond(o, cond, customOperators))
                    : [
                        this.cond(f, cond, customOperators),
                    ]),
            ];
        }
    }
    setNumeric(n, cond) {
        if (!(0, lodash_1.isNil)(n)) {
            (0, helpers_1.validateNumeric)(n, cond);
            this.queryObject[this.paramNames[cond]] = n;
        }
    }
}
exports.QueryBuilderService = QueryBuilderService;
QueryBuilderService._options = {
    delim: constants_1.REQUEST_DELIM,
    delimStr: constants_1.REQUEST_DELIM_STR,
    paramNamesMap: {
        fields: ["fields", "select"],
        search: "s",
        filter: "filter",
        or: "or",
        join: "join",
        sort: "sort",
        limit: ["limit", "per_page"],
        offset: "offset",
        page: "page",
        cache: "cache",
        includeDeleted: "include_deleted",
        extra: constants_1.REQUEST_PREFIX_EXTRA,
    },
};


/***/ }),
/* 35 */
/***/ ((module) => {

"use strict";
module.exports = require("qs");

/***/ }),
/* 36 */
/***/ ((module) => {

"use strict";
module.exports = require("deepmerge");

/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryParserService = void 0;
const lodash_1 = __webpack_require__(5);
const exceptions_1 = __webpack_require__(24);
const types_1 = __webpack_require__(26);
const query_builder_service_1 = __webpack_require__(34);
const helpers_1 = __webpack_require__(10);
const constants_1 = __webpack_require__(22);
class QueryParserService {
    constructor() {
        this.fields = [];
        this.paramsFilter = [];
        this.authPersist = undefined;
        this.classTransformOptions = undefined;
        this.search = undefined;
        this.filter = [];
        this.or = [];
        this.join = [];
        this.sort = [];
        this.extra = {};
        this._paramNames = [];
        this._paramsOptions = {};
    }
    get _options() {
        return query_builder_service_1.QueryBuilderService.getOptions();
    }
    static create() {
        return new QueryParserService();
    }
    getParsed() {
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
    setAuthPersist(persist = {}) {
        this.authPersist = persist || /* istanbul ignore next */ {};
    }
    setClassTransformOptions(options = {}) {
        this.classTransformOptions = options || /* istanbul ignore next */ {};
    }
    convertFilterToSearch(filter) {
        const isEmptyValue = {
            isnull: true,
            notnull: true,
        };
        return filter
            ? {
                [filter.field]: {
                    [filter.operator]: (0, lodash_1.has)(isEmptyValue, filter.operator)
                        ? (0, lodash_1.get)(isEmptyValue, filter.operator)
                        : filter.value,
                },
            }
            : /* istanbul ignore next */ {};
    }
    parseQuery(query, customOperators = {}) {
        if ((0, lodash_1.isObject)(query)) {
            const paramNames = (0, lodash_1.keys)(query);
            if (!(0, lodash_1.isEmpty)(paramNames)) {
                this._query = query;
                this._paramNames = paramNames;
                const searchData = this._query[this.getParamNames("search")[0]];
                this.search = this.parseSearchQueryParam(searchData);
                if ((0, lodash_1.isNil)(this.search)) {
                    this.filter = this.parseQueryParam("filter", this.conditionParser.bind(this, "filter", customOperators));
                    this.or = this.parseQueryParam("or", this.conditionParser.bind(this, "or", customOperators));
                }
                this.fields =
                    this.parseQueryParam("fields", this.fieldsParser.bind(this))[0] || [];
                this.join = this.parseQueryParam("join", this.joinParser.bind(this));
                this.sort = this.parseQueryParam("sort", this.sortParser.bind(this));
                this.limit = this.parseQueryParam("limit", this.numericParser.bind(this, "limit"))[0];
                this.offset = this.parseQueryParam("offset", this.numericParser.bind(this, "offset"))[0];
                this.page = this.parseQueryParam("page", this.numericParser.bind(this, "page"))[0];
                this.cache = this.parseQueryParam("cache", this.numericParser.bind(this, "cache"))[0];
                this.includeDeleted = this.parseQueryParam("includeDeleted", this.numericParser.bind(this, "includeDeleted"))[0];
                this.extra = this.parseExtraFromQueryParam();
            }
        }
        return this;
    }
    parseParams(params, options) {
        if ((0, lodash_1.isObject)(params)) {
            const paramNames = (0, lodash_1.keys)(params);
            if (!(0, lodash_1.isNil)(paramNames)) {
                this._params = params;
                this._paramsOptions = options;
                this.paramsFilter = paramNames
                    .map((name) => this.paramParser(name))
                    .filter((filter) => filter);
            }
        }
        return this;
    }
    getParamNames(type) {
        return this._paramNames.filter((p) => {
            const name = (0, lodash_1.get)(this._options.paramNamesMap, type, "");
            return (0, lodash_1.isString)(name)
                ? name === p
                : name.some((m) => m === p);
        });
    }
    getParamValues(value, parser) {
        if ((0, helpers_1.isStringFull)(value)) {
            return [parser.call(this, value)];
        }
        if ((0, helpers_1.isArrayFull)(value)) {
            return value.map((val) => parser(val));
        }
        return [];
    }
    parseQueryParam(type, parser) {
        const param = this.getParamNames(type);
        if ((0, helpers_1.isArrayFull)(param)) {
            // @ts-ignore
            return param.reduce(
            // @ts-ignore
            (a, name) => [
                ...a,
                ...this.getParamValues(this._query[name], parser),
            ], []);
        }
        return [];
    }
    parseExtraFromQueryParam() {
        const extraParam = (0, lodash_1.get)(this._options.paramNamesMap, "extra", []);
        const params = Array.isArray(extraParam)
            ? extraParam
            : [extraParam];
        const extraKeys = (0, lodash_1.keys)(this._query || {})
            .filter((k) => params.find((p) => k?.startsWith(p)))
            .reduce((o, k) => {
            const key = k.replace(constants_1.REQUEST_PREFIX_EXTRA, "");
            this.parseDotChainToObject(this._query[k], key, o);
            return o;
        }, {});
        return (0, lodash_1.keys)(extraKeys).length > 0 ? extraKeys : undefined;
    }
    /**
     * Build an object from data and composite key.
     *
     * @param data to used on parse workflow
     * @param key composite key as 'foo.bar.hero'
     * @param result object with parsed "data" and "key" structure
     * @private
     */
    parseDotChainToObject(data, key, result = {}) {
        if (key.includes(".")) {
            const keys = key.split(".");
            const firstKey = keys.shift();
            (0, lodash_1.set)(result, firstKey, {});
            this.parseDotChainToObject(data, keys.join("."), (0, lodash_1.get)(result, firstKey));
        }
        else {
            (0, lodash_1.set)(result, key, this.parseValue(data));
        }
    }
    parseValue(val) {
        try {
            const parsed = JSON.parse(val);
            // throw new Error('Don\'t support object now')
            if ((!(0, lodash_1.isDate)(parsed) && (0, lodash_1.isObject)(parsed)) ||
                // JS cannot handle big numbers. Leave it as a string to prevent data loss
                (typeof parsed === "number" &&
                    parsed.toLocaleString("fullwide", { useGrouping: false }) !== val)) {
                return val;
            }
            return parsed;
        }
        catch (_) {
            if ((0, helpers_1.isDateString)(val)) {
                return new Date(val);
            }
            return val;
        }
    }
    parseValues(values) {
        return (0, helpers_1.isArrayFull)(values)
            ? values.map((v) => this.parseValue(v))
            : this.parseValue(values);
    }
    parseSearchQueryParam(d) {
        if ((0, lodash_1.isNil)(d)) {
            return undefined;
        }
        try {
            const data = JSON.parse(d);
            if (!(0, lodash_1.isObject)(data)) {
                throw new Error();
            }
            return data;
        }
        catch (_) {
            throw new exceptions_1.RequestQueryException("Invalid search param. JSON expected");
        }
    }
    fieldsParser(data) {
        // @ts-ignore
        return data.split(this._options.delimStr);
    }
    conditionParser(cond, customOperators, data) {
        const isArrayValue = [
            types_1.CondOperator.IN,
            types_1.CondOperator.NOT_IN,
            types_1.CondOperator.BETWEEN,
            types_1.CondOperator.IN_LOW,
            types_1.CondOperator.NOT_IN_LOW,
        ].concat(Object.keys(customOperators).filter((op) => customOperators[op].isArray));
        const isEmptyValue = [
            types_1.CondOperator.IS_NULL,
            types_1.CondOperator.NOT_NULL,
        ];
        // @ts-ignore
        const param = data.split(this._options.delim);
        const field = param[0];
        const operator = param[1];
        let value = param[2] || "";
        if (isArrayValue.some((name) => name === operator)) {
            // @ts-ignore
            value = value.split(this._options.delimStr);
        }
        value = this.parseValues(value);
        if (!isEmptyValue.some((name) => name === operator) &&
            !(0, helpers_1.hasValue)(value)) {
            throw new exceptions_1.RequestQueryException(`Invalid ${cond} value`);
        }
        const condition = { field, operator, value };
        (0, helpers_1.validateCondition)(condition, cond, customOperators);
        return condition;
    }
    joinParser(data) {
        // @ts-ignore
        const param = data.split(this._options.delim);
        const join = {
            field: param[0],
            select: (0, helpers_1.isStringFull)(param[1])
                ? // @ts-ignore
                    param[1].split(this._options.delimStr)
                : undefined,
        };
        (0, helpers_1.validateJoin)(join);
        return join;
    }
    sortParser(data) {
        const param = data.split(this._options.delimStr);
        const sort = {
            field: param[0],
            order: param[1],
        };
        (0, helpers_1.validateSort)(sort);
        return sort;
    }
    numericParser(num, data) {
        const val = this.parseValue(data);
        (0, helpers_1.validateNumeric)(val, num);
        return val;
    }
    paramParser(name) {
        (0, helpers_1.validateParamOption)(this._paramsOptions, name);
        const option = this._paramsOptions[name];
        if (option.disabled) {
            return undefined;
        }
        let value = this._params[name];
        switch (option.type) {
            case "number":
                value = this.parseValue(value);
                (0, helpers_1.validateNumeric)(value, `param ${name}`);
                break;
            case "uuid":
                (0, helpers_1.validateUUID)(value, name);
                break;
            default:
                break;
        }
        return { field: option.field, operator: "$eq", value };
    }
}
exports.QueryParserService = QueryParserService;


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RoutesFactoryService = void 0;
const common_1 = __webpack_require__(8);
const route_paramtypes_enum_1 = __webpack_require__(20);
const lodash_1 = __webpack_require__(5);
const helpers_1 = __webpack_require__(10);
const enums_1 = __webpack_require__(13);
const interceptors_1 = __webpack_require__(39);
const services_1 = __webpack_require__(6);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = __webpack_require__(36);
class RoutesFactoryService {
    constructor(target, options) {
        this.target = target;
        this.options = options;
        this.create();
    }
    /* istanbul ignore next */
    static create(target, options) {
        return new RoutesFactoryService(target, options);
    }
    get targetProto() {
        return this.target.prototype;
    }
    get modelName() {
        return this.options.model.type.name;
    }
    get modelType() {
        return this.options.model.type;
    }
    get actionsMap() {
        return {
            getManyBase: enums_1.CrudActions.ReadAll,
            getOneBase: enums_1.CrudActions.ReadOne,
            createManyBase: enums_1.CrudActions.CreateMany,
            createOneBase: enums_1.CrudActions.CreateOne,
            updateOneBase: enums_1.CrudActions.UpdateOne,
            deleteOneBase: enums_1.CrudActions.DeleteOne,
            replaceOneBase: enums_1.CrudActions.ReplaceOne,
            recoverOneBase: enums_1.CrudActions.RecoverOne,
        };
    }
    create() {
        const routesSchema = this.getRoutesSchema();
        this.mergeOptions();
        this.createRoutes(routesSchema);
        this.overrideRoutes(routesSchema);
        this.enableRoutes(routesSchema);
    }
    mergeOptions() {
        // merge auth config
        const authOptions = helpers_1.R.getCrudAuthOptions(this.target);
        this.options.auth = (0, helpers_1.isObjectFull)(authOptions) ? authOptions : {};
        if ((0, lodash_1.isUndefined)(this.options.auth.property)) {
            this.options.auth.property = services_1.CrudConfigService.config?.auth?.property;
        }
        if ((0, lodash_1.isUndefined)(this.options.auth.groups)) {
            this.options.auth.groups = services_1.CrudConfigService.config?.auth?.groups;
        }
        if ((0, lodash_1.isUndefined)(this.options.auth.classTransformOptions)) {
            // @ts-ignore
            this.options.auth.classTransformOptions =
                services_1.CrudConfigService.config.auth?.classTransformOptions;
        }
        // merge query config
        const query = (0, helpers_1.isObjectFull)(this.options.query)
            ? this.options.query
            : {};
        this.options.query = { ...services_1.CrudConfigService.config.query, ...query };
        // merge routes config
        const routes = (0, helpers_1.isObjectFull)(this.options.routes)
            ? this.options.routes
            : {};
        this.options.routes = deepmerge(services_1.CrudConfigService.config.routes || {}, routes, {
            // @ts-ignore
            arrayMerge: (a, b, c) => b,
        });
        // merge operators config
        const operators = (0, helpers_1.isObjectFull)(this.options.operators)
            ? this.options.operators
            : {};
        this.options.operators = (deepmerge(services_1.CrudConfigService.config?.operators, operators));
        // set params
        this.options.params = (0, helpers_1.isObjectFull)(this.options.params)
            ? this.options.params
            : (0, helpers_1.isObjectFull)(services_1.CrudConfigService.config.params)
                ? services_1.CrudConfigService.config.params
                : {};
        const hasPrimary = this.getPrimaryParams().length > 0;
        if (!hasPrimary) {
            // @ts-ignore
            this.options.params["id"] = {
                field: "id",
                type: "number",
                primary: true,
            };
        }
        // set dto
        if (!(0, helpers_1.isObjectFull)(this.options.dto)) {
            this.options.dto = {};
        }
        // set serialize
        const serialize = (0, helpers_1.isObjectFull)(this.options.serialize)
            ? this.options.serialize
            : {};
        this.options.serialize = {
            ...services_1.CrudConfigService.config.serialize,
            ...serialize,
        };
        this.options.serialize.get = (0, helpers_1.isFalse)(this.options.serialize.get)
            ? false
            : this.options.serialize.get || this.modelType;
        this.options.serialize.getMany = (0, helpers_1.isFalse)(this.options.serialize.getMany)
            ? false
            : this.options.serialize.getMany
                ? this.options.serialize.getMany
                : (0, helpers_1.isFalse)(this.options.serialize.get)
                    ? false
                    : helpers_1.SerializeHelper.createGetManyDto(this.options.serialize.get, this.modelName);
        this.options.serialize.create = (0, helpers_1.isFalse)(this.options.serialize.create)
            ? false
            : this.options.serialize.create || this.modelType;
        this.options.serialize.update = (0, helpers_1.isFalse)(this.options.serialize.update)
            ? false
            : this.options.serialize.update || this.modelType;
        this.options.serialize.replace = (0, helpers_1.isFalse)(this.options.serialize.replace)
            ? false
            : this.options.serialize.replace || this.modelType;
        this.options.serialize.delete =
            (0, helpers_1.isFalse)(this.options.serialize.delete) ||
                !this.options.routes?.deleteOneBase?.returnDeleted
                ? false
                : this.options.serialize.delete || this.modelType;
        helpers_1.R.setCrudOptions(this.options, this.target);
    }
    getRoutesSchema() {
        return [
            {
                name: "getOneBase",
                path: "/",
                method: common_1.RequestMethod.GET,
                enable: false,
                override: false,
                withParams: true,
            },
            {
                name: "getManyBase",
                path: "/",
                method: common_1.RequestMethod.GET,
                enable: false,
                override: false,
                withParams: false,
            },
            {
                name: "createOneBase",
                path: "/",
                method: common_1.RequestMethod.POST,
                enable: false,
                override: false,
                withParams: false,
            },
            {
                name: "createManyBase",
                path: "/bulk",
                method: common_1.RequestMethod.POST,
                enable: false,
                override: false,
                withParams: false,
            },
            {
                name: "updateOneBase",
                path: "/",
                method: common_1.RequestMethod.PATCH,
                enable: false,
                override: false,
                withParams: true,
            },
            {
                name: "replaceOneBase",
                path: "/",
                method: common_1.RequestMethod.PUT,
                enable: false,
                override: false,
                withParams: true,
            },
            {
                name: "deleteOneBase",
                path: "/",
                method: common_1.RequestMethod.DELETE,
                enable: false,
                override: false,
                withParams: true,
            },
            {
                name: "recoverOneBase",
                path: "/recover",
                method: common_1.RequestMethod.PATCH,
                enable: false,
                override: false,
                withParams: true,
            },
        ];
    }
    getManyBase(name) {
        this.targetProto[name] = function getManyBase(req) {
            return this.service.getMany(req);
        };
    }
    getOneBase(name) {
        this.targetProto[name] = function getOneBase(req) {
            return this.service.getOne(req);
        };
    }
    createOneBase(name) {
        this.targetProto[name] = function createOneBase(req, dto) {
            return this.service.createOne(req, dto);
        };
    }
    createManyBase(name) {
        this.targetProto[name] = function createManyBase(req, dto) {
            return this.service.createMany(req, dto);
        };
    }
    updateOneBase(name) {
        this.targetProto[name] = function updateOneBase(req, dto) {
            return this.service.updateOne(req, dto);
        };
    }
    replaceOneBase(name) {
        this.targetProto[name] = function replaceOneBase(req, dto) {
            return this.service.replaceOne(req, dto);
        };
    }
    deleteOneBase(name) {
        this.targetProto[name] = function deleteOneBase(req) {
            return this.service.deleteOne(req);
        };
    }
    recoverOneBase(name) {
        this.targetProto[name] = function recoverOneBase(req) {
            return this.service.recoverOne(req);
        };
    }
    canCreateRoute(name) {
        const only = this.options.routes?.only;
        const exclude = this.options.routes?.exclude;
        // include recover route only for models with soft delete option
        if (name === "recoverOneBase" && this.options.query?.softDelete !== true) {
            return false;
        }
        if ((0, helpers_1.isArrayFull)(only)) {
            // @ts-ignore
            return only.some((route) => route === name);
        }
        if ((0, helpers_1.isArrayFull)(exclude)) {
            // @ts-ignore
            return !exclude.some((route) => route === name);
        }
        return true;
    }
    createRoutes(routesSchema) {
        const primaryParams = this.getPrimaryParams().filter((param) => !this.options.params?.[param]?.disabled);
        routesSchema.forEach((route) => {
            if (this.canCreateRoute(route.name)) {
                // create base method
                this[route.name](route.name);
                route.enable = true;
                // set metadata
                this.setBaseRouteMeta(route.name);
            }
            if (route.withParams && primaryParams.length > 0) {
                route.path =
                    route.path !== "/"
                        ? `${primaryParams
                            .map((param) => `/:${param}`)
                            .join("")}${route.path}`
                        : primaryParams
                            .map((param) => `/:${param}`)
                            .join("");
            }
        });
    }
    overrideRoutes(routesSchema) {
        Object.getOwnPropertyNames(this.targetProto).forEach((name) => {
            const override = helpers_1.R.getOverrideRoute(this.targetProto[name]);
            const route = routesSchema.find((r) => (0, lodash_1.isEqual)(r.name, override));
            if (override && route && route.enable) {
                // get metadata
                const interceptors = helpers_1.R.getInterceptors(this.targetProto[name]);
                const baseInterceptors = helpers_1.R.getInterceptors(this.targetProto[override]);
                const baseAction = helpers_1.R.getAction(this.targetProto[override]);
                // set metadata
                helpers_1.R.setInterceptors([...baseInterceptors, ...interceptors], this.targetProto[name]);
                helpers_1.R.setAction(baseAction, this.targetProto[name]);
                this.overrideParsedBodyDecorator(override, name);
                // enable route
                helpers_1.R.setRoute(route, this.targetProto[name]);
                route.override = true;
            }
        });
    }
    enableRoutes(routesSchema) {
        routesSchema.forEach((route) => {
            if (!route.override && route.enable) {
                helpers_1.R.setRoute(route, this.targetProto[route.name]);
            }
        });
    }
    overrideParsedBodyDecorator(override, name) {
        const allowed = [
            "createManyBase",
            "createOneBase",
            "updateOneBase",
            "replaceOneBase",
        ];
        const withBody = (0, helpers_1.isIn)(override, allowed);
        const parsedBody = helpers_1.R.getParsedBody(this.targetProto[name]);
        if (withBody && parsedBody) {
            const baseKey = `${route_paramtypes_enum_1.RouteParamtypes.BODY}:1`;
            const key = `${route_paramtypes_enum_1.RouteParamtypes.BODY}:${parsedBody.index}`;
            const baseRouteArgs = helpers_1.R.getRouteArgs(this.target, override);
            const routeArgs = helpers_1.R.getRouteArgs(this.target, name);
            const baseBodyArg = baseRouteArgs[baseKey];
            helpers_1.R.setRouteArgs({
                ...routeArgs,
                [key]: {
                    ...baseBodyArg,
                    index: parsedBody.index,
                },
            }, this.target, name);
            /* istanbul ignore else */
            if ((0, lodash_1.isEqual)(override, "createManyBase")) {
                const paramTypes = helpers_1.R.getRouteArgsTypes(this.targetProto, name);
                const metatype = paramTypes[parsedBody.index];
                const types = [String, Boolean, Number, Array, Object];
                const toCopy = (0, helpers_1.isIn)(metatype, types) || (0, lodash_1.isNil)(metatype);
                if (toCopy) {
                    const baseParamTypes = helpers_1.R.getRouteArgsTypes(this.targetProto, override);
                    const baseMetatype = baseParamTypes[1];
                    paramTypes.splice(parsedBody.index, 1, baseMetatype);
                    helpers_1.R.setRouteArgsTypes(paramTypes, this.targetProto, name);
                }
            }
        }
    }
    getPrimaryParams() {
        return (0, lodash_1.keys)(this.options.params).filter((param) => this.options.params?.[param] && this.options.params[param].primary);
    }
    setBaseRouteMeta(name) {
        this.setRouteArgs(name);
        this.setRouteArgsTypes(name);
        this.setInterceptors(name);
        this.setAction(name);
        this.setDecorators(name);
    }
    setRouteArgs(name) {
        let rest = {};
        const routes = [
            "createManyBase",
            "createOneBase",
            "updateOneBase",
            "replaceOneBase",
        ];
        if ((0, helpers_1.isIn)(name, routes)) {
            const action = this.routeNameAction(name);
            const hasDto = !(0, lodash_1.isNil)((0, lodash_1.get)(this.options, `dto.${action}`));
            const { UPDATE, CREATE } = enums_1.CrudValidationGroups;
            const groupEnum = (0, helpers_1.isIn)(name, [
                "updateOneBase",
                "replaceOneBase",
            ])
                ? UPDATE
                : CREATE;
            const group = !hasDto
                ? groupEnum
                : undefined;
            rest = helpers_1.R.setBodyArg(1, [(0, helpers_1.getValidationPipe)(this.options, group)]);
        }
        helpers_1.R.setRouteArgs({ ...helpers_1.R.setParsedRequestArg(0), ...rest }, this.target, name);
    }
    setRouteArgsTypes(name) {
        switch (true) {
            case (0, lodash_1.isEqual)(name, "createManyBase"):
                const bulkDto = (0, helpers_1.createBulkDto)(this.options);
                helpers_1.R.setRouteArgsTypes([Object, bulkDto], this.targetProto, name);
                break;
            case (0, helpers_1.isIn)(name, ["createOneBase", "updateOneBase", "replaceOneBase"]):
                const action = this.routeNameAction(name);
                const dto = (0, lodash_1.get)(this.options, `dto.${action}`, this.modelType);
                helpers_1.R.setRouteArgsTypes([Object, dto], this.targetProto, name);
                break;
            default:
                helpers_1.R.setRouteArgsTypes([Object], this.targetProto, name);
        }
    }
    setInterceptors(name) {
        const interceptors = (0, lodash_1.get)(this.options, `routes.${name}.interceptors`, []);
        helpers_1.R.setInterceptors([
            interceptors_1.CrudRequestInterceptor,
            interceptors_1.CrudResponseInterceptor,
            ...((0, helpers_1.isArrayFull)(interceptors) ? interceptors : []),
        ], this.targetProto[name]);
    }
    setDecorators(name) {
        const decorators = (0, lodash_1.get)(this.options, `routes.${name}.decorators`, []);
        helpers_1.R.setDecorators((0, helpers_1.isArrayFull)(decorators) ? decorators : [], this.targetProto, name);
    }
    setAction(name) {
        helpers_1.R.setAction(this.actionsMap[name], this.targetProto[name]);
    }
    routeNameAction(name) {
        return name.split("OneBase")[0] || name.split("ManyBase")[0];
    }
}
exports.RoutesFactoryService = RoutesFactoryService;


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(40), exports);
tslib_1.__exportStar(__webpack_require__(42), exports);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudRequestInterceptor = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const exceptions_1 = __webpack_require__(24);
const services_1 = __webpack_require__(6);
const helpers_1 = __webpack_require__(10);
const lodash_1 = __webpack_require__(5);
const constants_1 = __webpack_require__(22);
const enums_1 = __webpack_require__(13);
const crud_base_interceptor_1 = __webpack_require__(41);
let CrudRequestInterceptor = exports.CrudRequestInterceptor = class CrudRequestInterceptor extends crud_base_interceptor_1.CrudBaseInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        try {
            /* istanbul ignore else */
            if (!req[constants_1.PARSED_CRUD_REQUEST_KEY]) {
                const { ctrlOptions, crudOptions, action } = this.getCrudInfo(context);
                const parser = services_1.QueryParserService.create();
                parser.parseQuery(req.query, crudOptions.operators?.custom);
                let auth = null;
                if (!(0, lodash_1.isNil)(ctrlOptions)) {
                    const search = this.getSearch(parser, crudOptions, action, req.params);
                    auth = this.getAuth(parser, crudOptions, req);
                    parser.search = auth.or
                        ? { $or: [auth.or, { $and: search }] }
                        : { $and: [auth.filter, ...search] };
                }
                else {
                    parser.search = { $and: this.getSearch(parser, crudOptions, action) };
                }
                req[constants_1.PARSED_CRUD_REQUEST_KEY] = this.getCrudRequest(parser, crudOptions, auth?.auth);
            }
            return next.handle();
        }
        catch (error) {
            throw error instanceof exceptions_1.RequestQueryException
                ? new common_1.BadRequestException(error.message)
                : error;
        }
    }
    getCrudRequest(parser, crudOptions, auth) {
        const parsed = parser.getParsed();
        const { query, routes, params, operators } = crudOptions;
        return {
            parsed,
            options: {
                query,
                routes,
                params,
                operators,
            },
            auth,
        };
    }
    getSearch(parser, crudOptions, action, params) {
        // params condition
        const paramsSearch = this.getParamsSearch(parser, crudOptions, params);
        // if `CrudOptions.query.filter` is a function then return transformed query search conditions
        if ((0, lodash_1.isFunction)(crudOptions.query?.filter)) {
            const filterCond = (crudOptions.query?.filter)(parser.search, action === enums_1.CrudActions.ReadAll) || {};
            return [...paramsSearch, filterCond];
        }
        // if `CrudOptions.query.filter` is array or search condition type
        const optionsFilter = (0, helpers_1.isArrayFull)(crudOptions.query?.filter)
            ? (crudOptions.query?.filter).map(parser.convertFilterToSearch)
            : [crudOptions.query?.filter || {}];
        let search = [];
        if (parser.search) {
            search = [parser.search];
        }
        else if (parser.filter.length > 0 && parser.or.length > 0) {
            search =
                parser.filter.length === 1 && parser.or.length === 1
                    ? [
                        {
                            $or: [
                                parser.convertFilterToSearch(parser.filter[0]),
                                parser.convertFilterToSearch(parser.or[0]),
                            ],
                        },
                    ]
                    : [
                        {
                            $or: [
                                { $and: parser.filter.map(parser.convertFilterToSearch) },
                                { $and: parser.or.map(parser.convertFilterToSearch) },
                            ],
                        },
                    ];
        }
        else if (parser.filter.length > 0) {
            search = parser.filter.map(parser.convertFilterToSearch);
        }
        else {
            if (parser.or.length > 0) {
                search =
                    parser.or.length === 1
                        ? [parser.convertFilterToSearch(parser.or[0])]
                        : [
                            {
                                $or: parser.or.map(parser.convertFilterToSearch),
                            },
                        ];
            }
        }
        return [...paramsSearch, ...optionsFilter, ...search];
    }
    getParamsSearch(parser, crudOptions, params) {
        if (params) {
            parser.parseParams(params, crudOptions.params);
            return (0, helpers_1.isArrayFull)(parser.paramsFilter)
                ? // @ts-ignore
                    parser.paramsFilter.map(parser.convertFilterToSearch)
                : [];
        }
        return [];
    }
    getAuth(parser, crudOptions, req) {
        const auth = {};
        /* istanbul ignore else */
        if (crudOptions.auth) {
            const userOrRequest = crudOptions.auth.property
                ? req[crudOptions.auth.property]
                : req;
            if (crudOptions.auth.property && req[crudOptions.auth.property]) {
                if (typeof req[crudOptions.auth.property] === "object") {
                    if (Object.keys(req[crudOptions.auth.property]).length > 0) {
                        auth.auth = req[crudOptions.auth.property];
                    }
                }
                else {
                    auth.auth = req[crudOptions.auth.property];
                }
            }
            if ((0, lodash_1.isFunction)(crudOptions.auth.or)) {
                auth.or = crudOptions.auth.or(userOrRequest);
            }
            if ((0, lodash_1.isFunction)(crudOptions.auth.filter) && !auth.or) {
                auth.filter = crudOptions.auth.filter(userOrRequest) || {};
            }
            if ((0, lodash_1.isFunction)(crudOptions.auth.persist)) {
                parser.setAuthPersist(crudOptions.auth.persist(userOrRequest));
            }
            const options = {};
            if ((0, lodash_1.isFunction)(crudOptions.auth.classTransformOptions)) {
                Object.assign(options, crudOptions.auth.classTransformOptions(userOrRequest));
            }
            if ((0, lodash_1.isFunction)(crudOptions.auth.groups)) {
                options.groups = crudOptions.auth.groups(userOrRequest);
            }
            parser.setClassTransformOptions(options);
        }
        return auth;
    }
};
exports.CrudRequestInterceptor = CrudRequestInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CrudRequestInterceptor);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudBaseInterceptor = void 0;
const helpers_1 = __webpack_require__(10);
class CrudBaseInterceptor {
    getCrudInfo(context) {
        const ctrl = context.getClass();
        const handler = context.getHandler();
        const ctrlOptions = helpers_1.R.getCrudOptions(ctrl);
        const crudOptions = ctrlOptions
            ? ctrlOptions
            : {
                query: {},
                routes: {},
                params: {},
                operators: {},
            };
        const action = helpers_1.R.getAction(handler);
        return { ctrlOptions, crudOptions, action };
    }
}
exports.CrudBaseInterceptor = CrudBaseInterceptor;


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudResponseInterceptor = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const lodash_1 = __webpack_require__(5);
const helpers_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(18);
const operators_1 = __webpack_require__(43);
const enums_1 = __webpack_require__(13);
const crud_base_interceptor_1 = __webpack_require__(41);
const class_validator_1 = __webpack_require__(17);
const actionToDtoNameMap = {
    [enums_1.CrudActions.ReadAll]: "getMany",
    [enums_1.CrudActions.ReadOne]: "get",
    [enums_1.CrudActions.CreateMany]: "createMany",
    [enums_1.CrudActions.CreateOne]: "create",
    [enums_1.CrudActions.UpdateOne]: "update",
    [enums_1.CrudActions.ReplaceOne]: "replace",
    [enums_1.CrudActions.DeleteAll]: "delete",
    [enums_1.CrudActions.DeleteOne]: "delete",
    [enums_1.CrudActions.RecoverOne]: "recover",
};
let CrudResponseInterceptor = exports.CrudResponseInterceptor = class CrudResponseInterceptor extends crud_base_interceptor_1.CrudBaseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => this.serialize(context, data)));
    }
    transform(dto, data, options) {
        if (!(0, class_validator_1.isObject)(data) || (0, helpers_1.isFalse)(dto)) {
            return data;
        }
        if (!(0, lodash_1.isFunction)(dto)) {
            return data.constructor !== Object
                ? (0, class_transformer_1.instanceToPlain)(data, options)
                : data;
        }
        return data instanceof dto
            ? (0, class_transformer_1.instanceToPlain)(data, options)
            : /* @ts-ignore */
                (0, class_transformer_1.instanceToPlain)(Object.assign(new dto(), data), options);
    }
    serialize(context, data) {
        const req = context.switchToHttp().getRequest();
        const { crudOptions, action } = this.getCrudInfo(context);
        const { serialize } = crudOptions;
        /* @ts-ignore */
        const dto = serialize[actionToDtoNameMap[action]];
        const isArray = Array.isArray(data);
        const options = {};
        if ((0, lodash_1.isFunction)(crudOptions.auth?.classTransformOptions)) {
            const userOrRequest = crudOptions.auth?.property
                ? req[crudOptions.auth.property]
                : req;
            Object.assign(options, crudOptions.auth?.classTransformOptions(userOrRequest));
        }
        if ((0, lodash_1.isFunction)(crudOptions.auth?.groups)) {
            const userOrRequest = crudOptions.auth?.property
                ? req[crudOptions.auth.property]
                : req;
            options.groups = crudOptions.auth?.groups(userOrRequest);
        }
        switch (action) {
            case enums_1.CrudActions.ReadAll:
                return isArray
                    ? data.map((item) => this.transform(serialize?.get, item, options))
                    : this.transform(dto, data, options);
            case enums_1.CrudActions.CreateMany:
                return isArray
                    ? data.map((item) => this.transform(dto, item, options))
                    : this.transform(dto, data, options);
            default:
                return this.transform(dto, data, options);
        }
    }
};
exports.CrudResponseInterceptor = CrudResponseInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CrudResponseInterceptor);


/***/ }),
/* 43 */
/***/ ((module) => {

"use strict";
module.exports = require("rxjs/operators");

/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeOrmCrudService = void 0;
const o0_1 = __webpack_require__(45);
const class_transformer_1 = __webpack_require__(18);
const lodash_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(46);
const helpers_1 = __webpack_require__(10);
const types_1 = __webpack_require__(26);
const abstract_crud_service_1 = __webpack_require__(7);
class TypeOrmCrudService extends abstract_crud_service_1.CrudService {
    constructor(repo) {
        super();
        this.repo = repo;
        this.entityHasDeleteColumn = false;
        this.entityColumnsHash = {};
        this.entityRelationsHash = new Map();
        this.sqlInjectionRegEx = [
            /(%27)|(')|(--)|(%23)|(#)/gi,
            /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/gi,
            /w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
            /((%27)|('))union/gi,
        ];
        this.dbName = this.repo.metadata.connection.options.type;
        this.onInitMapEntityColumns();
    }
    get findOne() {
        return this.repo.findOne.bind(this.repo);
    }
    get findOneBy() {
        return this.repo.findOneBy.bind(this.repo);
    }
    get find() {
        return this.repo.find.bind(this.repo);
    }
    get count() {
        return this.repo.count.bind(this.repo);
    }
    get entityType() {
        return this.repo.target;
    }
    get alias() {
        return this.repo.metadata.targetName;
    }
    /**
     * Get many
     * @param req
     */
    async getMany(req) {
        const { parsed, options } = req;
        const builder = await this.createBuilder(parsed, options);
        return this.doGetMany(builder, parsed, options);
    }
    /**
     * Get one
     * @param req
     */
    async getOne(req) {
        return this.getOneOrFail(req);
    }
    /**
     * Create one
     * @param req
     * @param dto
     */
    async createOne(req, dto) {
        // @ts-ignore
        const { returnShallow } = req.options.routes?.createOneBase;
        const entity = this.prepareEntityBeforeSave(dto, req.parsed);
        /* istanbul ignore if */
        if (!entity) {
            this.throwBadRequestException(`Empty data. Nothing to save.`);
        }
        const saved = await this.repo.save(entity);
        if (returnShallow) {
            return saved;
        }
        else {
            const primaryParams = this.getPrimaryParams(req.options);
            if ((0, lodash_1.isEmpty)(primaryParams) &&
                primaryParams.some((p) => (0, lodash_1.isNil)(saved[p]))) {
                return saved;
            }
            else {
                req.parsed.search = primaryParams.reduce((acc, p) => ({ ...acc, [p]: saved[p] }), {});
                return this.getOneOrFail(req);
            }
        }
    }
    /**
     * Create many
     * @param req
     * @param dto
     */
    async createMany(req, dto) {
        /* istanbul ignore if */
        if (!(0, helpers_1.isObject)(dto) || !(0, helpers_1.isArrayFull)(dto.bulk)) {
            this.throwBadRequestException(`Empty data. Nothing to save.`);
        }
        const bulk = dto.bulk
            .map((one) => this.prepareEntityBeforeSave(one, req.parsed))
            .filter((d) => !(0, lodash_1.isUndefined)(d));
        /* istanbul ignore if */
        if (!bulk.length) {
            this.throwBadRequestException(`Empty data. Nothing to save.`);
        }
        return this.repo.save(bulk, { chunk: 50 });
    }
    /**
     * Update one
     * @param req
     * @param dto
     */
    async updateOne(req, dto) {
        const { allowParamsOverride, returnShallow } = (req.options.routes?.updateOneBase);
        const paramsFilters = this.getParamFilters(req.parsed);
        // disable cache while updating
        // @ts-ignore
        req.options.query.cache = false;
        const found = await this.getOneOrFail(req, returnShallow);
        const toSave = !allowParamsOverride
            ? { ...found, ...dto, ...paramsFilters, ...req.parsed.authPersist }
            : { ...found, ...dto, ...req.parsed.authPersist };
        const updated = await this.repo.save((0, class_transformer_1.plainToInstance)(this.entityType, toSave, req.parsed.classTransformOptions));
        if (returnShallow) {
            return updated;
        }
        else {
            req.parsed.paramsFilter.forEach((filter) => {
                // @ts-ignore
                filter.value = updated[filter.field];
            });
            return this.getOneOrFail(req);
        }
    }
    /**
     * Recover one
     * @param req
     * @param dto
     */
    async recoverOne(req) {
        // disable cache while recovering
        // @ts-ignore
        req.options.query.cache = false;
        const found = await this.getOneOrFail(req, false, true);
        return this.repo.recover(found);
    }
    /**
     * Replace one
     * @param req
     * @param dto
     */
    async replaceOne(req, dto) {
        const { allowParamsOverride, returnShallow } = (req.options.routes?.replaceOneBase);
        const paramsFilters = this.getParamFilters(req.parsed);
        // disable cache while replacing
        // @ts-ignore
        req.options.query.cache = false;
        const [_, found] = await (0, o0_1.oO)(this.getOneOrFail(req, returnShallow));
        const toSave = !allowParamsOverride
            ? {
                ...(found || {}),
                ...dto,
                ...paramsFilters,
                ...req.parsed.authPersist,
            }
            : {
                ...(found || {}),
                ...paramsFilters,
                ...dto,
                ...req.parsed.authPersist,
            };
        const replaced = await this.repo.save((0, class_transformer_1.plainToInstance)(this.entityType, toSave, req.parsed.classTransformOptions));
        if (returnShallow) {
            return replaced;
        }
        else {
            const primaryParams = this.getPrimaryParams(req.options);
            /* istanbul ignore if */
            if (!primaryParams.length) {
                return replaced;
            }
            req.parsed.search = primaryParams.reduce((acc, p) => ({
                ...acc,
                // @ts-ignore
                [p]: replaced[p],
            }), {});
            return this.getOneOrFail(req);
        }
    }
    /**
     * Delete one
     * @param req
     */
    async deleteOne(req) {
        const { returnDeleted } = (req.options.routes?.deleteOneBase);
        // disable cache while deleting
        // @ts-ignore
        req.options.query.cache = false;
        const found = await this.getOneOrFail(req, returnDeleted);
        const toReturn = returnDeleted
            ? (0, class_transformer_1.plainToInstance)(this.entityType, { ...found }, req.parsed.classTransformOptions)
            : undefined;
        const deleted = req.options.query?.softDelete === true
            ? await this.repo.softRemove(found)
            : await this.repo.remove(found);
        return toReturn;
    }
    getParamFilters(parsed) {
        const filters = {};
        if (!(0, lodash_1.isEmpty)(parsed.paramsFilter)) {
            for (const filter of parsed.paramsFilter) {
                // @ts-ignore
                filters[filter.field] = filter.value;
            }
        }
        return filters;
    }
    /**
     * Create TypeOrm QueryBuilder
     * @param parsed
     * @param options
     * @param many
     * @param withDeleted
     */
    async createBuilder(parsed, options, many = true, withDeleted = false) {
        // create query builder
        const builder = this.repo.createQueryBuilder(this.alias);
        // get select fields
        const select = this.getSelect(parsed, options.query || {});
        // select fields
        builder.select(select);
        // if soft deleted is enabled add where statement to filter deleted records
        if (options.query?.softDelete) {
            if (parsed.includeDeleted === 1 || withDeleted) {
                builder.withDeleted();
            }
        }
        // search
        this.setSearchCondition(builder, parsed.search || {}, options.operators?.custom || {});
        // set joins
        const joinOptions = options.query?.join || {};
        const allowedJoins = Object.keys(joinOptions);
        if (!(0, lodash_1.isEmpty)(allowedJoins)) {
            const eagerJoins = {};
            for (let i = 0; i < allowedJoins.length; i++) {
                if (joinOptions[allowedJoins[i]].eager) {
                    const cond = parsed.join.find((j) => j && j.field === allowedJoins[i]) || {
                        field: allowedJoins[i],
                    };
                    this.setJoin(cond, joinOptions, builder);
                    eagerJoins[allowedJoins[i]] = true;
                }
            }
            if ((0, helpers_1.isArrayFull)(parsed.join)) {
                for (let i = 0; i < parsed.join.length; i++) {
                    if (!eagerJoins[parsed.join[i].field]) {
                        this.setJoin(parsed.join[i], joinOptions, builder);
                    }
                }
            }
        }
        if (many) {
            // set sort (order by)
            const sort = this.getSort(parsed, options.query || {});
            builder.orderBy(sort);
            // set take
            const take = this.getTake(parsed, options.query || {});
            if (take && isFinite(take)) {
                builder.take(take);
            }
            // set skip
            const skip = this.getSkip(parsed, take || 0);
            if (skip && isFinite(skip)) {
                builder.skip(skip);
            }
        }
        // set cache
        if (options.query?.cache && parsed.cache !== 0) {
            builder.cache(options.query.cache);
        }
        return builder;
    }
    /**
     * depends on paging call `SelectQueryBuilder#getMany` or `SelectQueryBuilder#getManyAndCount`
     * helpful for overriding `TypeOrmCrudService#getMany`
     * @see getMany
     * @see SelectQueryBuilder#getMany
     * @see SelectQueryBuilder#getManyAndCount
     * @param builder
     * @param query
     * @param options
     */
    async doGetMany(builder, query, options) {
        if (this.decidePagination(query, options)) {
            const [data, total] = await builder.getManyAndCount();
            const limit = builder.expressionMap.take;
            const offset = builder.expressionMap.skip;
            return this.createPageInfo(data, total, limit || total, offset || 0);
        }
        return builder.getMany();
    }
    onInitMapEntityColumns() {
        this.entityColumns = this.repo.metadata.columns.map((prop) => {
            // In case column is an embedded, use the propertyPath to get complete path
            if (prop.embeddedMetadata) {
                this.entityColumnsHash[prop.propertyPath] = prop.databasePath;
                return prop.propertyPath;
            }
            this.entityColumnsHash[prop.propertyName] = prop.databasePath;
            return prop.propertyName;
        });
        this.entityPrimaryColumns = this.repo.metadata.columns
            .filter((prop) => prop.isPrimary)
            .map((prop) => prop.propertyName);
        this.entityHasDeleteColumn = this.repo.metadata.columns.some((prop) => !(0, lodash_1.isEmpty)(prop.isDeleteDate));
    }
    async getOneOrFail(req, shallow = false, withDeleted = false) {
        const { parsed, options } = req;
        const builder = shallow
            ? this.repo.createQueryBuilder(this.alias)
            : await this.createBuilder(parsed, options, true, withDeleted);
        if (shallow) {
            this.setSearchCondition(builder, parsed.search || null, options.operators?.custom);
        }
        const found = withDeleted
            ? await builder.withDeleted().getOne()
            : await builder.getOne();
        if (!found) {
            this.throwNotFoundException(this.alias);
        }
        return found;
    }
    prepareEntityBeforeSave(dto, parsed) {
        /* istanbul ignore if */
        if (!(0, helpers_1.isObject)(dto)) {
            return undefined;
        }
        if (!(0, lodash_1.isEmpty)(parsed.paramsFilter)) {
            for (const filter of parsed.paramsFilter) {
                // @ts-ignore
                dto[filter.field] = filter.value;
            }
        }
        /* istanbul ignore if */
        if ((0, lodash_1.isEmpty)(Object.keys(dto))) {
            return undefined;
        }
        return dto instanceof this.entityType
            ? Object.assign(dto, parsed.authPersist)
            : (0, class_transformer_1.plainToInstance)(this.entityType, { ...dto, ...parsed.authPersist }, parsed.classTransformOptions);
    }
    getAllowedColumns(columns, options) {
        return (!options.exclude || !options.exclude.length) &&
            (!options.allow || !options.allow.length)
            ? columns
            : columns.filter((column) => (options.exclude && options.exclude.length
                ? !options.exclude.some((col) => col === column)
                : true) &&
                (options.allow && options.allow.length
                    ? options.allow.some((col) => col === column)
                    : true));
    }
    getEntityColumns(entityMetadata) {
        const columns = entityMetadata.columns.map((prop) => prop.propertyPath) ||
            [];
        const primaryColumns = entityMetadata.primaryColumns.map((prop) => prop.propertyPath) || [];
        return { columns, primaryColumns };
    }
    getRelationMetadata(field, options) {
        try {
            let allowedRelation;
            let nested = false;
            if (this.entityRelationsHash.has(field)) {
                allowedRelation = this.entityRelationsHash.get(field);
            }
            else {
                const fields = field.split(".");
                let relationMetadata = null;
                let name;
                let path;
                let parentPath;
                if (fields.length === 1) {
                    const found = this.repo.metadata.relations.find((one) => one.propertyName === fields[0]);
                    if (found) {
                        name = fields[0];
                        path = `${this.alias}.${fields[0]}`;
                        relationMetadata = found.inverseEntityMetadata;
                    }
                }
                else {
                    nested = true;
                    parentPath = "";
                    const reduced = fields.reduce(
                    // @ts-ignore
                    (res, propertyName, i) => {
                        const found = res.relations?.length
                            ? res.relations.find((one) => one.propertyName === propertyName)
                            : null;
                        relationMetadata = found ? found.inverseEntityMetadata : null;
                        const relations = relationMetadata
                            ? relationMetadata.relations
                            : [];
                        name = propertyName;
                        if (i !== fields.length - 1) {
                            parentPath = !parentPath
                                ? propertyName
                                : `${parentPath}.${propertyName}`;
                        }
                        return {
                            relations,
                            relationMetadata,
                        };
                    }, {
                        relations: this.repo.metadata.relations,
                        relationMetadata: null,
                    });
                    // @ts-ignore
                    relationMetadata = reduced.relationMetadata;
                }
                // @ts-ignore
                if (relationMetadata) {
                    const { columns, primaryColumns } = this.getEntityColumns(relationMetadata);
                    if (!path && parentPath) {
                        const parentAllowedRelation = this.entityRelationsHash.get(parentPath);
                        if (parentAllowedRelation) {
                            path = parentAllowedRelation.alias
                                ? `${parentAllowedRelation.alias}.${name}`
                                : field;
                        }
                    }
                    allowedRelation = {
                        alias: options.alias,
                        name,
                        path,
                        columns,
                        nested,
                        primaryColumns,
                    };
                }
            }
            if (allowedRelation) {
                const allowedColumns = this.getAllowedColumns(allowedRelation.columns, options);
                const toSave = {
                    ...allowedRelation,
                    allowedColumns,
                };
                this.entityRelationsHash.set(field, toSave);
                if (options.alias) {
                    this.entityRelationsHash.set(options.alias, toSave);
                }
                return toSave;
            }
        }
        catch (_) {
            return null;
        }
        return null;
    }
    setJoin(cond, joinOptions, builder) {
        const options = joinOptions[cond.field] ?? null;
        if (!options) {
            console.warn('relation "' +
                cond.field +
                '" not found in allowed relations in the controller. Did you mean to use one of these? [' +
                Object.keys(joinOptions).join(", ") +
                "]");
            return;
        }
        const allowedRelation = this.getRelationMetadata(cond.field, options);
        if (!allowedRelation) {
            return;
        }
        const relationType = options.required ? "innerJoin" : "leftJoin";
        const alias = options.alias ? options.alias : allowedRelation.name;
        builder[relationType](allowedRelation.path, alias);
        if (options.select !== false) {
            const columns = (0, helpers_1.isArrayFull)(cond.select)
                ? cond.select?.filter((column) => allowedRelation.allowedColumns.some((allowed) => allowed === column)) || []
                : allowedRelation.allowedColumns || [];
            const select = [
                ...allowedRelation.primaryColumns,
                // @ts-ignore
                ...((0, helpers_1.isArrayFull)(options.persist) ? options.persist : []),
                ...columns,
            ].map((col) => `${alias}.${col}`);
            builder.addSelect(Array.from(new Set(select)));
        }
    }
    setAndWhere(cond, i, builder, customOperators) {
        const { str, params } = this.mapOperatorsToQuery(cond, `andWhere${i}`, customOperators);
        builder.andWhere(str, params);
    }
    setOrWhere(cond, i, builder, customOperators) {
        const { str, params } = this.mapOperatorsToQuery(cond, `orWhere${i}`, customOperators);
        builder.orWhere(str, params);
    }
    setSearchCondition(builder, search, customOperators, condition = "$and") {
        if ((0, helpers_1.isObject)(search)) {
            const keys = Object.keys(search);
            if (keys.length) {
                // search: {$ne: [...]}
                // @ts-ignore
                if ((0, helpers_1.isArrayFull)(search?.$ne)) {
                    this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                        // @ts-ignore
                        search.$not.forEach((item) => {
                            this.setSearchCondition(qb, item, customOperators, "$and");
                        });
                    }), true);
                }
                // search: {$and: [...], ...}
                else if ((0, helpers_1.isArrayFull)(search?.$and)) {
                    // search: {$and: [{}]}
                    if (search?.$and?.length === 1) {
                        this.setSearchCondition(builder, search.$and[0], customOperators, condition);
                    }
                    // search: {$and: [{}, {}, ...]}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            search?.$and?.forEach((item) => {
                                this.setSearchCondition(qb, item, customOperators, "$and");
                            });
                        }));
                    }
                }
                // search: {$or: [...], ...}
                else if ((0, helpers_1.isArrayFull)(search?.$or)) {
                    // search: {$or: [...]}
                    if (keys.length === 1) {
                        // search: {$or: [{}]}
                        if (search?.$or?.length === 1) {
                            this.setSearchCondition(builder, search.$or[0], customOperators, condition);
                        }
                        // search: {$or: [{}, {}, ...]}
                        else {
                            this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                                search?.$or?.forEach((item) => {
                                    this.setSearchCondition(qb, item, customOperators, "$or");
                                });
                            }));
                        }
                    }
                    // search: {$or: [...], foo, ...}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            keys.forEach((field) => {
                                if (field !== "$or") {
                                    // @ts-ignore
                                    const value = search[field];
                                    if (!(0, helpers_1.isObject)(value)) {
                                        this.builderSetWhere(qb, "$and", field, value, customOperators);
                                    }
                                    else {
                                        this.setSearchFieldObjectCondition(qb, "$and", field, value, customOperators);
                                    }
                                }
                                else {
                                    if (search?.$or?.length === 1) {
                                        this.setSearchCondition(builder, search.$or[0], customOperators, "$and");
                                    }
                                    else {
                                        this.builderAddBrackets(qb, "$and", new typeorm_1.Brackets((qb2) => {
                                            search?.$or?.forEach((item) => {
                                                this.setSearchCondition(qb2, item, customOperators, "$or");
                                            });
                                        }));
                                    }
                                }
                            });
                        }));
                    }
                }
                // search: {...}
                else {
                    // search: {foo}
                    if (keys.length === 1) {
                        const field = keys[0];
                        // @ts-ignore
                        const value = search[field];
                        if (!(0, helpers_1.isObject)(value)) {
                            this.builderSetWhere(builder, condition, field, value, customOperators);
                        }
                        else {
                            this.setSearchFieldObjectCondition(builder, condition, field, value, customOperators);
                        }
                    }
                    // search: {foo, ...}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            keys.forEach((field) => {
                                // @ts-ignore
                                const value = search[field];
                                if (!(0, helpers_1.isObject)(value)) {
                                    this.builderSetWhere(qb, "$and", field, value, customOperators);
                                }
                                else {
                                    this.setSearchFieldObjectCondition(qb, "$and", field, value, customOperators);
                                }
                            });
                        }));
                    }
                }
            }
        }
    }
    builderAddBrackets(builder, condition, brackets, negated = false) {
        if (negated) {
            // No builtin support for not, this is copied from QueryBuilder.getWhereCondition
            const whereQueryBuilder = builder.createQueryBuilder();
            whereQueryBuilder.parentQueryBuilder = builder;
            whereQueryBuilder.expressionMap.mainAlias =
                builder.expressionMap.mainAlias;
            whereQueryBuilder.expressionMap.aliasNamePrefixingEnabled =
                builder.expressionMap.aliasNamePrefixingEnabled;
            whereQueryBuilder.expressionMap.parameters =
                builder.expressionMap.parameters;
            whereQueryBuilder.expressionMap.nativeParameters =
                builder.expressionMap.nativeParameters;
            whereQueryBuilder.expressionMap.wheres = [];
            brackets.whereFactory(whereQueryBuilder);
            const wheres = {
                operator: "brackets",
                condition: whereQueryBuilder.expressionMap.wheres,
            };
            const type = condition === "$and" ? "and" : condition === "$or" ? "or" : "simple";
            builder.expressionMap.wheres.push({
                type,
                condition: {
                    operator: "not",
                    condition: wheres,
                },
            });
        }
        else if (condition === "$and") {
            builder.andWhere(brackets);
        }
        else {
            builder.orWhere(brackets);
        }
    }
    builderSetWhere(builder, condition, field, value, customOperators, operator = "$eq") {
        const time = process.hrtime();
        // const index = `${field}${time[0]}${time[1]}`;
        /**
         * Correcting the Error [Invalid Column Name] or [ syntax error at or near \":\".]
         * When using filter or search in relational/nested entities.
         */
        const safeFieldName = field.replace(/./g, "_");
        const index = `${safeFieldName}${time[0]}${time[1]}`;
        const args = [
            { field, operator: (0, lodash_1.isNull)(value) ? "$isnull" : operator, value },
            index,
            builder,
            customOperators,
        ];
        const fn = condition === "$and" ? this.setAndWhere : this.setOrWhere;
        // @ts-ignore
        fn.apply(this, args);
    }
    setSearchFieldObjectCondition(builder, condition, field, object, customOperators) {
        if ((0, helpers_1.isObject)(object)) {
            const operators = Object.keys(object);
            if (operators.length === 1) {
                const operator = operators[0];
                const value = object[operator];
                if ((0, helpers_1.isObject)(object.$or)) {
                    const orKeys = Object.keys(object.$or);
                    this.setSearchFieldObjectCondition(builder, orKeys.length === 1 ? condition : "$or", field, object.$or, customOperators);
                }
                else {
                    this.builderSetWhere(builder, condition, field, value, customOperators, operator);
                }
            }
            else {
                if (operators.length > 1) {
                    this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                        operators.forEach((operator) => {
                            const value = object[operator];
                            if (operator !== "$or") {
                                this.builderSetWhere(qb, condition, field, value, customOperators, operator);
                            }
                            else {
                                const orKeys = Object.keys(object.$or);
                                if (orKeys.length === 1) {
                                    this.setSearchFieldObjectCondition(qb, condition, field, object.$or, customOperators);
                                }
                                else {
                                    this.builderAddBrackets(qb, condition, new typeorm_1.Brackets((qb2) => {
                                        this.setSearchFieldObjectCondition(qb2, "$or", field, object.$or, customOperators);
                                    }));
                                }
                            }
                        });
                    }));
                }
            }
        }
    }
    getSelect(query, options) {
        const allowed = this.getAllowedColumns(this.entityColumns || [], options);
        const columns = query.fields && query.fields.length
            ? query.fields.filter((field) => allowed.some((col) => field === col))
            : allowed;
        return [
            ...new Set([
                ...(options.persist && options.persist.length ? options.persist : []),
                ...columns,
                ...(this.entityPrimaryColumns || []),
            ]),
        ].map((col) => `${this.alias}.${col}`);
    }
    getSort(query, options) {
        return query.sort && query.sort.length
            ? this.mapSort(query.sort)
            : options.sort && options.sort.length
                ? this.mapSort(options.sort)
                : {};
    }
    getFieldWithAlias(field, sort = false) {
        const i = ["mysql", "mariadb"].includes(this.dbName) ? "`" : '"';
        const cols = field.split(".");
        switch (cols.length) {
            case 1:
                if (sort) {
                    return `${this.alias}.${field}`;
                }
                const dbColName = this.entityColumnsHash[field] !== field
                    ? this.entityColumnsHash[field]
                    : field;
                return `${i}${this.alias}${i}.${i}${dbColName}${i}`;
            case 2:
                return field;
            default:
                return cols.slice(cols.length - 2, cols.length).join(".");
        }
    }
    mapSort(sort) {
        const params = {};
        for (let i = 0; i < sort.length; i++) {
            const field = this.getFieldWithAlias(sort[i].field, true);
            const checkedFiled = this.checkSqlInjection(field);
            params[checkedFiled] = sort[i].order;
        }
        return params;
    }
    mapOperatorsToQuery(cond, param, customOperators = {}) {
        const field = this.getFieldWithAlias(cond.field);
        const likeOperator = this.dbName === "postgres" ? "ILIKE" : "LIKE";
        let str;
        let params;
        if (cond.operator[0] !== "$") {
            cond.operator = ("$" + cond.operator);
        }
        switch (cond.operator) {
            case types_1.CondOperator.EQUALS:
                str = `${field} = :${param}`;
                break;
            case types_1.CondOperator.NOT_EQUALS:
                str = `${field} != :${param}`;
                break;
            case types_1.CondOperator.GREATER_THAN:
                str = `${field} > :${param}`;
                break;
            case types_1.CondOperator.LOWER_THAN:
                str = `${field} < :${param}`;
                break;
            case types_1.CondOperator.GREATER_THAN_EQUALS:
                str = `${field} >= :${param}`;
                break;
            case types_1.CondOperator.LOWER_THAN_EQUALS:
                str = `${field} <= :${param}`;
                break;
            case types_1.CondOperator.STARTS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `${cond.value}%` };
                break;
            case types_1.CondOperator.ENDS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `%${cond.value}` };
                break;
            case types_1.CondOperator.CONTAINS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.EXCLUDES:
                str = `${field} NOT LIKE :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.IN:
                this.checkFilterIsArray(cond);
                str = `${field} IN (:...${param})`;
                break;
            case types_1.CondOperator.NOT_IN:
                this.checkFilterIsArray(cond);
                str = `${field} NOT IN (:...${param})`;
                break;
            case types_1.CondOperator.IS_NULL:
                str = `${field} IS NULL`;
                params = {};
                break;
            case types_1.CondOperator.NOT_NULL:
                str = `${field} IS NOT NULL`;
                params = {};
                break;
            case types_1.CondOperator.BETWEEN:
                this.checkFilterIsArray(cond, cond.value.length !== 2);
                str = `${field} BETWEEN :${param}0 AND :${param}1`;
                params = {
                    [`${param}0`]: cond.value[0],
                    [`${param}1`]: cond.value[1],
                };
                break;
            // case insensitive
            case types_1.CondOperator.EQUALS_LOW:
                str = `LOWER(${field}) = :${param}`;
                break;
            case types_1.CondOperator.NOT_EQUALS_LOW:
                str = `LOWER(${field}) != :${param}`;
                break;
            case types_1.CondOperator.STARTS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `${cond.value}%` };
                break;
            case types_1.CondOperator.ENDS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}` };
                break;
            case types_1.CondOperator.CONTAINS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.EXCLUDES_LOW:
                str = `LOWER(${field}) NOT ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.IN_LOW:
                this.checkFilterIsArray(cond);
                str = `LOWER(${field}) IN (:...${param})`;
                break;
            case types_1.CondOperator.NOT_IN_LOW:
                this.checkFilterIsArray(cond);
                str = `LOWER(${field}) NOT IN (:...${param})`;
                break;
            default:
                const customOperator = customOperators[cond.operator];
                if (!customOperator) {
                    str = `${field} = :${param}`;
                    break;
                }
                try {
                    if (customOperator.isArray) {
                        this.checkFilterIsArray(cond);
                    }
                    str = customOperator.query(field, param);
                    params = customOperator.params || {};
                }
                catch (error) {
                    this.throwBadRequestException(`Invalid custom operator '${field}' query`);
                }
                break;
        }
        if (typeof params === "undefined") {
            params = { [param]: cond.value };
        }
        return { str: str, params };
    }
    checkFilterIsArray(cond, withLength) {
        /* istanbul ignore if */
        if (!Array.isArray(cond.value) ||
            !cond.value.length ||
            (!(0, lodash_1.isNil)(withLength) ? withLength : false)) {
            this.throwBadRequestException(`Invalid column '${cond.field}' value`);
        }
    }
    checkSqlInjection(field) {
        if (this.sqlInjectionRegEx.length) {
            for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
                if (this.sqlInjectionRegEx[i].test(field)) {
                    this.throwBadRequestException(`SQL injection detected: "${field}"`);
                }
            }
        }
        return field;
    }
}
exports.TypeOrmCrudService = TypeOrmCrudService;


/***/ }),
/* 45 */
/***/ ((module) => {

"use strict";
module.exports = require("@zmotivat0r/o0");

/***/ }),
/* 46 */
/***/ ((module) => {

"use strict";
module.exports = require("typeorm");

/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudAuth = void 0;
const helpers_1 = __webpack_require__(10);
const CrudAuth = (options) => (target) => {
    helpers_1.R.setCrudAuthOptions(options, target);
};
exports.CrudAuth = CrudAuth;


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Override = void 0;
const constants_1 = __webpack_require__(22);
const Override = (name) => (target, key, descriptor) => {
    Reflect.defineMetadata(constants_1.OVERRIDE_METHOD_METADATA, name || `${key}Base`, target[key]);
    return descriptor;
};
exports.Override = Override;


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParsedRequest = void 0;
const common_1 = __webpack_require__(8);
const constants_1 = __webpack_require__(22);
const helpers_1 = __webpack_require__(10);
exports.ParsedRequest = (0, common_1.createParamDecorator)((_, ctx) => {
    return helpers_1.R.getContextRequest(ctx)[constants_1.PARSED_CRUD_REQUEST_KEY];
});


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParsedBody = void 0;
const constants_1 = __webpack_require__(22);
const ParsedBody = () => (target, key, index) => {
    Reflect.defineMetadata(constants_1.PARSED_BODY_METADATA, { index }, target[key]);
};
exports.ParsedBody = ParsedBody;


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAction = exports.getFeature = exports.Action = exports.Feature = void 0;
const common_1 = __webpack_require__(8);
const constants_1 = __webpack_require__(22);
const Feature = (name) => (0, common_1.SetMetadata)(constants_1.FEATURE_NAME_METADATA, name);
exports.Feature = Feature;
const Action = (name) => (0, common_1.SetMetadata)(constants_1.ACTION_NAME_METADATA, name);
exports.Action = Action;
const getFeature = (target) => Reflect.getMetadata(constants_1.FEATURE_NAME_METADATA, target);
exports.getFeature = getFeature;
const getAction = (target) => Reflect.getMetadata(constants_1.ACTION_NAME_METADATA, target);
exports.getAction = getAction;


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(2);
tslib_1.__exportStar(__webpack_require__(53), exports);
tslib_1.__exportStar(__webpack_require__(54), exports);
tslib_1.__exportStar(__webpack_require__(55), exports);
tslib_1.__exportStar(__webpack_require__(56), exports);
tslib_1.__exportStar(__webpack_require__(57), exports);
tslib_1.__exportStar(__webpack_require__(58), exports);
tslib_1.__exportStar(__webpack_require__(59), exports);
tslib_1.__exportStar(__webpack_require__(60), exports);
tslib_1.__exportStar(__webpack_require__(61), exports);
tslib_1.__exportStar(__webpack_require__(62), exports);
tslib_1.__exportStar(__webpack_require__(63), exports);
tslib_1.__exportStar(__webpack_require__(64), exports);
tslib_1.__exportStar(__webpack_require__(65), exports);
tslib_1.__exportStar(__webpack_require__(66), exports);
tslib_1.__exportStar(__webpack_require__(67), exports);
tslib_1.__exportStar(__webpack_require__(68), exports);
tslib_1.__exportStar(__webpack_require__(69), exports);
tslib_1.__exportStar(__webpack_require__(70), exports);


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 71 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/core");

/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CrudxSwaggerRoutesFactory = void 0;
const crudx_1 = __webpack_require__(1);
const lodash_1 = __webpack_require__(5);
const swagger_helper_1 = __webpack_require__(73);
class CrudxSwaggerRoutesFactory extends crudx_1.RoutesFactoryService {
    constructor(target, options) {
        super(target, options);
        this.target = target;
        this.swaggerModels = {};
    }
    create() {
        const routesSchema = this.getRoutesSchema();
        this.mergeOptions();
        this.setResponseModels();
        this.createRoutes(routesSchema);
        this.overrideRoutes(routesSchema);
        this.enableRoutes(routesSchema);
    }
    setBaseRouteMeta(name) {
        super.setBaseRouteMeta(name);
        this.setSwaggerOperation(name);
        this.setSwaggerPathParams(name);
        this.setSwaggerQueryParams(name);
        this.setSwaggerResponseOk(name);
        // set decorators after Swagger so metadata can be overwritten
        this.setDecorators(name);
    }
    setSwaggerOperation(name) {
        const summary = swagger_helper_1.Swagger.operationsMap(this.modelName)[name];
        const operationId = name + this.targetProto.constructor.name + this.modelName;
        swagger_helper_1.Swagger.setOperation({ summary, operationId }, this.targetProto[name]);
    }
    setSwaggerPathParams(name) {
        const metadata = swagger_helper_1.Swagger.getParams(this.targetProto[name]);
        const withoutPrimary = [
            "createManyBase",
            "createOneBase",
            "getManyBase",
        ];
        const removePrimary = (0, crudx_1.isIn)(name, withoutPrimary);
        const params = (0, lodash_1.keys)(this.options.params)
            .filter((key) => !(0, lodash_1.get)(this.options, `params.${key}.disabled`))
            .filter((key) => !(removePrimary && (0, lodash_1.get)(this.options, `params.${key}.primary`)))
            .reduce((a, c) => ({ ...a, [c]: this.options.params?.[c] }), {});
        const pathParamsMeta = swagger_helper_1.Swagger.createPathParamsMeta(params);
        swagger_helper_1.Swagger.setParams([...metadata, ...pathParamsMeta], this.targetProto[name]);
    }
    setSwaggerQueryParams(name) {
        const metadata = swagger_helper_1.Swagger.getParams(this.targetProto[name]);
        const queryParamsMeta = swagger_helper_1.Swagger.createQueryParamsMeta(name, this.options);
        swagger_helper_1.Swagger.setParams([...metadata, ...queryParamsMeta], this.targetProto[name]);
    }
    setSwaggerResponseOk(name) {
        const metadata = swagger_helper_1.Swagger.getResponseOk(this.targetProto[name]);
        const metadataToAdd = swagger_helper_1.Swagger.createResponseMeta(name, this.options, this.swaggerModels) || {};
        swagger_helper_1.Swagger.setResponseOk({ ...metadata, ...metadataToAdd }, this.targetProto[name]);
    }
    setResponseModels() {
        const modelType = (0, lodash_1.isFunction)(this.modelType)
            ? this.modelType
            : crudx_1.SerializeHelper.createGetOneResponseDto(this.modelName);
        this.swaggerModels = {};
        this.swaggerModels.get = (0, lodash_1.isFunction)(this.options.serialize?.get)
            ? this.options.serialize?.get
            : modelType;
        this.swaggerModels.getMany =
            this.options.serialize?.getMany ||
                crudx_1.SerializeHelper.createGetManyDto(this.swaggerModels.get, this.modelName);
        this.swaggerModels.create = (0, lodash_1.isFunction)(this.options.serialize?.create)
            ? this.options.serialize?.create
            : modelType;
        this.swaggerModels.update = (0, lodash_1.isFunction)(this.options.serialize?.update)
            ? this.options.serialize?.update
            : modelType;
        this.swaggerModels.replace = (0, lodash_1.isFunction)(this.options.serialize?.replace)
            ? this.options.serialize?.replace
            : modelType;
        this.swaggerModels.delete = (0, lodash_1.isFunction)(this.options.serialize?.delete)
            ? this.options.serialize?.delete
            : modelType;
        this.swaggerModels.recover = (0, lodash_1.isFunction)(this.options.serialize?.recover)
            ? this.options.serialize?.recover
            : modelType;
        swagger_helper_1.Swagger.setExtraModels(this.swaggerModels);
    }
    overrideRoutes(routesSchema) {
        super.overrideRoutes(routesSchema);
        Object.getOwnPropertyNames(this.targetProto).forEach((name) => {
            const override = crudx_1.R.getOverrideRoute(this.targetProto[name]);
            const route = routesSchema.find((r) => (0, lodash_1.isEqual)(r.name, override));
            if (override && route && route.enable) {
                const operation = swagger_helper_1.Swagger.getOperation(this.targetProto[name]);
                const baseOperation = swagger_helper_1.Swagger.getOperation(this.targetProto[override]);
                const swaggerParams = swagger_helper_1.Swagger.getParams(this.targetProto[name]);
                const baseSwaggerParams = swagger_helper_1.Swagger.getParams(this.targetProto[override]);
                const responseOk = swagger_helper_1.Swagger.getResponseOk(this.targetProto[name]);
                const baseResponseOk = swagger_helper_1.Swagger.getResponseOk(this.targetProto[override]);
                swagger_helper_1.Swagger.setOperation({ ...baseOperation, ...operation }, this.targetProto[name]);
                swagger_helper_1.Swagger.setParams([...baseSwaggerParams, ...swaggerParams], this.targetProto[name]);
                swagger_helper_1.Swagger.setResponseOk({ ...baseResponseOk, ...responseOk }, this.targetProto[name]);
            }
        });
    }
}
exports.CrudxSwaggerRoutesFactory = CrudxSwaggerRoutesFactory;


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Swagger = exports.swaggerPkgJson = void 0;
const tslib_1 = __webpack_require__(2);
const crudx_1 = __webpack_require__(1);
const crudx_2 = __webpack_require__(1);
const crudx_3 = __webpack_require__(1);
const common_1 = __webpack_require__(8);
const swagger_1 = __webpack_require__(16);
const SWAGGER_CONSTANTS = tslib_1.__importStar(__webpack_require__(74));
const lodash_1 = __webpack_require__(5);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluralize = __webpack_require__(75);
exports.swaggerPkgJson = (0, crudx_3.safeRequire)("@nestjs/swagger/package.json", () => __webpack_require__(76));
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


/***/ }),
/* 74 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/swagger/dist/constants");

/***/ }),
/* 75 */
/***/ ((module) => {

"use strict";
module.exports = require("pluralize");

/***/ }),
/* 76 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/swagger/package.json");

/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const app_controller_1 = __webpack_require__(78);
const app_service_1 = __webpack_require__(79);
const config_1 = __webpack_require__(82);
const typeorm_1 = __webpack_require__(81);
const database_config_1 = __webpack_require__(83);
const user_model_1 = __webpack_require__(80);
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env.testing"],
                load: [database_config_1.databaseConfig],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (config) => ({
                    type: config.get("database.type"),
                    host: config.get("database.host"),
                    port: config.get("database.port"),
                    username: config.get("database.username"),
                    password: config.get("database.password"),
                    database: config.get("database.database"),
                    entities: config.get("database.entities"),
                    synchronize: config.get("database.synchronize"),
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([user_model_1.User]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(79);
const user_model_1 = __webpack_require__(80);
const crudx_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(16);
let AppController = exports.AppController = class AppController {
    constructor(service) {
        this.service = service;
    }
    get base() {
        return this;
    }
    async getOneOverride(req) {
        return this.base.getOneBase(req);
    }
};
tslib_1.__decorate([
    (0, crudx_1.Override)("getOneBase"),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Overriden description",
    }),
    (0, swagger_1.ApiOperation)({
        summary: "Overriden Summary",
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof crudx_1.CrudRequest !== "undefined" && crudx_1.CrudRequest) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AppController.prototype, "getOneOverride", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)("v1"),
    (0, crudx_1.Crud)({
        model: {
            type: user_model_1.User,
        },
    }),
    (0, common_1.Controller)("/user"),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(2);
const common_1 = __webpack_require__(8);
const user_model_1 = __webpack_require__(80);
const crudx_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(81);
const typeorm_2 = __webpack_require__(46);
const class_validator_1 = __webpack_require__(17);
let AppService = exports.AppService = class AppService extends crudx_1.TypeOrmCrudService {
    constructor(repo) {
        super(repo);
        this.repo = repo;
    }
};
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    (0, common_1.Catch)(typeorm_2.QueryFailedError, class_validator_1.ValidationError, typeorm_2.EntityNotFoundError),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_model_1.User)),
    tslib_1.__metadata("design:paramtypes", [Object])
], AppService);


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(46);
let User = exports.User = class User extends typeorm_1.BaseEntity {
};
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: "varchar", length: 150 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: "integer", nullable: true }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "age", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)("user_swagger")
], User);


/***/ }),
/* 81 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/typeorm");

/***/ }),
/* 82 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/config");

/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.databaseConfig = void 0;
const config_1 = __webpack_require__(82);
const user_model_1 = __webpack_require__(80);
exports.databaseConfig = (0, config_1.registerAs)("database", () => ({
    type: process.env["DB_TYPE"],
    host: process.env["DB_HOST"],
    port: process.env["DB_PORT"],
    username: process.env["DB_USERNAME"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_DATABASE"],
    entities: [user_model_1.User],
    synchronize: true,
    autoLoadEntities: true,
    encoding: process.env["DB_CHARSET"],
}));


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const crudx_1 = __webpack_require__(1);
const common_1 = __webpack_require__(8);
const core_1 = __webpack_require__(71);
const swagger_1 = __webpack_require__(16);
const crudx_swagger_routes_factory_1 = __webpack_require__(72);
crudx_1.CrudConfigService.load({
    query: {
        limit: 20,
    },
    routesFactory: crudx_swagger_routes_factory_1.CrudxSwaggerRoutesFactory,
});
const app_module_1 = __webpack_require__(77);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Crudx Swagger")
        .setDescription("The Crudx-Swagger API Demo")
        .setVersion("1.0")
        .addTag("crudx-swagger")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map