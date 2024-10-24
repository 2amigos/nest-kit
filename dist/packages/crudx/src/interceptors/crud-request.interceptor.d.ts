import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { SCondition } from "../types";
import { QueryParserService } from "../services";
import { CrudActions } from "../enums";
import { CrudRequest, MergedCrudOptions } from "../interfaces";
import { CrudBaseInterceptor } from "./crud-base.interceptor";
import { Observable } from "rxjs";
export declare class CrudRequestInterceptor extends CrudBaseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    getCrudRequest(parser: QueryParserService, crudOptions: Partial<MergedCrudOptions>, auth?: any): CrudRequest;
    getSearch(parser: QueryParserService, crudOptions: Partial<MergedCrudOptions>, action: CrudActions, params?: any): SCondition[];
    getParamsSearch(parser: QueryParserService, crudOptions: Partial<MergedCrudOptions>, params?: any): SCondition[];
    getAuth(parser: QueryParserService, crudOptions: Partial<MergedCrudOptions>, req: any): {
        filter?: any;
        or?: any;
        auth?: any;
    };
}
