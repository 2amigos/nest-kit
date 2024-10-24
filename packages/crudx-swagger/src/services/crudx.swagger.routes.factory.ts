import {
  BaseRoute,
  BaseRouteName,
  CrudOptions,
  isIn,
  R,
  RoutesFactoryService,
  SerializeHelper,
} from "@2amtech/crudx";
import { get, isEqual, isFunction, keys } from "lodash";

import { Swagger } from "../lib/swagger.helper";

export class CrudxSwaggerRoutesFactory extends RoutesFactoryService {
  protected swaggerModels: any = {};

  constructor(protected override target: any, options: CrudOptions) {
    super(target, options);
  }

  protected override create(): void {
    const routesSchema: BaseRoute[] = this.getRoutesSchema();
    this.mergeOptions();
    this.setResponseModels();
    this.createRoutes(routesSchema);
    this.overrideRoutes(routesSchema);
    this.enableRoutes(routesSchema);
  }

  protected override setBaseRouteMeta(name: BaseRouteName): void {
    super.setBaseRouteMeta(name);

    this.setSwaggerOperation(name);
    this.setSwaggerPathParams(name);
    this.setSwaggerQueryParams(name);
    this.setSwaggerResponseOk(name);
    // set decorators after Swagger so metadata can be overwritten
    this.setDecorators(name);
  }

  protected setSwaggerOperation(name: BaseRouteName) {
    const summary: string = Swagger.operationsMap(this.modelName)[name];
    const operationId: string =
      name + this.targetProto.constructor.name + this.modelName;
    Swagger.setOperation({ summary, operationId }, this.targetProto[name]);
  }

  protected setSwaggerPathParams(name: BaseRouteName): void {
    const metadata: any[] = Swagger.getParams(this.targetProto[name]);
    const withoutPrimary: BaseRouteName[] = [
      "createManyBase",
      "createOneBase",
      "getManyBase",
    ];

    const removePrimary: boolean = isIn(name, withoutPrimary);
    const params: {} = keys(this.options.params)
      .filter((key: string) => !get(this.options, `params.${key}.disabled`))
      .filter(
        (key: string) =>
          !(removePrimary && get(this.options, `params.${key}.primary`))
      )
      .reduce((a, c) => ({ ...a, [c]: this.options.params?.[c] }), {});

    const pathParamsMeta: any[] = Swagger.createPathParamsMeta(params);
    Swagger.setParams([...metadata, ...pathParamsMeta], this.targetProto[name]);
  }

  protected setSwaggerQueryParams(name: BaseRouteName): void {
    const metadata: any[] = Swagger.getParams(this.targetProto[name]);
    const queryParamsMeta = Swagger.createQueryParamsMeta(name, this.options);
    Swagger.setParams(
      [...metadata, ...queryParamsMeta],
      this.targetProto[name]
    );
  }

  protected setSwaggerResponseOk(name: BaseRouteName): void {
    const metadata = Swagger.getResponseOk(this.targetProto[name]);
    const metadataToAdd =
      Swagger.createResponseMeta(name, this.options, this.swaggerModels) || {};
    Swagger.setResponseOk(
      { ...metadata, ...metadataToAdd },
      this.targetProto[name]
    );
  }

  protected setResponseModels() {
    const modelType = isFunction(this.modelType)
      ? this.modelType
      : SerializeHelper.createGetOneResponseDto(this.modelName);

    this.swaggerModels = {};

    this.swaggerModels.get = isFunction(this.options.serialize?.get)
      ? this.options.serialize?.get
      : modelType;
    this.swaggerModels.getMany =
      this.options.serialize?.getMany ||
      SerializeHelper.createGetManyDto(this.swaggerModels.get, this.modelName);
    this.swaggerModels.create = isFunction(this.options.serialize?.create)
      ? this.options.serialize?.create
      : modelType;
    this.swaggerModels.update = isFunction(this.options.serialize?.update)
      ? this.options.serialize?.update
      : modelType;
    this.swaggerModels.replace = isFunction(this.options.serialize?.replace)
      ? this.options.serialize?.replace
      : modelType;
    this.swaggerModels.delete = isFunction(this.options.serialize?.delete)
      ? this.options.serialize?.delete
      : modelType;
    this.swaggerModels.recover = isFunction(this.options.serialize?.recover)
      ? this.options.serialize?.recover
      : modelType;
    Swagger.setExtraModels(this.swaggerModels);
  }

  protected override overrideRoutes(routesSchema: BaseRoute[]): void {
    super.overrideRoutes(routesSchema);

    Object.getOwnPropertyNames(this.targetProto).forEach(
      (name: string): void => {
        const override: BaseRouteName = R.getOverrideRoute(
          this.targetProto[name]
        );
        const route: BaseRoute | undefined = routesSchema.find((r: BaseRoute) =>
          isEqual(r.name, override)
        );

        if (override && route && route.enable) {
          const operation = Swagger.getOperation(this.targetProto[name]);
          const baseOperation = Swagger.getOperation(
            this.targetProto[override]
          );
          const swaggerParams = Swagger.getParams(this.targetProto[name]);
          const baseSwaggerParams = Swagger.getParams(
            this.targetProto[override]
          );
          const responseOk = Swagger.getResponseOk(this.targetProto[name]);
          const baseResponseOk = Swagger.getResponseOk(
            this.targetProto[override]
          );

          Swagger.setOperation(
            { ...baseOperation, ...operation },
            this.targetProto[name]
          );
          Swagger.setParams(
            [...baseSwaggerParams, ...swaggerParams],
            this.targetProto[name]
          );
          Swagger.setResponseOk(
            { ...baseResponseOk, ...responseOk },
            this.targetProto[name]
          );
        }
      }
    );
  }
}
