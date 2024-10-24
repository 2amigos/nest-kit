"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudConfigService = void 0;
const lodash_1 = require("lodash");
const helpers_1 = require("../helpers");
const query_builder_service_1 = require("./query-builder.service");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = require('deepmerge');
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
            query_builder_service_1.QueryBuilderService.setOptions(Object.assign({}, config.queryParser));
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
//# sourceMappingURL=crud-config.service.js.map