import { CreateQueryParams, CustomOperators, RequestQueryBuilderOptions } from "../interfaces";
import { QueryFields, QueryFilter, QueryFilterArr, QueryJoin, QueryJoinArr, QuerySort, QuerySortArr, SCondition } from "../types";
export declare class QueryBuilderService {
    constructor();
    private static _options;
    private paramNames;
    queryObject: {
        [key: string]: any;
    };
    queryString: string;
    static setOptions(options: RequestQueryBuilderOptions): void;
    static getOptions(): RequestQueryBuilderOptions;
    static create(params?: CreateQueryParams, customOperators?: CustomOperators): QueryBuilderService;
    get options(): RequestQueryBuilderOptions;
    setParamNames(): void;
    query(encode?: boolean): string;
    select(fields?: QueryFields): this;
    search(s?: SCondition): this;
    setFilter(f: QueryFilter | QueryFilterArr | Array<QueryFilter | QueryFilterArr> | undefined, customOperators?: CustomOperators): this;
    setOr(f: QueryFilter | QueryFilterArr | Array<QueryFilter | QueryFilterArr> | undefined, customOperators?: CustomOperators): this;
    setJoin(j: QueryJoin | QueryJoinArr | Array<QueryJoin | QueryJoinArr> | undefined): this;
    sortBy(s: QuerySort | QuerySortArr | Array<QuerySort | QuerySortArr> | undefined): this;
    setLimit(n: number | undefined): this;
    setOffset(n: number | undefined): this;
    setPage(n: number | undefined): this;
    resetCache(): this;
    setIncludeDeleted(n: number | undefined): this;
    cond(f: QueryFilter | QueryFilterArr, cond?: "filter" | "or" | "search", customOperators?: CustomOperators): string;
    private addJoin;
    private addSortBy;
    private createFromParams;
    private checkQueryObjectParam;
    private setCondition;
    private setNumeric;
}
