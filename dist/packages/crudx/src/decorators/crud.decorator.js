"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const lodash_1 = require("lodash");
const services_1 = require("../services");
const Crud = (options) => (target) => {
    var _a;
    const factoryMethod = options.routesFactory || services_1.RoutesFactoryService;
    const factory = (0, lodash_1.isUndefined)((_a = services_1.CrudConfigService.config) === null || _a === void 0 ? void 0 : _a.routesFactory)
        ? new factoryMethod(target, options)
        : new services_1.CrudConfigService.config.routesFactory(target, options);
};
exports.Crud = Crud;
//# sourceMappingURL=crud.decorator.js.map