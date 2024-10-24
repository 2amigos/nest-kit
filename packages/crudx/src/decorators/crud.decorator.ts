import { isUndefined } from "lodash";

import { CrudOptions } from "../interfaces";
import { CrudConfigService, RoutesFactoryService } from "../services";

export const Crud =
  (options: CrudOptions) =>
  (target: Object): void => {
    const factoryMethod = options.routesFactory || RoutesFactoryService;
    const factory: RoutesFactoryService = isUndefined(CrudConfigService.config?.routesFactory) 
      ? new factoryMethod(target, options)
      : new CrudConfigService.config.routesFactory(target, options);
  };
