"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudRequestInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../exceptions");
const services_1 = require("../services");
const helpers_1 = require("../helpers");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const enums_1 = require("../enums");
const crud_base_interceptor_1 = require("./crud-base.interceptor");
let CrudRequestInterceptor = exports.CrudRequestInterceptor = class CrudRequestInterceptor extends crud_base_interceptor_1.CrudBaseInterceptor {
    intercept(context, next) {
        var _a;
        const req = context.switchToHttp().getRequest();
        try {
            /* istanbul ignore else */
            if (!req[constants_1.PARSED_CRUD_REQUEST_KEY]) {
                const { ctrlOptions, crudOptions, action } = this.getCrudInfo(context);
                const parser = services_1.QueryParserService.create();
                parser.parseQuery(req.query, (_a = crudOptions.operators) === null || _a === void 0 ? void 0 : _a.custom);
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
                req[constants_1.PARSED_CRUD_REQUEST_KEY] = this.getCrudRequest(parser, crudOptions, auth === null || auth === void 0 ? void 0 : auth.auth);
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
        var _a, _b, _c, _d, _e;
        // params condition
        const paramsSearch = this.getParamsSearch(parser, crudOptions, params);
        // if `CrudOptions.query.filter` is a function then return transformed query search conditions
        if ((0, lodash_1.isFunction)((_a = crudOptions.query) === null || _a === void 0 ? void 0 : _a.filter)) {
            const filterCond = ((_b = crudOptions.query) === null || _b === void 0 ? void 0 : _b.filter)(parser.search, action === enums_1.CrudActions.ReadAll) || {};
            return [...paramsSearch, filterCond];
        }
        // if `CrudOptions.query.filter` is array or search condition type
        const optionsFilter = (0, helpers_1.isArrayFull)((_c = crudOptions.query) === null || _c === void 0 ? void 0 : _c.filter)
            ? ((_d = crudOptions.query) === null || _d === void 0 ? void 0 : _d.filter).map(parser.convertFilterToSearch)
            : [((_e = crudOptions.query) === null || _e === void 0 ? void 0 : _e.filter) || {}];
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
//# sourceMappingURL=crud-request.interceptor.js.map