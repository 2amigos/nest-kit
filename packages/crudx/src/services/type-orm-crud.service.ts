

import { oO } from "@zmotivat0r/o0";
import { plainToInstance } from "class-transformer";
import { isEmpty, isNil, isNull, isUndefined } from "lodash";
import {
  BaseEntity,
  Brackets,
  ConnectionOptions,
  DeepPartial,
  EntityMetadata,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from "typeorm";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

import { isArrayFull, isObject } from "../helpers";
import {
  CreateManyDto,
  CrudRequest,
  CrudRequestOptions,
  CustomOperators,
  DeleteOneRouteOptions,
  GetManyDefaultResponse,
  JoinOption,
  JoinOptions,
  ParsedRequestParams,
  QueryOptions,
  ReplaceOneRouteOptions,
  UpdateOneRouteOptions,
} from "../interfaces";
import {
  ClassType,
  ComparisonOperator,
  CondOperator,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
  SConditionKey,
} from "../types";

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

export class TypeOrmCrudService<T extends BaseEntity> extends CrudService<
  T,
  DeepPartial<T>
> {
  protected dbName: ConnectionOptions["type"];
  protected entityColumns: string[] | undefined;
  protected entityPrimaryColumns: string[] | undefined;
  protected entityHasDeleteColumn = false;
  protected entityColumnsHash: ObjectLiteral = {};
  protected entityRelationsHash: Map<string, IAllowedRelation> = new Map();
  protected sqlInjectionRegEx: RegExp[] = [
    /(%27)|(')|(--)|(%23)|(#)/gi,
    /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/gi,
    /w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
    /((%27)|('))union/gi,
  ];

  constructor(protected repo: Repository<T>) {
    super();

    this.dbName = this.repo.metadata.connection.options.type;
    this.onInitMapEntityColumns();
  }

  public get findOne(): Repository<T>["findOne"] {
    return this.repo.findOne.bind(this.repo);
  }

  public get findOneBy(): Repository<T>["findOneBy"] {
    return this.repo.findOneBy.bind(this.repo);
  }

  public get find(): Repository<T>["find"] {
    return this.repo.find.bind(this.repo);
  }

  public get count(): Repository<T>["count"] {
    return this.repo.count.bind(this.repo);
  }

  protected get entityType(): ClassType<T> {
    return this.repo.target as ClassType<T>;
  }

  protected get alias(): string {
    return this.repo.metadata.targetName;
  }

  /**
   * Get many
   * @param req
   */
  public async getMany(
    req: CrudRequest
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    const { parsed, options } = req;
    const builder: SelectQueryBuilder<T> = await this.createBuilder(
      parsed,
      options
    );

    return this.doGetMany(builder, parsed, options);
  }

  /**
   * Get one
   * @param req
   */
  public async getOne(req: CrudRequest): Promise<T> {
    return this.getOneOrFail(req);
  }

  /**
   * Create one
   * @param req
   * @param dto
   */
  public async createOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    // @ts-ignore
    const { returnShallow } = req.options.routes?.createOneBase;
    const entity = this.prepareEntityBeforeSave(dto, req.parsed);

    /* istanbul ignore if */
    if (!entity) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    const saved = await this.repo.save<any>(entity);

    if (returnShallow) {
      return saved;
    } else {
      const primaryParams = this.getPrimaryParams(req.options);

      if (
        isEmpty(primaryParams) &&
        primaryParams.some((p) => isNil(saved[p]))
      ) {
        return saved;
      } else {
        req.parsed.search = primaryParams.reduce(
          (acc, p) => ({ ...acc, [p]: saved[p] }),
          {}
        );
        return this.getOneOrFail(req);
      }
    }
  }

  /**
   * Create many
   * @param req
   * @param dto
   */
  public async createMany(
    req: CrudRequest,
    dto: CreateManyDto<DeepPartial<T>>
  ): Promise<T[]> {
    /* istanbul ignore if */
    if (!isObject(dto) || !isArrayFull(dto.bulk)) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    const bulk = dto.bulk
      .map((one) => this.prepareEntityBeforeSave(one, req.parsed))
      .filter((d) => !isUndefined(d));

    /* istanbul ignore if */
    if (!bulk.length) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    return this.repo.save<any>(bulk, { chunk: 50 });
  }

  /**
   * Update one
   * @param req
   * @param dto
   */
  public async updateOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } = <UpdateOneRouteOptions>(
      req.options.routes?.updateOneBase
    );
    const paramsFilters = this.getParamFilters(req.parsed);
    // disable cache while updating
    // @ts-ignore
    req.options.query.cache = false;
    const found = await this.getOneOrFail(req, returnShallow);

    const toSave = !allowParamsOverride
      ? { ...found, ...dto, ...paramsFilters, ...req.parsed.authPersist }
      : { ...found, ...dto, ...req.parsed.authPersist };
    const updated = await this.repo.save(
      plainToInstance(
        this.entityType,
        toSave,
        req.parsed.classTransformOptions
      ) as unknown as DeepPartial<T>
    );

    if (returnShallow) {
      return updated;
    } else {
      req.parsed.paramsFilter.forEach((filter) => {
        // @ts-ignore
        filter.value = updated[filter.field];
      });

      return this.getOneOrFail(req);
    }
  }

  /**
   * Recover one
   * @param req
   * @param dto
   */
  public async recoverOne(req: CrudRequest): Promise<T> {
    // disable cache while recovering
    // @ts-ignore
    req.options.query.cache = false;
    const found = await this.getOneOrFail(req, false, true);
    return this.repo.recover(found as DeepPartial<T>);
  }

  /**
   * Replace one
   * @param req
   * @param dto
   */
  public async replaceOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } = <ReplaceOneRouteOptions>(
      req.options.routes?.replaceOneBase
    );
    const paramsFilters = this.getParamFilters(req.parsed);
    // disable cache while replacing
    // @ts-ignore
    req.options.query.cache = false;
    const [_, found] = await oO(this.getOneOrFail(req, returnShallow));
    const toSave = !allowParamsOverride
      ? {
          ...(found || {}),
          ...dto,
          ...paramsFilters,
          ...req.parsed.authPersist,
        }
      : {
          ...(found || {}),
          ...paramsFilters,
          ...dto,
          ...req.parsed.authPersist,
        };
    const replaced = await this.repo.save(
      plainToInstance(
        this.entityType,
        toSave,
        req.parsed.classTransformOptions
      ) as unknown as DeepPartial<T>
    );

    if (returnShallow) {
      return replaced;
    } else {
      const primaryParams: string[] = this.getPrimaryParams(req.options);

      /* istanbul ignore if */
      if (!primaryParams.length) {
        return replaced;
      }

      req.parsed.search = primaryParams.reduce(
        (acc: {}, p: string) => ({
          ...acc,
          // @ts-ignore
          [p]: replaced[p],
        }),
        {}
      );
      return this.getOneOrFail(req);
    }
  }

  /**
   * Delete one
   * @param req
   */
  public async deleteOne(req: CrudRequest): Promise<void | T> {
    const { returnDeleted } = <DeleteOneRouteOptions>(
      req.options.routes?.deleteOneBase
    );
    // disable cache while deleting
    // @ts-ignore
    req.options.query.cache = false;
    const found: T = await this.getOneOrFail(req, returnDeleted);
    const toReturn: T | undefined = returnDeleted
      ? plainToInstance(
          this.entityType,
          { ...found },
          req.parsed.classTransformOptions
        )
      : undefined;

    const deleted: DeepPartial<T> & T =
      req.options.query?.softDelete === true
        ? await this.repo.softRemove(found as DeepPartial<T>)
        : await this.repo.remove(found);

    return toReturn;
  }

  public getParamFilters(parsed: CrudRequest["parsed"]): ObjectLiteral {
    const filters = {};

    if (!isEmpty(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        // @ts-ignore
        filters[filter.field] = filter.value;
      }
    }

    return filters;
  }

  /**
   * Create TypeOrm QueryBuilder
   * @param parsed
   * @param options
   * @param many
   * @param withDeleted
   */
  public async createBuilder(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    many = true,
    withDeleted = false
  ): Promise<SelectQueryBuilder<T>> {
    // create query builder
    const builder: SelectQueryBuilder<T> = this.repo.createQueryBuilder(
      this.alias
    );
    // get select fields
    const select: string[] = this.getSelect(parsed, options.query || {});
    // select fields
    builder.select(select);

    // if soft deleted is enabled add where statement to filter deleted records
    if (options.query?.softDelete) {
      if (parsed.includeDeleted === 1 || withDeleted) {
        builder.withDeleted();
      }
    }

    // search
    this.setSearchCondition(
      builder,
      parsed.search || {},
      options.operators?.custom || {}
    );

    // set joins
    const joinOptions: JoinOptions = options.query?.join || {};
    const allowedJoins: string[] = Object.keys(joinOptions);

    if (!isEmpty(allowedJoins)) {
      const eagerJoins: any = {};

      for (let i = 0; i < allowedJoins.length; i++) {
        if (joinOptions[allowedJoins[i]].eager) {
          const cond: QueryJoin = parsed.join.find(
            (j: QueryJoin) => j && j.field === allowedJoins[i]
          ) || {
            field: allowedJoins[i],
          };
          this.setJoin(cond, joinOptions, builder);
          eagerJoins[allowedJoins[i]] = true;
        }
      }

      if (isArrayFull(parsed.join)) {
        for (let i = 0; i < parsed.join.length; i++) {
          if (!eagerJoins[parsed.join[i].field]) {
            this.setJoin(parsed.join[i], joinOptions, builder);
          }
        }
      }
    }

    if (many) {
      // set sort (order by)
      const sort = this.getSort(parsed, options.query || {});
      builder.orderBy(sort);

      // set take
      const take = this.getTake(parsed, options.query || {});

      if (take && isFinite(take)) {
        builder.take(take);
      }

      // set skip
      const skip = this.getSkip(parsed, take || 0);

      if (skip && isFinite(skip)) {
        builder.skip(skip);
      }
    }

    // set cache

    if (options.query?.cache && parsed.cache !== 0) {
      builder.cache(options.query.cache);
    }

    return builder;
  }

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
  protected async doGetMany(
    builder: SelectQueryBuilder<T>,
    query: ParsedRequestParams,
    options: CrudRequestOptions
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    if (this.decidePagination(query, options)) {
      const [data, total] = await builder.getManyAndCount();
      const limit: number | undefined = builder.expressionMap.take;
      const offset: number | undefined = builder.expressionMap.skip;

      return this.createPageInfo(data, total, limit || total, offset || 0);
    }

    return builder.getMany();
  }

  protected onInitMapEntityColumns(): void {
    this.entityColumns = this.repo.metadata.columns.map(
      (prop: ColumnMetadata): string => {
        // In case column is an embedded, use the propertyPath to get complete path
        if (prop.embeddedMetadata) {
          this.entityColumnsHash[prop.propertyPath] = prop.databasePath;
          return prop.propertyPath;
        }
        this.entityColumnsHash[prop.propertyName] = prop.databasePath;
        return prop.propertyName;
      }
    );
    this.entityPrimaryColumns = this.repo.metadata.columns
      .filter((prop: ColumnMetadata) => prop.isPrimary)
      .map((prop: ColumnMetadata) => prop.propertyName);
    this.entityHasDeleteColumn = this.repo.metadata.columns.some(
      (prop: ColumnMetadata) => !isEmpty(prop.isDeleteDate)
    );
  }

  protected async getOneOrFail(
    req: CrudRequest,
    shallow = false,
    withDeleted = false
  ): Promise<T> {
    const { parsed, options } = req;
    const builder: SelectQueryBuilder<T> = shallow
      ? this.repo.createQueryBuilder(this.alias)
      : await this.createBuilder(parsed, options, true, withDeleted);

    if (shallow) {
      this.setSearchCondition(
        builder,
        parsed.search || null,
        <CustomOperators>options.operators?.custom
      );
    }

    const found: T | null = withDeleted
      ? await builder.withDeleted().getOne()
      : await builder.getOne();

    if (!found) {
      this.throwNotFoundException(this.alias);
    }

    return <T>found;
  }

  protected prepareEntityBeforeSave(
    dto: DeepPartial<T>,
    parsed: CrudRequest["parsed"]
  ): T | undefined {
    /* istanbul ignore if */
    if (!isObject(dto)) {
      return undefined;
    }

    if (!isEmpty(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        // @ts-ignore
        dto[filter.field] = filter.value;
      }
    }

    /* istanbul ignore if */
    if (isEmpty(Object.keys(dto))) {
      return undefined;
    }

    return dto instanceof this.entityType
      ? Object.assign(dto, parsed.authPersist)
      : plainToInstance(
          this.entityType,
          { ...dto, ...parsed.authPersist },
          parsed.classTransformOptions
        );
  }

  protected getAllowedColumns(
    columns: string[],
    options: QueryOptions
  ): string[] {
    return (!options.exclude || !options.exclude.length) &&
      (!options.allow || !options.allow.length)
      ? columns
      : columns.filter(
          (column: string) =>
            (options.exclude && options.exclude.length
              ? !options.exclude.some((col: string) => col === column)
              : true) &&
            (options.allow && options.allow.length
              ? options.allow.some((col) => col === column)
              : true)
        );
  }

  protected getEntityColumns(entityMetadata: EntityMetadata): {
    columns: string[];
    primaryColumns: string[];
  } {
    const columns: string[] =
      entityMetadata.columns.map((prop: ColumnMetadata) => prop.propertyPath) ||
      [];
    const primaryColumns: string[] =
      entityMetadata.primaryColumns.map(
        (prop: ColumnMetadata) => prop.propertyPath
      ) || [];

    return { columns, primaryColumns };
  }

  protected getRelationMetadata(
    field: string,
    options: JoinOption
  ): IAllowedRelation | null {
    try {
      let allowedRelation;
      let nested = false;

      if (this.entityRelationsHash.has(field)) {
        allowedRelation = this.entityRelationsHash.get(field);
      } else {
        const fields: string[] = field.split(".");
        let relationMetadata: EntityMetadata | null = null;
        let name: string | undefined;
        let path: string | undefined;
        let parentPath: string | undefined;

        if (fields.length === 1) {
          const found: RelationMetadata | undefined =
            this.repo.metadata.relations.find(
              (one: RelationMetadata): boolean => one.propertyName === fields[0]
            );

          if (found) {
            name = fields[0];
            path = `${this.alias}.${fields[0]}`;
            relationMetadata = found.inverseEntityMetadata;
          }
        } else {
          nested = true;
          parentPath = "";

          const reduced = fields.reduce(
            // @ts-ignore
            (res, propertyName: string, i) => {
              const found = res.relations?.length
                ? res.relations.find(
                    (one: RelationMetadata): boolean =>
                      one.propertyName === propertyName
                  )
                : null;
              relationMetadata = found ? found.inverseEntityMetadata : null;
              const relations: RelationMetadata[] = relationMetadata
                ? relationMetadata.relations
                : [];
              name = propertyName;

              if (i !== fields.length - 1) {
                parentPath = !parentPath
                  ? propertyName
                  : `${parentPath}.${propertyName}`;
              }

              return {
                relations,
                relationMetadata,
              };
            },
            {
              relations: this.repo.metadata.relations,
              relationMetadata: null,
            }
          );

          // @ts-ignore
          relationMetadata = reduced.relationMetadata;
        }

        // @ts-ignore
        if (relationMetadata) {
          const { columns, primaryColumns } =
            this.getEntityColumns(relationMetadata);

          if (!path && parentPath) {
            const parentAllowedRelation: IAllowedRelation | undefined =
              this.entityRelationsHash.get(parentPath);

            if (parentAllowedRelation) {
              path = parentAllowedRelation.alias
                ? `${parentAllowedRelation.alias}.${name}`
                : field;
            }
          }

          allowedRelation = {
            alias: options.alias,
            name,
            path,
            columns,
            nested,
            primaryColumns,
          };
        }
      }

      if (allowedRelation) {
        const allowedColumns: string[] = this.getAllowedColumns(
          allowedRelation.columns,
          options
        );
        const toSave: IAllowedRelation = <IAllowedRelation>{
          ...allowedRelation,
          allowedColumns,
        };

        this.entityRelationsHash.set(field, toSave);

        if (options.alias) {
          this.entityRelationsHash.set(options.alias, toSave);
        }

        return toSave;
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  protected setJoin(
    cond: QueryJoin,
    joinOptions: JoinOptions,
    builder: SelectQueryBuilder<T>
  ): undefined | void {
    const options: JoinOption = joinOptions[cond.field] ?? null;

    if (!options) {
      console.warn(
        'relation "' +
          cond.field +
          '" not found in allowed relations in the controller. Did you mean to use one of these? [' +
          Object.keys(joinOptions).join(", ") +
          "]"
      );
      return;
    }

    const allowedRelation: IAllowedRelation | null = this.getRelationMetadata(
      cond.field,
      options
    );

    if (!allowedRelation) {
      return;
    }

    const relationType = options.required ? "innerJoin" : "leftJoin";
    const alias: string = options.alias ? options.alias : allowedRelation.name;

    builder[relationType](allowedRelation.path, alias);

    if (options.select !== false) {
      const columns = isArrayFull(cond.select)
        ? cond.select?.filter((column: string) =>
            allowedRelation.allowedColumns.some(
              (allowed: string): boolean => allowed === column
            )
          ) || []
        : allowedRelation.allowedColumns || [];

      const select: string[] = [
        ...allowedRelation.primaryColumns,
        // @ts-ignore
        ...(isArrayFull(options.persist) ? options.persist : []),
        ...columns,
      ].map((col): string => `${alias}.${col}`);

      builder.addSelect(Array.from(new Set(select)));
    }
  }

  protected setAndWhere(
    cond: QueryFilter,
    i: any,
    builder: SelectQueryBuilder<T> | WhereExpressionBuilder,
    customOperators: CustomOperators
  ): void {
    const { str, params } = this.mapOperatorsToQuery(
      cond,
      `andWhere${i}`,
      customOperators
    );
    builder.andWhere(str, params);
  }

  protected setOrWhere(
    cond: QueryFilter,
    i: any,
    builder: SelectQueryBuilder<T> | WhereExpressionBuilder,
    customOperators: CustomOperators
  ): void {
    const { str, params } = this.mapOperatorsToQuery(
      cond,
      `orWhere${i}`,
      customOperators
    );
    builder.orWhere(str, params);
  }

  protected setSearchCondition(
    builder: SelectQueryBuilder<T>,
    search: SCondition | null,
    customOperators: CustomOperators,
    condition: SConditionKey = "$and"
  ): void {
    if (isObject(search)) {
      const keys = Object.keys(<SCondition>search);

      if (keys.length) {
        // search: {$ne: [...]}
        // @ts-ignore
        if (isArrayFull(search?.$ne)) {
          this.builderAddBrackets(
            builder,
            condition,
            new Brackets((qb: any): void => {
              // @ts-ignore
              search.$not.forEach((item: any): void => {
                this.setSearchCondition(qb, item, customOperators, "$and");
              });
            }),
            true
          );
        }
        // search: {$and: [...], ...}
        else if (isArrayFull(search?.$and)) {
          // search: {$and: [{}]}
          if (search?.$and?.length === 1) {
            this.setSearchCondition(
              builder,
              search.$and[0],
              customOperators,
              condition
            );
          }
          // search: {$and: [{}, {}, ...]}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: any): void => {
                search?.$and?.forEach((item: any): void => {
                  this.setSearchCondition(qb, item, customOperators, "$and");
                });
              })
            );
          }
        }
        // search: {$or: [...], ...}
        else if (isArrayFull(search?.$or)) {
          // search: {$or: [...]}
          if (keys.length === 1) {
            // search: {$or: [{}]}
            if (search?.$or?.length === 1) {
              this.setSearchCondition(
                builder,
                search.$or[0],
                customOperators,
                condition
              );
            }
            // search: {$or: [{}, {}, ...]}
            else {
              this.builderAddBrackets(
                builder,
                condition,
                new Brackets((qb: any) => {
                  search?.$or?.forEach((item: any) => {
                    this.setSearchCondition(qb, item, customOperators, "$or");
                  });
                })
              );
            }
          }
          // search: {$or: [...], foo, ...}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: any): void => {
                keys.forEach((field: string): void => {
                  if (field !== "$or") {
                    // @ts-ignore
                    const value = search[field];
                    if (!isObject(value)) {
                      this.builderSetWhere(
                        qb,
                        "$and",
                        field,
                        value,
                        customOperators
                      );
                    } else {
                      this.setSearchFieldObjectCondition(
                        qb,
                        "$and",
                        field,
                        value,
                        customOperators
                      );
                    }
                  } else {
                    if (search?.$or?.length === 1) {
                      this.setSearchCondition(
                        builder,
                        search.$or[0],
                        customOperators,
                        "$and"
                      );
                    } else {
                      this.builderAddBrackets(
                        qb,
                        "$and",
                        new Brackets((qb2: any) => {
                          search?.$or?.forEach((item: any) => {
                            this.setSearchCondition(
                              qb2,
                              item,
                              customOperators,
                              "$or"
                            );
                          });
                        })
                      );
                    }
                  }
                });
              })
            );
          }
        }
        // search: {...}
        else {
          // search: {foo}
          if (keys.length === 1) {
            const field: string = keys[0];
            // @ts-ignore
            const value = search[field];
            if (!isObject(value)) {
              this.builderSetWhere(
                builder,
                condition,
                field,
                value,
                customOperators
              );
            } else {
              this.setSearchFieldObjectCondition(
                builder,
                condition,
                field,
                value,
                customOperators
              );
            }
          }
          // search: {foo, ...}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: any) => {
                keys.forEach((field: string) => {
                  // @ts-ignore
                  const value = search[field];
                  if (!isObject(value)) {
                    this.builderSetWhere(
                      qb,
                      "$and",
                      field,
                      value,
                      customOperators
                    );
                  } else {
                    this.setSearchFieldObjectCondition(
                      qb,
                      "$and",
                      field,
                      value,
                      customOperators
                    );
                  }
                });
              })
            );
          }
        }
      }
    }
  }

  protected builderAddBrackets(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    brackets: Brackets,
    negated = false
  ) {
    if (negated) {
      // No builtin support for not, this is copied from QueryBuilder.getWhereCondition

      const whereQueryBuilder: SelectQueryBuilder<T> =
        builder.createQueryBuilder();

      (whereQueryBuilder as any).parentQueryBuilder = builder;

      whereQueryBuilder.expressionMap.mainAlias =
        builder.expressionMap.mainAlias;
      whereQueryBuilder.expressionMap.aliasNamePrefixingEnabled =
        builder.expressionMap.aliasNamePrefixingEnabled;
      whereQueryBuilder.expressionMap.parameters =
        builder.expressionMap.parameters;
      whereQueryBuilder.expressionMap.nativeParameters =
        builder.expressionMap.nativeParameters;

      whereQueryBuilder.expressionMap.wheres = [];

      brackets.whereFactory(whereQueryBuilder as any);

      const wheres = {
        operator: "brackets",
        condition: whereQueryBuilder.expressionMap.wheres,
      };

      const type =
        condition === "$and" ? "and" : condition === "$or" ? "or" : "simple";
      builder.expressionMap.wheres.push({
        type,
        condition: {
          operator: "not",
          condition: wheres as any,
        },
      });
    } else if (condition === "$and") {
      builder.andWhere(brackets);
    } else {
      builder.orWhere(brackets);
    }
  }

  protected builderSetWhere(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    field: string,
    value: any,
    customOperators: CustomOperators,
    operator: ComparisonOperator = "$eq"
  ): void {
    const time = process.hrtime();
    // const index = `${field}${time[0]}${time[1]}`;
    /**
     * Correcting the Error [Invalid Column Name] or [ syntax error at or near \":\".]
     * When using filter or search in relational/nested entities.
     */
    const safeFieldName = field.replace(/./g, "_");
    const index = `${safeFieldName}${time[0]}${time[1]}`;

    const args = [
      { field, operator: isNull(value) ? "$isnull" : operator, value },
      index,
      builder,
      customOperators,
    ];
    const fn = condition === "$and" ? this.setAndWhere : this.setOrWhere;
    // @ts-ignore
    fn.apply(this, args);
  }

  protected setSearchFieldObjectCondition(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    field: string,
    object: any,
    customOperators: CustomOperators
  ): void {
    if (isObject(object)) {
      const operators: string[] = Object.keys(object);

      if (operators.length === 1) {
        const operator: string = operators[0] as ComparisonOperator;
        const value = object[operator];

        if (isObject(object.$or)) {
          const orKeys: string[] = Object.keys(object.$or);
          this.setSearchFieldObjectCondition(
            builder,
            orKeys.length === 1 ? condition : "$or",
            field,
            object.$or,
            customOperators
          );
        } else {
          this.builderSetWhere(
            builder,
            condition,
            field,
            value,
            customOperators,
            operator
          );
        }
      } else {
        if (operators.length > 1) {
          this.builderAddBrackets(
            builder,
            condition,
            new Brackets((qb: any): void => {
              operators.forEach((operator: ComparisonOperator): void => {
                const value = object[operator];

                if (operator !== "$or") {
                  this.builderSetWhere(
                    qb,
                    condition,
                    field,
                    value,
                    customOperators,
                    operator
                  );
                } else {
                  const orKeys: string[] = Object.keys(object.$or);

                  if (orKeys.length === 1) {
                    this.setSearchFieldObjectCondition(
                      qb,
                      condition,
                      field,
                      object.$or,
                      customOperators
                    );
                  } else {
                    this.builderAddBrackets(
                      qb,
                      condition,
                      new Brackets((qb2: any) => {
                        this.setSearchFieldObjectCondition(
                          qb2,
                          "$or",
                          field,
                          object.$or,
                          customOperators
                        );
                      })
                    );
                  }
                }
              });
            })
          );
        }
      }
    }
  }

  protected getSelect(
    query: ParsedRequestParams,
    options: QueryOptions
  ): string[] {
    const allowed: string[] = this.getAllowedColumns(
      this.entityColumns || [],
      options
    );
    const columns =
      query.fields && query.fields.length
        ? query.fields.filter((field) =>
            allowed.some((col: string): boolean => field === col)
          )
        : allowed;
    return [
      ...new Set([
        ...(options.persist && options.persist.length ? options.persist : []),
        ...columns,
        ...(this.entityPrimaryColumns || []),
      ]),
    ].map((col): string => `${this.alias}.${col}`);
  }

  protected getSort(query: ParsedRequestParams, options: QueryOptions) {
    return query.sort && query.sort.length
      ? this.mapSort(query.sort)
      : options.sort && options.sort.length
      ? this.mapSort(options.sort)
      : {};
  }

  protected getFieldWithAlias(field: string, sort = false) {
    const i = ["mysql", "mariadb"].includes(this.dbName) ? "`" : '"';
    const cols = field.split(".");

    switch (cols.length) {
      case 1:
        if (sort) {
          return `${this.alias}.${field}`;
        }

        const dbColName =
          this.entityColumnsHash[field] !== field
            ? this.entityColumnsHash[field]
            : field;

        return `${i}${this.alias}${i}.${i}${dbColName}${i}`;
      case 2:
        return field;
      default:
        return cols.slice(cols.length - 2, cols.length).join(".");
    }
  }

  protected mapSort(sort: QuerySort[]) {
    const params: ObjectLiteral = {};

    for (let i = 0; i < sort.length; i++) {
      const field = this.getFieldWithAlias(sort[i].field, true);
      const checkedFiled = this.checkSqlInjection(field);
      params[checkedFiled] = sort[i].order;
    }

    return params;
  }

  protected mapOperatorsToQuery(
    cond: QueryFilter,
    param: any,
    customOperators: CustomOperators = {}
  ): { str: string; params: ObjectLiteral } {
    const field: string = this.getFieldWithAlias(cond.field);
    const likeOperator = this.dbName === "postgres" ? "ILIKE" : "LIKE";
    let str: string | undefined;
    let params: ObjectLiteral | undefined;

    if (cond.operator[0] !== "$") {
      cond.operator = ("$" + cond.operator) as ComparisonOperator;
    }

    switch (cond.operator) {
      case CondOperator.EQUALS:
        str = `${field} = :${param}`;
        break;

      case CondOperator.NOT_EQUALS:
        str = `${field} != :${param}`;
        break;

      case CondOperator.GREATER_THAN:
        str = `${field} > :${param}`;
        break;

      case CondOperator.LOWER_THAN:
        str = `${field} < :${param}`;
        break;

      case CondOperator.GREATER_THAN_EQUALS:
        str = `${field} >= :${param}`;
        break;

      case CondOperator.LOWER_THAN_EQUALS:
        str = `${field} <= :${param}`;
        break;

      case CondOperator.STARTS:
        str = `${field} LIKE :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case CondOperator.ENDS:
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case CondOperator.CONTAINS:
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case CondOperator.EXCLUDES:
        str = `${field} NOT LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case CondOperator.IN:
        this.checkFilterIsArray(cond);
        str = `${field} IN (:...${param})`;
        break;

      case CondOperator.NOT_IN:
        this.checkFilterIsArray(cond);
        str = `${field} NOT IN (:...${param})`;
        break;

      case CondOperator.IS_NULL:
        str = `${field} IS NULL`;
        params = {};
        break;

      case CondOperator.NOT_NULL:
        str = `${field} IS NOT NULL`;
        params = {};
        break;

      case CondOperator.BETWEEN:
        this.checkFilterIsArray(cond, cond.value.length !== 2);
        str = `${field} BETWEEN :${param}0 AND :${param}1`;
        params = {
          [`${param}0`]: cond.value[0],
          [`${param}1`]: cond.value[1],
        };
        break;

      // case insensitive
      case CondOperator.EQUALS_LOW:
        str = `LOWER(${field}) = :${param}`;
        break;

      case CondOperator.NOT_EQUALS_LOW:
        str = `LOWER(${field}) != :${param}`;
        break;

      case CondOperator.STARTS_LOW:
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case CondOperator.ENDS_LOW:
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case CondOperator.CONTAINS_LOW:
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case CondOperator.EXCLUDES_LOW:
        str = `LOWER(${field}) NOT ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case CondOperator.IN_LOW:
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) IN (:...${param})`;
        break;

      case CondOperator.NOT_IN_LOW:
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) NOT IN (:...${param})`;
        break;

      default:
        const customOperator = customOperators[cond.operator];

        if (!customOperator) {
          str = `${field} = :${param}`;
          break;
        }

        try {
          if (customOperator.isArray) {
            this.checkFilterIsArray(cond);
          }
          str = customOperator.query(field, param);
          params = customOperator.params || {};
        } catch (error) {
          this.throwBadRequestException(
            `Invalid custom operator '${field}' query`
          );
        }

        break;
    }

    if (typeof params === "undefined") {
      params = { [param]: cond.value };
    }

    return { str: <string>str, params };
  }

  protected checkFilterIsArray(cond: QueryFilter, withLength?: boolean) {
    /* istanbul ignore if */
    if (
      !Array.isArray(cond.value) ||
      !cond.value.length ||
      (!isNil(withLength) ? withLength : false)
    ) {
      this.throwBadRequestException(`Invalid column '${cond.field}' value`);
    }
  }

  protected checkSqlInjection(field: string): string {
    if (this.sqlInjectionRegEx.length) {
      for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
        if (this.sqlInjectionRegEx[i].test(field)) {
          this.throwBadRequestException(`SQL injection detected: "${field}"`);
        }
      }
    }

    return field;
  }
}
