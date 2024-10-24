export interface ParamsNamesMap {
    fields?: string | string[];
    search?: string | string[];
    filter?: string | string[];
    or?: string | string[];
    join?: string | string[];
    sort?: string | string[];
    limit?: string | string[];
    offset?: string | string[];
    page?: string | string[];
    cache?: string | string[];
    includeDeleted?: string | string[];
    extra?: string | string[];
}
export interface RequestQueryBuilderOptions {
    delim: string;
    delimStr: string;
    paramNamesMap?: ParamsNamesMap;
}
