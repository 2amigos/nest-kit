import { RequestMethod } from "@nestjs/common";
import { RouteParamtypes } from "@nestjs/common/enums/route-paramtypes.enum";
import { get, isEqual, isNil, isUndefined, keys } from "lodash";
import {
  createBulkDto,
  getValidationPipe,
  isArrayFull,
  isFalse,
  isIn,
  isObjectFull,
  R,
  SerializeHelper,
} from "../helpers";

import { CrudActions, CrudValidationGroups } from "../enums";
import {
  CrudRequestInterceptor,
  CrudResponseInterceptor,
} from "../interceptors";

import {
  AuthOptions,
  BaseRoute,
  CrudOptions,
  CrudRequest,
  MergedCrudOptions,
  OperatorsOptions,
  ParamsOptions,
  QueryOptions,
  RoutesOptions,
} from "../interfaces";
import { CrudConfigService } from "../services";
import { BaseRouteName } from "../types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepmerge = require('deepmerge');

export class RoutesFactoryService {
  protected options: MergedCrudOptions;

  constructor(protected target: any, options: CrudOptions) {
    this.options = options;
    this.create();
  }

  /* istanbul ignore next */
  static create(target: any, options: CrudOptions): RoutesFactoryService {
    return new RoutesFactoryService(target, options);
  }

  protected get targetProto(): any {
    return this.target.prototype;
  }

  protected get modelName(): string {
    return this.options.model.type.name;
  }

  protected get modelType(): any {
    return this.options.model.type;
  }

  protected get actionsMap(): { [key in BaseRouteName]: CrudActions } {
    return {
      getManyBase: CrudActions.ReadAll,
      getOneBase: CrudActions.ReadOne,
      createManyBase: CrudActions.CreateMany,
      createOneBase: CrudActions.CreateOne,
      updateOneBase: CrudActions.UpdateOne,
      deleteOneBase: CrudActions.DeleteOne,
      replaceOneBase: CrudActions.ReplaceOne,
      recoverOneBase: CrudActions.RecoverOne,
    };
  }

  protected create(): void {
    const routesSchema: BaseRoute[] = this.getRoutesSchema();
    this.mergeOptions();
    this.createRoutes(routesSchema);
    this.overrideRoutes(routesSchema);
    this.enableRoutes(routesSchema);
  }

