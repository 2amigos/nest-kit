import { isUndefined } from "lodash";
import { isObjectFull } from "../helpers";
import { CrudGlobalConfig, RequestQueryBuilderOptions } from "../interfaces";

import { QueryBuilderService } from "./query-builder.service";
import { RoutesFactoryService } from "./routes-factory.service";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = require('deepmerge');

export class CrudConfigService {
  static config: CrudGlobalConfig = {
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

  static load(config: CrudGlobalConfig = {}): void {
    const auth = isObjectFull(config.auth) ? config.auth : {};
    const query = isObjectFull(config.query) ? config.query : {};
    const routes = isObjectFull(config.routes) ? config.routes : {};
    const operators = isObjectFull(config.operators) ? config.operators : {};
    const params = isObjectFull(config.params) ? config.params : {};
    const serialize = isObjectFull(config.serialize) ? config.serialize : {};
    const routesFactory = ! isUndefined(config.routesFactory) ? config.routesFactory : undefined;

    if (isObjectFull(config.queryParser)) {
      QueryBuilderService.setOptions(<RequestQueryBuilderOptions>{
        ...config.queryParser,
      });
    }

    CrudConfigService.config = deepmerge(
      CrudConfigService.config,
      { auth, query, routes, operators, params, serialize, routesFactory },
      // @ts-ignore
      { arrayMerge: (destinationArray, sourceArray, _options) => sourceArray }
    );
  }
}
