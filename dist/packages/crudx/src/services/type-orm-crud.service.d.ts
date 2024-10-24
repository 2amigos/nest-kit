import { BaseEntity, Brackets, ConnectionOptions, DeepPartial, EntityMetadata, ObjectLiteral, Repository, SelectQueryBuilder, WhereExpressionBuilder } from "typeorm";
import { CreateManyDto, CrudRequest, CrudRequestOptions, CustomOperators, GetManyDefaultResponse, JoinOption, JoinOptions, ParsedRequestParams, QueryOptions } from "../interfaces";
import { ClassType, ComparisonOperator, QueryFilter, QueryJoin, QuerySort, SCondition, SConditionKey } from "../types";
import { CrudService } from "./abstract-crud.service";
interface IAllowedRelation {
    alias?: string;
    nested: boolean;
    name: string;
    path: string;
    columns: string[];
    primaryColumns: string[];
    allowedColumns: string[];
}
export declare class TypeOrmCrudService<T extends BaseEntity> extends CrudService<T, DeepPartial<T>> {
    protected repo: Repository<T>;
    protected dbName: ConnectionOptions["type"];
    protected entityColumns: string[] | undefined;
    protected entityPrimaryColumns: string[] | undefined;
    protected entityHasDeleteColumn: boolean;
    protected entityColumnsHash: ObjectLiteral;
    protected entityRelationsHash: Map<string, IAllowedRelation>;
    protected sqlInjectionRegEx: RegExp[];
    constructor(repo: Repository<T>);
    get findOne(): Repository<T>["findOne"];
    get findOneBy(): Repository<T>["findOneBy"];
    get find(): Repository<T>["find"];
    get count(): Repository<T>["count"];
    protected get entityType(): ClassType<T>;
    protected get alias(): string;
    /**
     * Get many
     * @param req
     */
    getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]>;
    /**
     * Get one
     * @param req
     */
    getOne(req: CrudRequest): Promise<T>;
    /**
     * Create one
     * @param req
     * @param dto
     */
    createOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T>;
    /**
     * Create many
     * @param req
     * @param dto
     */
    createMany(req: CrudRequest, dto: CreateManyDto<DeepPartial<T>>): Promise<T[]>;
    /**
     * Update one
     * @param req
     * @param dto
     */
    updateOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T>;
    /**
     * Recover one
     * @param req
     * @param dto
     */
    recoverOne(req: CrudRequest): Promise<T>;
    /**
     * Replace one
     * @param req
     * @param dto
     */
    replaceOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T>;
    /**
     * Delete one
     * @param req
     */
    deleteOne(req: CrudRequest): Promise<void | T>;
    getParamFilters(parsed: CrudRequest["parsed"]): ObjectLiteral;
    /**
     * Create TypeOrm QueryBuilder
     * @param parsed
     * @param options
     * @param many
     * @param withDeleted
     */
    createBuilder(parsed: ParsedRequestParams, options: CrudRequestOptions, many?: boolean, withDeleted?: boolean): Promise<SelectQueryBuilder<T>>;
    /**
     * depends on paging call `SelectQueryBuilder#getMany` or `SelectQueryBuilder#getManyAndCount`
     * helpful for overriding `TypeOrmCrudService#getMany`
     * @see getMany
     * @see SelectQueryBuilder#getMany
     * @see SelectQueryBuilder#getManyAndCount
     * @param builder
     * @param query
     * @param options
     */
    protected doGetMany(builder: SelectQueryBuilder<T>, query: ParsedRequestParams, options: CrudRequestOptions): Promise<GetManyDefaultResponse<T> | T[]>;
    protected onInitMapEntityColumns(): void;
    protected getOneOrFail(req: CrudRequest, shallow?: boolean, withDeleted?: boolean): Promise<T>;
    protected prepareEntityBeforeSave(dto: DeepPartial<T>, parsed: CrudRequest["parsed"]): T | undefined;
    protected getAllowedColumns(columns: string[], options: QueryOptions): string[];
    protected getEntityColumns(entityMetadata: EntityMetadata): {
        columns: string[];
        primaryColumns: string[];
    };
    protected getRelationMetadata(field: string, options: JoinOption): IAllowedRelation | null;
    protected setJoin(cond: QueryJoin, joinOptions: JoinOptions, builder: SelectQueryBuilder<T>): undefined | void;
    protected setAndWhere(cond: QueryFilter, i: any, builder: SelectQueryBuilder<T> | WhereExpressionBuilder, customOperators: CustomOperators): void;
    protected setOrWhere(cond: QueryFilter, i: any, builder: SelectQueryBuilder<T> | WhereExpressionBuilder, customOperators: CustomOperators): void;
    protected setSearchCondition(builder: SelectQueryBuilder<T>, search: SCondition | null, customOperators: CustomOperators, condition?: SConditionKey): void;
    protected builderAddBrackets(builder: SelectQueryBuilder<T>, condition: SConditionKey, brackets: Brackets, negated?: boolean): void;
    protected builderSetWhere(builder: SelectQueryBuilder<T>, condition: SConditionKey, field: string, value: any, customOperators: CustomOperators, operator?: ComparisonOperator): void;
    protected setSearchFieldObjectCondition(builder: SelectQueryBuilder<T>, condition: SConditionKey, field: string, object: any, customOperators: CustomOperators): void;
    protected getSelect(query: ParsedRequestParams, options: QueryOptions): string[];
    protected getSort(query: ParsedRequestParams, options: QueryOptions): ObjectLiteral;
    protected getFieldWithAlias(field: string, sort?: boolean): string;
    protected mapSort(sort: QuerySort[]): ObjectLiteral;
    protected mapOperatorsToQuery(cond: QueryFilter, param: any, customOperators?: CustomOperators): {
        str: string;
        params: ObjectLiteral;
    };
    protected checkFilterIsArray(cond: QueryFilter, withLength?: boolean): void;
    protected checkSqlInjection(field: string): string;
}
export {};