  protected mergeOptions(): void {
    // merge auth config
    const authOptions: AuthOptions = R.getCrudAuthOptions(this.target);
    this.options.auth = isObjectFull(authOptions) ? authOptions : {};
    if (isUndefined(this.options.auth.property)) {
      this.options.auth.property = CrudConfigService.config?.auth?.property;
    }
    if (isUndefined(this.options.auth.groups)) {
      this.options.auth.groups = CrudConfigService.config?.auth?.groups;
    }
    if (isUndefined(this.options.auth.classTransformOptions)) {
      // @ts-ignore
      this.options.auth.classTransformOptions =
        CrudConfigService.config.auth?.classTransformOptions;
    }

    // merge query config
    const query: QueryOptions | {} = isObjectFull(this.options.query)
      ? <QueryOptions>this.options.query
      : {};

    this.options.query = { ...CrudConfigService.config.query, ...query };

    // merge routes config
    const routes: RoutesOptions | {} = isObjectFull(this.options.routes)
      ? <RoutesOptions>this.options.routes
      : {};
    this.options.routes = deepmerge(
      CrudConfigService.config.routes || {},
      routes,
      {
        // @ts-ignore
        arrayMerge: (a, b, c) => b,
      }
    );

    // merge operators config
    const operators: OperatorsOptions | {} = isObjectFull(
      this.options.operators
    )
      ? <OperatorsOptions>this.options.operators
      : {};
    this.options.operators = <OperatorsOptions>(
      deepmerge(
        <OperatorsOptions>CrudConfigService.config?.operators,
        operators
      )
    );

    // set params
    this.options.params = <ParamsOptions | {}>isObjectFull(this.options.params)
      ? this.options.params
      : isObjectFull(CrudConfigService.config.params)
      ? CrudConfigService.config.params
      : {};
    const hasPrimary: boolean = this.getPrimaryParams().length > 0;
    if (!hasPrimary) {
      // @ts-ignore
      this.options.params["id"] = {
        field: "id",
        type: "number",
        primary: true,
      };
    }

    // set dto
    if (!isObjectFull(this.options.dto)) {
      this.options.dto = {};
    }

    // set serialize
    const serialize = isObjectFull(this.options.serialize)
      ? this.options.serialize
      : {};
    this.options.serialize = {
      ...CrudConfigService.config.serialize,
      ...serialize,
    };
    this.options.serialize.get = isFalse(this.options.serialize.get)
      ? false
      : this.options.serialize.get || this.modelType;
    this.options.serialize.getMany = isFalse(this.options.serialize.getMany)
      ? false
      : this.options.serialize.getMany
      ? this.options.serialize.getMany
      : isFalse(this.options.serialize.get)
      ? false
      : SerializeHelper.createGetManyDto(
          this.options.serialize.get,
          this.modelName
        );
    this.options.serialize.create = isFalse(this.options.serialize.create)
      ? false
      : this.options.serialize.create || this.modelType;
    this.options.serialize.update = isFalse(this.options.serialize.update)
      ? false
      : this.options.serialize.update || this.modelType;
    this.options.serialize.replace = isFalse(this.options.serialize.replace)
      ? false
      : this.options.serialize.replace || this.modelType;
    this.options.serialize.delete =
      isFalse(this.options.serialize.delete) ||
      !this.options.routes?.deleteOneBase?.returnDeleted
        ? false
        : this.options.serialize.delete || this.modelType;

    R.setCrudOptions(this.options, this.target);
  }

  protected getRoutesSchema(): BaseRoute[] {
    return [
      {
        name: "getOneBase",
        path: "/",
        method: RequestMethod.GET,
        enable: false,
        override: false,
        withParams: true,
      },
      {
        name: "getManyBase",
        path: "/",
        method: RequestMethod.GET,
        enable: false,
        override: false,
        withParams: false,
      },
      {
        name: "createOneBase",
        path: "/",
        method: RequestMethod.POST,
        enable: false,
        override: false,
        withParams: false,
      },
      {
        name: "createManyBase",
        path: "/bulk",
        method: RequestMethod.POST,
        enable: false,
        override: false,
        withParams: false,
      },
      {
        name: "updateOneBase",
        path: "/",
        method: RequestMethod.PATCH,
        enable: false,
        override: false,
        withParams: true,
      },
      {
        name: "replaceOneBase",
        path: "/",
        method: RequestMethod.PUT,
        enable: false,
        override: false,
        withParams: true,
      },
      {
        name: "deleteOneBase",
        path: "/",
        method: RequestMethod.DELETE,
        enable: false,
        override: false,
        withParams: true,
      },
      {
        name: "recoverOneBase",
        path: "/recover",
        method: RequestMethod.PATCH,
        enable: false,
        override: false,
        withParams: true,
      },
    ];
  }

  protected getManyBase(name: BaseRouteName) {
    this.targetProto[name] = function getManyBase(req: CrudRequest) {
      return this.service.getMany(req);
    };
  }

  protected getOneBase(name: BaseRouteName) {
    this.targetProto[name] = function getOneBase(req: CrudRequest) {
      return this.service.getOne(req);
    };
  }

  protected createOneBase(name: BaseRouteName) {
    this.targetProto[name] = function createOneBase(
      req: CrudRequest,
      dto: any
    ) {
      return this.service.createOne(req, dto);
    };
  }

  protected createManyBase(name: BaseRouteName) {
    this.targetProto[name] = function createManyBase(
      req: CrudRequest,
      dto: any
    ) {
      return this.service.createMany(req, dto);
    };
  }

