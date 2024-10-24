import { CustomOperators, ParamsOptions, ParsedRequestParams } from "../interfaces";
import { ObjectLiteral, QueryExtra, QueryFields, QueryFilter, QueryJoin, QuerySort, SCondition, SConditionAND, SFields } from "../types";
import { ClassTransformOptions } from "class-transformer";
export declare class QueryParserService implements ParsedRequestParams {
    fields: QueryFields;
    paramsFilter: (QueryFilter | undefined)[];
    authPersist: ObjectLiteral | undefined;
    classTransformOptions: ClassTransformOptions | undefined;
    search: SCondition | undefined;
    filter: QueryFilter[];
    or: QueryFilter[];
    join: QueryJoin[];
    sort: QuerySort[];
    limit: number | undefined;
    offset: number | undefined;
    page: number | undefined;
    cache: number | undefined;
    includeDeleted: number | undefined;
    extra: QueryExtra;
    private _params;
    private _query;
    private _paramNames;
    private _paramsOptions;
    private get _options();
    static create(): QueryParserService;
    getParsed(): ParsedRequestParams;
    setAuthPersist(persist?: ObjectLiteral): void;
    setClassTransformOptions(options?: ClassTransformOptions): void;
    convertFilterToSearch(filter: QueryFilter): SFields | SConditionAND;
    parseQuery(query: any, customOperators?: CustomOperators): this;
    parseParams(params: any, options: ParamsOptions): this;
    private getParamNames;
    private getParamValues;
    private parseQueryParam;
    private parseExtraFromQueryParam;
    /**
     * Build an object from data and composite key.
     *
     * @param data to used on parse workflow
     * @param key composite key as 'foo.bar.hero'
     * @param result object with parsed "data" and "key" structure
     * @private
     */
    private parseDotChainToObject;
    private parseValue;
    private parseValues;
    private parseSearchQueryParam;
    private fieldsParser;
    private conditionParser;
    private joinParser;
    private sortParser;
    private numericParser;
    private paramParser;
}
