"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesFactoryService = void 0;
const common_1 = require("@nestjs/common");
const route_paramtypes_enum_1 = require("@nestjs/common/enums/route-paramtypes.enum");
const lodash_1 = require("lodash");
const helpers_1 = require("../helpers");
const enums_1 = require("../enums");
const interceptors_1 = require("../interceptors");
const services_1 = require("../services");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = require('deepmerge');
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // merge auth config
        const authOptions = helpers_1.R.getCrudAuthOptions(this.target);
        this.options.auth = (0, helpers_1.isObjectFull)(authOptions) ? authOptions : {};
        if ((0, lodash_1.isUndefined)(this.options.auth.property)) {
            this.options.auth.property = (_b = (_a = services_1.CrudConfigService.config) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.property;
        }
        if ((0, lodash_1.isUndefined)(this.options.auth.groups)) {
            this.options.auth.groups = (_d = (_c = services_1.CrudConfigService.config) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.groups;
        }
        if ((0, lodash_1.isUndefined)(this.options.auth.classTransformOptions)) {
            // @ts-ignore
            this.options.auth.classTransformOptions =
                (_e = services_1.CrudConfigService.config.auth) === null || _e === void 0 ? void 0 : _e.classTransformOptions;
        }
        // merge query config
        const query = (0, helpers_1.isObjectFull)(this.options.query)
            ? this.options.query
            : {};
        this.options.query = Object.assign(Object.assign({}, services_1.CrudConfigService.config.query), query);
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
        this.options.operators = (deepmerge((_f = services_1.CrudConfigService.config) === null || _f === void 0 ? void 0 : _f.operators, operators));
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
        this.options.serialize = Object.assign(Object.assign({}, services_1.CrudConfigService.config.serialize), serialize);
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
                !((_h = (_g = this.options.routes) === null || _g === void 0 ? void 0 : _g.deleteOneBase) === null || _h === void 0 ? void 0 : _h.returnDeleted)
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
        var _a, _b, _c;
        const only = (_a = this.options.routes) === null || _a === void 0 ? void 0 : _a.only;
        const exclude = (_b = this.options.routes) === null || _b === void 0 ? void 0 : _b.exclude;
        // include recover route only for models with soft delete option
        if (name === "recoverOneBase" && ((_c = this.options.query) === null || _c === void 0 ? void 0 : _c.softDelete) !== true) {
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
        const primaryParams = this.getPrimaryParams().filter((param) => { var _a, _b; return !((_b = (_a = this.options.params) === null || _a === void 0 ? void 0 : _a[param]) === null || _b === void 0 ? void 0 : _b.disabled); });
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
            helpers_1.R.setRouteArgs(Object.assign(Object.assign({}, routeArgs), { [key]: Object.assign(Object.assign({}, baseBodyArg), { index: parsedBody.index }) }), this.target, name);
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
        return (0, lodash_1.keys)(this.options.params).filter((param) => { var _a; return ((_a = this.options.params) === null || _a === void 0 ? void 0 : _a[param]) && this.options.params[param].primary; });
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
        helpers_1.R.setRouteArgs(Object.assign(Object.assign({}, helpers_1.R.setParsedRequestArg(0)), rest), this.target, name);
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
//# sourceMappingURL=routes-factory.service.js.map