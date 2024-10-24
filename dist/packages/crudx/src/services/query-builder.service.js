"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilderService = void 0;
const lodash_1 = require("lodash");
const qs_1 = require("qs");
const helpers_1 = require("../helpers");
const constants_1 = require("../constants");
class QueryBuilderService {
    constructor() {
        this.paramNames = {};
        this.queryObject = {};
        this.queryString = "";
        this.setParamNames();
    }
    static setOptions(options) {
        QueryBuilderService._options = Object.assign(Object.assign(Object.assign({}, QueryBuilderService._options), options), { paramNamesMap: Object.assign(Object.assign({}, QueryBuilderService._options.paramNamesMap), (options.paramNamesMap ? options.paramNamesMap : {})) });
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
        var _a, _b;
        const join = Array.isArray(j)
            ? { field: j[0], select: j[1] }
            : j;
        (0, helpers_1.validateJoin)(join);
        const d = this.options.delim;
        const ds = this.options.delimStr;
        return (join.field +
            ((0, helpers_1.isArrayFull)(join.select) ? d + ((_b = (_a = join.select) === null || _a === void 0 ? void 0 : _a.join(ds)) !== null && _b !== void 0 ? _b : "") : ""));
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
//# sourceMappingURL=query-builder.service.js.map