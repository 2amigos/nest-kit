import { CrudActions } from "../enums";
import { BaseRoute, CrudOptions, MergedCrudOptions } from "../interfaces";
import { BaseRouteName } from "../types";
export declare class RoutesFactoryService {
    protected target: any;
    protected options: MergedCrudOptions;
    constructor(target: any, options: CrudOptions);
    static create(target: any, options: CrudOptions): RoutesFactoryService;
    protected get targetProto(): any;
    protected get modelName(): string;
    protected get modelType(): any;
    protected get actionsMap(): {
        [key in BaseRouteName]: CrudActions;
    };
    protected create(): void;
    protected mergeOptions(): void;
    protected getRoutesSchema(): BaseRoute[];
    protected getManyBase(name: BaseRouteName): void;
    protected getOneBase(name: BaseRouteName): void;
    protected createOneBase(name: BaseRouteName): void;
    protected createManyBase(name: BaseRouteName): void;
    protected updateOneBase(name: BaseRouteName): void;
    protected replaceOneBase(name: BaseRouteName): void;
    protected deleteOneBase(name: BaseRouteName): void;
    protected recoverOneBase(name: BaseRouteName): void;
    protected canCreateRoute(name: BaseRouteName): boolean;
    protected createRoutes(routesSchema: BaseRoute[]): void;
    protected overrideRoutes(routesSchema: BaseRoute[]): void;
    protected enableRoutes(routesSchema: BaseRoute[]): void;
    protected overrideParsedBodyDecorator(override: BaseRouteName, name: string): void;
    protected getPrimaryParams(): string[];
    protected setBaseRouteMeta(name: BaseRouteName): void;
    protected setRouteArgs(name: BaseRouteName): void;
    protected setRouteArgsTypes(name: BaseRouteName): void;
    protected setInterceptors(name: BaseRouteName): void;
    protected setDecorators(name: BaseRouteName): void;
    protected setAction(name: BaseRouteName): void;
    protected routeNameAction(name: BaseRouteName): string;
}
