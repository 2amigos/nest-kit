import { MergedCrudOptions, ParamsOptions } from "@2amtech/crudx";
import { BaseRouteName } from "@2amtech/crudx";
export declare const swaggerPkgJson: any;
export declare class Swagger {
    static operationsMap(modelName: string): {
        [key in BaseRouteName]: string;
    };
    static setOperation(metadata: any, func: Function): void;
    static setParams(metadata: any, func: Function): void;
    static setExtraModels(swaggerModels: any): void;
    static setResponseOk(metadata: any, func: Function): void;
    static getOperation(func: Function): any;
    static getParams(func: Function): any[];
    static getExtraModels(target: any): any[];
    static getResponseOk(func: Function): any;
    static createResponseMeta(name: BaseRouteName, options: MergedCrudOptions, swaggerModels: any): any;
    static createPathParamsMeta(options: ParamsOptions): any[];
    static createQueryParamsMeta(name: BaseRouteName, options: MergedCrudOptions): {
        schema: {
            type: string;
        };
        name: undefined;
        description: string;
        required: boolean;
        in: string;
    }[];
    static getQueryParamsNames(): {
        delim: string;
        delimStr: string;
        fields: undefined;
        search: undefined;
        filter: undefined;
        or: undefined;
        join: undefined;
        sort: undefined;
        limit: undefined;
        offset: undefined;
        page: undefined;
        cache: undefined;
        includeDeleted: undefined;
    };
}
