"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudResponseInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const helpers_1 = require("../helpers");
const class_transformer_1 = require("class-transformer");
const operators_1 = require("rxjs/operators");
const enums_1 = require("../enums");
const crud_base_interceptor_1 = require("./crud-base.interceptor");
const class_validator_1 = require("class-validator");
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
        var _a, _b, _c, _d, _e, _f;
        const req = context.switchToHttp().getRequest();
        const { crudOptions, action } = this.getCrudInfo(context);
        const { serialize } = crudOptions;
        /* @ts-ignore */
        const dto = serialize[actionToDtoNameMap[action]];
        const isArray = Array.isArray(data);
        const options = {};
        if ((0, lodash_1.isFunction)((_a = crudOptions.auth) === null || _a === void 0 ? void 0 : _a.classTransformOptions)) {
            const userOrRequest = ((_b = crudOptions.auth) === null || _b === void 0 ? void 0 : _b.property)
                ? req[crudOptions.auth.property]
                : req;
            Object.assign(options, (_c = crudOptions.auth) === null || _c === void 0 ? void 0 : _c.classTransformOptions(userOrRequest));
        }
        if ((0, lodash_1.isFunction)((_d = crudOptions.auth) === null || _d === void 0 ? void 0 : _d.groups)) {
            const userOrRequest = ((_e = crudOptions.auth) === null || _e === void 0 ? void 0 : _e.property)
                ? req[crudOptions.auth.property]
                : req;
            options.groups = (_f = crudOptions.auth) === null || _f === void 0 ? void 0 : _f.groups(userOrRequest);
        }
        switch (action) {
            case enums_1.CrudActions.ReadAll:
                return isArray
                    ? data.map((item) => this.transform(serialize === null || serialize === void 0 ? void 0 : serialize.get, item, options))
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
//# sourceMappingURL=crud-response.interceptor.js.map