"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudxSwaggerRoutesFactory = void 0;
const crudx_1 = require("@2amtech/crudx");
const lodash_1 = require("lodash");
const swagger_helper_1 = require("../lib/swagger.helper");
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
//# sourceMappingURL=crudx.swagger.routes.factory.js.map