  protected updateOneBase(name: BaseRouteName) {
    this.targetProto[name] = function updateOneBase(
      req: CrudRequest,
      dto: any
    ) {
      return this.service.updateOne(req, dto);
    };
  }

  protected replaceOneBase(name: BaseRouteName) {
    this.targetProto[name] = function replaceOneBase(
      req: CrudRequest,
      dto: any
    ) {
      return this.service.replaceOne(req, dto);
    };
  }

  protected deleteOneBase(name: BaseRouteName) {
    this.targetProto[name] = function deleteOneBase(req: CrudRequest) {
      return this.service.deleteOne(req);
    };
  }

  protected recoverOneBase(name: BaseRouteName) {
    this.targetProto[name] = function recoverOneBase(req: CrudRequest) {
      return this.service.recoverOne(req);
    };
  }

  protected canCreateRoute(name: BaseRouteName) {
    const only: BaseRouteName[] | undefined = this.options.routes?.only;
    const exclude: BaseRouteName[] | undefined = this.options.routes?.exclude;

    // include recover route only for models with soft delete option
    if (name === "recoverOneBase" && this.options.query?.softDelete !== true) {
      return false;
    }

    if (isArrayFull(only)) {
      // @ts-ignore
      return only.some((route: BaseRouteName): boolean => route === name);
    }

    if (isArrayFull(exclude)) {
      // @ts-ignore
      return !exclude.some((route: BaseRouteName): boolean => route === name);
    }

    return true;
  }

