"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryParserService = void 0;
const lodash_1 = require("lodash");
const exceptions_1 = require("../exceptions");
const types_1 = require("../types");
const query_builder_service_1 = require("./query-builder.service");
const helpers_1 = require("../helpers");
const constants_1 = require("../constants");
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
            .filter((k) => params.find((p) => k === null || k === void 0 ? void 0 : k.startsWith(p)))
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
//# sourceMappingURL=query-parser.service.js.map