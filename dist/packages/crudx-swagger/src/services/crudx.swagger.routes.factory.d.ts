import { BaseRoute, BaseRouteName, CrudOptions, RoutesFactoryService } from "@2amtech/crudx";
export declare class CrudxSwaggerRoutesFactory extends RoutesFactoryService {
    protected target: any;
    protected swaggerModels: any;
    constructor(target: any, options: CrudOptions);
    protected create(): void;
    protected setBaseRouteMeta(name: BaseRouteName): void;
    protected setSwaggerOperation(name: BaseRouteName): void;
    protected setSwaggerPathParams(name: BaseRouteName): void;
    protected setSwaggerQueryParams(name: BaseRouteName): void;
    protected setSwaggerResponseOk(name: BaseRouteName): void;
    protected setResponseModels(): void;
    protected overrideRoutes(routesSchema: BaseRoute[]): void;
}