  protected createRoutes(routesSchema: BaseRoute[]) {
    const primaryParams: string[] = this.getPrimaryParams().filter(
      (param: string) => !this.options.params?.[param]?.disabled
    );

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
                .map((param: string): string => `/:${param}`)
                .join("")}${route.path}`
            : primaryParams
                .map((param: string): string => `/:${param}`)
                .join("");
      }
    });
  }

  protected overrideRoutes(routesSchema: BaseRoute[]): void {
    Object.getOwnPropertyNames(this.targetProto).forEach(
      (name: string): void => {
        const override: BaseRouteName = R.getOverrideRoute(
          this.targetProto[name]
        );
        const route: BaseRoute | undefined = routesSchema.find((r: BaseRoute) =>
          isEqual(r.name, override)
        );

        if (override && route && route.enable) {
          // get metadata
          const interceptors: any[] = R.getInterceptors(this.targetProto[name]);
          const baseInterceptors: any[] = R.getInterceptors(
            this.targetProto[override]
          );
          const baseAction: CrudActions = R.getAction(
            this.targetProto[override]
          );
          // set metadata
          R.setInterceptors(
            [...baseInterceptors, ...interceptors],
            this.targetProto[name]
          );
          R.setAction(baseAction, this.targetProto[name]);
          this.overrideParsedBodyDecorator(override, name);
          // enable route
          R.setRoute(route, this.targetProto[name]);
          route.override = true;
        }
      }
    );
  }

  protected enableRoutes(routesSchema: BaseRoute[]) {
    routesSchema.forEach((route) => {
      if (!route.override && route.enable) {
        R.setRoute(route, this.targetProto[route.name]);
      }
    });
  }

  protected overrideParsedBodyDecorator(override: BaseRouteName, name: string) {
    const allowed: BaseRouteName[] = [
      "createManyBase",
      "createOneBase",
      "updateOneBase",
      "replaceOneBase",
    ] as BaseRouteName[];
    const withBody: Boolean = isIn(override, allowed);
    const parsedBody = R.getParsedBody(this.targetProto[name]);

    if (withBody && parsedBody) {
      const baseKey: string = `${RouteParamtypes.BODY}:1`;
      const key: string = `${RouteParamtypes.BODY}:${parsedBody.index}`;
      const baseRouteArgs = R.getRouteArgs(this.target, override);
      const routeArgs = R.getRouteArgs(this.target, name);
      const baseBodyArg = baseRouteArgs[baseKey];
      R.setRouteArgs(
        {
          ...routeArgs,
          [key]: {
            ...baseBodyArg,
            index: parsedBody.index,
          },
        },
        this.target,
        name
      );

      /* istanbul ignore else */
      if (isEqual(override, "createManyBase")) {
        const paramTypes: any[] = R.getRouteArgsTypes(this.targetProto, name);
        const metatype = paramTypes[parsedBody.index];
        const types = [String, Boolean, Number, Array, Object];
        const toCopy: boolean = isIn(metatype, types) || isNil(metatype);

        if (toCopy) {
          const baseParamTypes: any[] = R.getRouteArgsTypes(
            this.targetProto,
            override
          );
          const baseMetatype = baseParamTypes[1];
          paramTypes.splice(parsedBody.index, 1, baseMetatype);
          R.setRouteArgsTypes(paramTypes, this.targetProto, name);
        }
      }
    }
  }

  protected getPrimaryParams(): string[] {
    return keys(this.options.params).filter(
      (param: string) =>
        this.options.params?.[param] && this.options.params[param].primary
    );
  }

  protected setBaseRouteMeta(name: BaseRouteName) {
    this.setRouteArgs(name);
    this.setRouteArgsTypes(name);
    this.setInterceptors(name);
    this.setAction(name);
    this.setDecorators(name);
  }

  protected setRouteArgs(name: BaseRouteName) {
    let rest = {};
    const routes: BaseRouteName[] = [
      "createManyBase",
      "createOneBase",
      "updateOneBase",
      "replaceOneBase",
    ];

    if (isIn(name, routes)) {
      const action: string = this.routeNameAction(name);
      const hasDto: boolean = !isNil(get(this.options, `dto.${action}`));
      const { UPDATE, CREATE } = CrudValidationGroups;
      const groupEnum: CrudValidationGroups = isIn(name, [
        "updateOneBase",
        "replaceOneBase",
      ])
        ? UPDATE
        : CREATE;
      const group: CrudValidationGroups | undefined = !hasDto
        ? groupEnum
        : undefined;

      rest = R.setBodyArg(1, [getValidationPipe(this.options, group)]);
    }

    R.setRouteArgs({ ...R.setParsedRequestArg(0), ...rest }, this.target, name);
  }

  protected setRouteArgsTypes(name: BaseRouteName): void {
    switch (true) {
      case isEqual(name, "createManyBase"):
        const bulkDto = createBulkDto(this.options);
        R.setRouteArgsTypes([Object, bulkDto], this.targetProto, name);
        break;
      case isIn(name, ["createOneBase", "updateOneBase", "replaceOneBase"]):
        const action: string = this.routeNameAction(name);
        const dto = get(this.options, `dto.${action}`, this.modelType);
        R.setRouteArgsTypes([Object, dto], this.targetProto, name);
        break;
      default:
        R.setRouteArgsTypes([Object], this.targetProto, name);
    }
  }

  protected setInterceptors(name: BaseRouteName): void {
    const interceptors = get(this.options, `routes.${name}.interceptors`, []);
    R.setInterceptors(
      [
        CrudRequestInterceptor,
        CrudResponseInterceptor,
        ...(isArrayFull(interceptors) ? interceptors : []),
      ],
      this.targetProto[name]
    );
  }

  protected setDecorators(name: BaseRouteName): void {
    const decorators = get(this.options, `routes.${name}.decorators`, []);
    R.setDecorators(
      isArrayFull(decorators) ? decorators : [],
      this.targetProto,
      name
    );
  }

  protected setAction(name: BaseRouteName): void {
    R.setAction(this.actionsMap[name], this.targetProto[name]);
  }

  protected routeNameAction(name: BaseRouteName): string {
    return name.split("OneBase")[0] || name.split("ManyBase")[0];
  }
}
