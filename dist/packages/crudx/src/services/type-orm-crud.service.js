"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmCrudService = void 0;
const tslib_1 = require("tslib");
const o0_1 = require("@zmotivat0r/o0");
const class_transformer_1 = require("class-transformer");
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
const abstract_crud_service_1 = require("./abstract-crud.service");
class TypeOrmCrudService extends abstract_crud_service_1.CrudService {
    constructor(repo) {
        super();
        this.repo = repo;
        this.entityHasDeleteColumn = false;
        this.entityColumnsHash = {};
        this.entityRelationsHash = new Map();
        this.sqlInjectionRegEx = [
            /(%27)|(')|(--)|(%23)|(#)/gi,
            /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/gi,
            /w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
            /((%27)|('))union/gi,
        ];
        this.dbName = this.repo.metadata.connection.options.type;
        this.onInitMapEntityColumns();
    }
    get findOne() {
        return this.repo.findOne.bind(this.repo);
    }
    get findOneBy() {
        return this.repo.findOneBy.bind(this.repo);
    }
    get find() {
        return this.repo.find.bind(this.repo);
    }
    get count() {
        return this.repo.count.bind(this.repo);
    }
    get entityType() {
        return this.repo.target;
    }
    get alias() {
        return this.repo.metadata.targetName;
    }
    /**
     * Get many
     * @param req
     */
    getMany(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { parsed, options } = req;
            const builder = yield this.createBuilder(parsed, options);
            return this.doGetMany(builder, parsed, options);
        });
    }
    /**
     * Get one
     * @param req
     */
    getOne(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.getOneOrFail(req);
        });
    }
    /**
     * Create one
     * @param req
     * @param dto
     */
    createOne(req, dto) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const { returnShallow } = (_a = req.options.routes) === null || _a === void 0 ? void 0 : _a.createOneBase;
            const entity = this.prepareEntityBeforeSave(dto, req.parsed);
            /* istanbul ignore if */
            if (!entity) {
                this.throwBadRequestException(`Empty data. Nothing to save.`);
            }
            const saved = yield this.repo.save(entity);
            if (returnShallow) {
                return saved;
            }
            else {
                const primaryParams = this.getPrimaryParams(req.options);
                if ((0, lodash_1.isEmpty)(primaryParams) &&
                    primaryParams.some((p) => (0, lodash_1.isNil)(saved[p]))) {
                    return saved;
                }
                else {
                    req.parsed.search = primaryParams.reduce((acc, p) => (Object.assign(Object.assign({}, acc), { [p]: saved[p] })), {});
                    return this.getOneOrFail(req);
                }
            }
        });
    }
    /**
     * Create many
     * @param req
     * @param dto
     */
    createMany(req, dto) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /* istanbul ignore if */
            if (!(0, helpers_1.isObject)(dto) || !(0, helpers_1.isArrayFull)(dto.bulk)) {
                this.throwBadRequestException(`Empty data. Nothing to save.`);
            }
            const bulk = dto.bulk
                .map((one) => this.prepareEntityBeforeSave(one, req.parsed))
                .filter((d) => !(0, lodash_1.isUndefined)(d));
            /* istanbul ignore if */
            if (!bulk.length) {
                this.throwBadRequestException(`Empty data. Nothing to save.`);
            }
            return this.repo.save(bulk, { chunk: 50 });
        });
    }
    /**
     * Update one
     * @param req
     * @param dto
     */
    updateOne(req, dto) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { allowParamsOverride, returnShallow } = ((_a = req.options.routes) === null || _a === void 0 ? void 0 : _a.updateOneBase);
            const paramsFilters = this.getParamFilters(req.parsed);
            // disable cache while updating
            // @ts-ignore
            req.options.query.cache = false;
            const found = yield this.getOneOrFail(req, returnShallow);
            const toSave = !allowParamsOverride
                ? Object.assign(Object.assign(Object.assign(Object.assign({}, found), dto), paramsFilters), req.parsed.authPersist) : Object.assign(Object.assign(Object.assign({}, found), dto), req.parsed.authPersist);
            const updated = yield this.repo.save((0, class_transformer_1.plainToInstance)(this.entityType, toSave, req.parsed.classTransformOptions));
            if (returnShallow) {
                return updated;
            }
            else {
                req.parsed.paramsFilter.forEach((filter) => {
                    // @ts-ignore
                    filter.value = updated[filter.field];
                });
                return this.getOneOrFail(req);
            }
        });
    }
    /**
     * Recover one
     * @param req
     * @param dto
     */
    recoverOne(req) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // disable cache while recovering
            // @ts-ignore
            req.options.query.cache = false;
            const found = yield this.getOneOrFail(req, false, true);
            return this.repo.recover(found);
        });
    }
    /**
     * Replace one
     * @param req
     * @param dto
     */
    replaceOne(req, dto) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { allowParamsOverride, returnShallow } = ((_a = req.options.routes) === null || _a === void 0 ? void 0 : _a.replaceOneBase);
            const paramsFilters = this.getParamFilters(req.parsed);
            // disable cache while replacing
            // @ts-ignore
            req.options.query.cache = false;
            const [_, found] = yield (0, o0_1.oO)(this.getOneOrFail(req, returnShallow));
            const toSave = !allowParamsOverride
                ? Object.assign(Object.assign(Object.assign(Object.assign({}, (found || {})), dto), paramsFilters), req.parsed.authPersist) : Object.assign(Object.assign(Object.assign(Object.assign({}, (found || {})), paramsFilters), dto), req.parsed.authPersist);
            const replaced = yield this.repo.save((0, class_transformer_1.plainToInstance)(this.entityType, toSave, req.parsed.classTransformOptions));
            if (returnShallow) {
                return replaced;
            }
            else {
                const primaryParams = this.getPrimaryParams(req.options);
                /* istanbul ignore if */
                if (!primaryParams.length) {
                    return replaced;
                }
                req.parsed.search = primaryParams.reduce((acc, p) => (Object.assign(Object.assign({}, acc), { 
                    // @ts-ignore
                    [p]: replaced[p] })), {});
                return this.getOneOrFail(req);
            }
        });
    }
    /**
     * Delete one
     * @param req
     */
    deleteOne(req) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { returnDeleted } = ((_a = req.options.routes) === null || _a === void 0 ? void 0 : _a.deleteOneBase);
            // disable cache while deleting
            // @ts-ignore
            req.options.query.cache = false;
            const found = yield this.getOneOrFail(req, returnDeleted);
            const toReturn = returnDeleted
                ? (0, class_transformer_1.plainToInstance)(this.entityType, Object.assign({}, found), req.parsed.classTransformOptions)
                : undefined;
            const deleted = ((_b = req.options.query) === null || _b === void 0 ? void 0 : _b.softDelete) === true
                ? yield this.repo.softRemove(found)
                : yield this.repo.remove(found);
            return toReturn;
        });
    }
    getParamFilters(parsed) {
        const filters = {};
        if (!(0, lodash_1.isEmpty)(parsed.paramsFilter)) {
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
    createBuilder(parsed, options, many = true, withDeleted = false) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // create query builder
            const builder = this.repo.createQueryBuilder(this.alias);
            // get select fields
            const select = this.getSelect(parsed, options.query || {});
            // select fields
            builder.select(select);
            // if soft deleted is enabled add where statement to filter deleted records
            if ((_a = options.query) === null || _a === void 0 ? void 0 : _a.softDelete) {
                if (parsed.includeDeleted === 1 || withDeleted) {
                    builder.withDeleted();
                }
            }
            // search
            this.setSearchCondition(builder, parsed.search || {}, ((_b = options.operators) === null || _b === void 0 ? void 0 : _b.custom) || {});
            // set joins
            const joinOptions = ((_c = options.query) === null || _c === void 0 ? void 0 : _c.join) || {};
            const allowedJoins = Object.keys(joinOptions);
            if (!(0, lodash_1.isEmpty)(allowedJoins)) {
                const eagerJoins = {};
                for (let i = 0; i < allowedJoins.length; i++) {
                    if (joinOptions[allowedJoins[i]].eager) {
                        const cond = parsed.join.find((j) => j && j.field === allowedJoins[i]) || {
                            field: allowedJoins[i],
                        };
                        this.setJoin(cond, joinOptions, builder);
                        eagerJoins[allowedJoins[i]] = true;
                    }
                }
                if ((0, helpers_1.isArrayFull)(parsed.join)) {
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
            if (((_d = options.query) === null || _d === void 0 ? void 0 : _d.cache) && parsed.cache !== 0) {
                builder.cache(options.query.cache);
            }
            return builder;
        });
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
    doGetMany(builder, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.decidePagination(query, options)) {
                const [data, total] = yield builder.getManyAndCount();
                const limit = builder.expressionMap.take;
                const offset = builder.expressionMap.skip;
                return this.createPageInfo(data, total, limit || total, offset || 0);
            }
            return builder.getMany();
        });
    }
    onInitMapEntityColumns() {
        this.entityColumns = this.repo.metadata.columns.map((prop) => {
            // In case column is an embedded, use the propertyPath to get complete path
            if (prop.embeddedMetadata) {
                this.entityColumnsHash[prop.propertyPath] = prop.databasePath;
                return prop.propertyPath;
            }
            this.entityColumnsHash[prop.propertyName] = prop.databasePath;
            return prop.propertyName;
        });
        this.entityPrimaryColumns = this.repo.metadata.columns
            .filter((prop) => prop.isPrimary)
            .map((prop) => prop.propertyName);
        this.entityHasDeleteColumn = this.repo.metadata.columns.some((prop) => !(0, lodash_1.isEmpty)(prop.isDeleteDate));
    }
    getOneOrFail(req, shallow = false, withDeleted = false) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { parsed, options } = req;
            const builder = shallow
                ? this.repo.createQueryBuilder(this.alias)
                : yield this.createBuilder(parsed, options, true, withDeleted);
            if (shallow) {
                this.setSearchCondition(builder, parsed.search || null, (_a = options.operators) === null || _a === void 0 ? void 0 : _a.custom);
            }
            const found = withDeleted
                ? yield builder.withDeleted().getOne()
                : yield builder.getOne();
            if (!found) {
                this.throwNotFoundException(this.alias);
            }
            return found;
        });
    }
    prepareEntityBeforeSave(dto, parsed) {
        /* istanbul ignore if */
        if (!(0, helpers_1.isObject)(dto)) {
            return undefined;
        }
        if (!(0, lodash_1.isEmpty)(parsed.paramsFilter)) {
            for (const filter of parsed.paramsFilter) {
                // @ts-ignore
                dto[filter.field] = filter.value;
            }
        }
        /* istanbul ignore if */
        if ((0, lodash_1.isEmpty)(Object.keys(dto))) {
            return undefined;
        }
        return dto instanceof this.entityType
            ? Object.assign(dto, parsed.authPersist)
            : (0, class_transformer_1.plainToInstance)(this.entityType, Object.assign(Object.assign({}, dto), parsed.authPersist), parsed.classTransformOptions);
    }
    getAllowedColumns(columns, options) {
        return (!options.exclude || !options.exclude.length) &&
            (!options.allow || !options.allow.length)
            ? columns
            : columns.filter((column) => (options.exclude && options.exclude.length
                ? !options.exclude.some((col) => col === column)
                : true) &&
                (options.allow && options.allow.length
                    ? options.allow.some((col) => col === column)
                    : true));
    }
    getEntityColumns(entityMetadata) {
        const columns = entityMetadata.columns.map((prop) => prop.propertyPath) ||
            [];
        const primaryColumns = entityMetadata.primaryColumns.map((prop) => prop.propertyPath) || [];
        return { columns, primaryColumns };
    }
    getRelationMetadata(field, options) {
        try {
            let allowedRelation;
            let nested = false;
            if (this.entityRelationsHash.has(field)) {
                allowedRelation = this.entityRelationsHash.get(field);
            }
            else {
                const fields = field.split(".");
                let relationMetadata = null;
                let name;
                let path;
                let parentPath;
                if (fields.length === 1) {
                    const found = this.repo.metadata.relations.find((one) => one.propertyName === fields[0]);
                    if (found) {
                        name = fields[0];
                        path = `${this.alias}.${fields[0]}`;
                        relationMetadata = found.inverseEntityMetadata;
                    }
                }
                else {
                    nested = true;
                    parentPath = "";
                    const reduced = fields.reduce(
                    // @ts-ignore
                    (res, propertyName, i) => {
                        var _a;
                        const found = ((_a = res.relations) === null || _a === void 0 ? void 0 : _a.length)
                            ? res.relations.find((one) => one.propertyName === propertyName)
                            : null;
                        relationMetadata = found ? found.inverseEntityMetadata : null;
                        const relations = relationMetadata
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
                    }, {
                        relations: this.repo.metadata.relations,
                        relationMetadata: null,
                    });
                    // @ts-ignore
                    relationMetadata = reduced.relationMetadata;
                }
                // @ts-ignore
                if (relationMetadata) {
                    const { columns, primaryColumns } = this.getEntityColumns(relationMetadata);
                    if (!path && parentPath) {
                        const parentAllowedRelation = this.entityRelationsHash.get(parentPath);
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
                const allowedColumns = this.getAllowedColumns(allowedRelation.columns, options);
                const toSave = Object.assign(Object.assign({}, allowedRelation), { allowedColumns });
                this.entityRelationsHash.set(field, toSave);
                if (options.alias) {
                    this.entityRelationsHash.set(options.alias, toSave);
                }
                return toSave;
            }
        }
        catch (_) {
            return null;
        }
        return null;
    }
    setJoin(cond, joinOptions, builder) {
        var _a, _b;
        const options = (_a = joinOptions[cond.field]) !== null && _a !== void 0 ? _a : null;
        if (!options) {
            console.warn('relation "' +
                cond.field +
                '" not found in allowed relations in the controller. Did you mean to use one of these? [' +
                Object.keys(joinOptions).join(", ") +
                "]");
            return;
        }
        const allowedRelation = this.getRelationMetadata(cond.field, options);
        if (!allowedRelation) {
            return;
        }
        const relationType = options.required ? "innerJoin" : "leftJoin";
        const alias = options.alias ? options.alias : allowedRelation.name;
        builder[relationType](allowedRelation.path, alias);
        if (options.select !== false) {
            const columns = (0, helpers_1.isArrayFull)(cond.select)
                ? ((_b = cond.select) === null || _b === void 0 ? void 0 : _b.filter((column) => allowedRelation.allowedColumns.some((allowed) => allowed === column))) || []
                : allowedRelation.allowedColumns || [];
            const select = [
                ...allowedRelation.primaryColumns,
                // @ts-ignore
                ...((0, helpers_1.isArrayFull)(options.persist) ? options.persist : []),
                ...columns,
            ].map((col) => `${alias}.${col}`);
            builder.addSelect(Array.from(new Set(select)));
        }
    }
    setAndWhere(cond, i, builder, customOperators) {
        const { str, params } = this.mapOperatorsToQuery(cond, `andWhere${i}`, customOperators);
        builder.andWhere(str, params);
    }
    setOrWhere(cond, i, builder, customOperators) {
        const { str, params } = this.mapOperatorsToQuery(cond, `orWhere${i}`, customOperators);
        builder.orWhere(str, params);
    }
    setSearchCondition(builder, search, customOperators, condition = "$and") {
        var _a, _b;
        if ((0, helpers_1.isObject)(search)) {
            const keys = Object.keys(search);
            if (keys.length) {
                // search: {$ne: [...]}
                // @ts-ignore
                if ((0, helpers_1.isArrayFull)(search === null || search === void 0 ? void 0 : search.$ne)) {
                    this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                        // @ts-ignore
                        search.$not.forEach((item) => {
                            this.setSearchCondition(qb, item, customOperators, "$and");
                        });
                    }), true);
                }
                // search: {$and: [...], ...}
                else if ((0, helpers_1.isArrayFull)(search === null || search === void 0 ? void 0 : search.$and)) {
                    // search: {$and: [{}]}
                    if (((_a = search === null || search === void 0 ? void 0 : search.$and) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                        this.setSearchCondition(builder, search.$and[0], customOperators, condition);
                    }
                    // search: {$and: [{}, {}, ...]}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            var _a;
                            (_a = search === null || search === void 0 ? void 0 : search.$and) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                                this.setSearchCondition(qb, item, customOperators, "$and");
                            });
                        }));
                    }
                }
                // search: {$or: [...], ...}
                else if ((0, helpers_1.isArrayFull)(search === null || search === void 0 ? void 0 : search.$or)) {
                    // search: {$or: [...]}
                    if (keys.length === 1) {
                        // search: {$or: [{}]}
                        if (((_b = search === null || search === void 0 ? void 0 : search.$or) === null || _b === void 0 ? void 0 : _b.length) === 1) {
                            this.setSearchCondition(builder, search.$or[0], customOperators, condition);
                        }
                        // search: {$or: [{}, {}, ...]}
                        else {
                            this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                                var _a;
                                (_a = search === null || search === void 0 ? void 0 : search.$or) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                                    this.setSearchCondition(qb, item, customOperators, "$or");
                                });
                            }));
                        }
                    }
                    // search: {$or: [...], foo, ...}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            keys.forEach((field) => {
                                var _a;
                                if (field !== "$or") {
                                    // @ts-ignore
                                    const value = search[field];
                                    if (!(0, helpers_1.isObject)(value)) {
                                        this.builderSetWhere(qb, "$and", field, value, customOperators);
                                    }
                                    else {
                                        this.setSearchFieldObjectCondition(qb, "$and", field, value, customOperators);
                                    }
                                }
                                else {
                                    if (((_a = search === null || search === void 0 ? void 0 : search.$or) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                                        this.setSearchCondition(builder, search.$or[0], customOperators, "$and");
                                    }
                                    else {
                                        this.builderAddBrackets(qb, "$and", new typeorm_1.Brackets((qb2) => {
                                            var _a;
                                            (_a = search === null || search === void 0 ? void 0 : search.$or) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                                                this.setSearchCondition(qb2, item, customOperators, "$or");
                                            });
                                        }));
                                    }
                                }
                            });
                        }));
                    }
                }
                // search: {...}
                else {
                    // search: {foo}
                    if (keys.length === 1) {
                        const field = keys[0];
                        // @ts-ignore
                        const value = search[field];
                        if (!(0, helpers_1.isObject)(value)) {
                            this.builderSetWhere(builder, condition, field, value, customOperators);
                        }
                        else {
                            this.setSearchFieldObjectCondition(builder, condition, field, value, customOperators);
                        }
                    }
                    // search: {foo, ...}
                    else {
                        this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                            keys.forEach((field) => {
                                // @ts-ignore
                                const value = search[field];
                                if (!(0, helpers_1.isObject)(value)) {
                                    this.builderSetWhere(qb, "$and", field, value, customOperators);
                                }
                                else {
                                    this.setSearchFieldObjectCondition(qb, "$and", field, value, customOperators);
                                }
                            });
                        }));
                    }
                }
            }
        }
    }
    builderAddBrackets(builder, condition, brackets, negated = false) {
        if (negated) {
            // No builtin support for not, this is copied from QueryBuilder.getWhereCondition
            const whereQueryBuilder = builder.createQueryBuilder();
            whereQueryBuilder.parentQueryBuilder = builder;
            whereQueryBuilder.expressionMap.mainAlias =
                builder.expressionMap.mainAlias;
            whereQueryBuilder.expressionMap.aliasNamePrefixingEnabled =
                builder.expressionMap.aliasNamePrefixingEnabled;
            whereQueryBuilder.expressionMap.parameters =
                builder.expressionMap.parameters;
            whereQueryBuilder.expressionMap.nativeParameters =
                builder.expressionMap.nativeParameters;
            whereQueryBuilder.expressionMap.wheres = [];
            brackets.whereFactory(whereQueryBuilder);
            const wheres = {
                operator: "brackets",
                condition: whereQueryBuilder.expressionMap.wheres,
            };
            const type = condition === "$and" ? "and" : condition === "$or" ? "or" : "simple";
            builder.expressionMap.wheres.push({
                type,
                condition: {
                    operator: "not",
                    condition: wheres,
                },
            });
        }
        else if (condition === "$and") {
            builder.andWhere(brackets);
        }
        else {
            builder.orWhere(brackets);
        }
    }
    builderSetWhere(builder, condition, field, value, customOperators, operator = "$eq") {
        const time = process.hrtime();
        // const index = `${field}${time[0]}${time[1]}`;
        /**
         * Correcting the Error [Invalid Column Name] or [ syntax error at or near \":\".]
         * When using filter or search in relational/nested entities.
         */
        const safeFieldName = field.replace(/./g, "_");
        const index = `${safeFieldName}${time[0]}${time[1]}`;
        const args = [
            { field, operator: (0, lodash_1.isNull)(value) ? "$isnull" : operator, value },
            index,
            builder,
            customOperators,
        ];
        const fn = condition === "$and" ? this.setAndWhere : this.setOrWhere;
        // @ts-ignore
        fn.apply(this, args);
    }
    setSearchFieldObjectCondition(builder, condition, field, object, customOperators) {
        if ((0, helpers_1.isObject)(object)) {
            const operators = Object.keys(object);
            if (operators.length === 1) {
                const operator = operators[0];
                const value = object[operator];
                if ((0, helpers_1.isObject)(object.$or)) {
                    const orKeys = Object.keys(object.$or);
                    this.setSearchFieldObjectCondition(builder, orKeys.length === 1 ? condition : "$or", field, object.$or, customOperators);
                }
                else {
                    this.builderSetWhere(builder, condition, field, value, customOperators, operator);
                }
            }
            else {
                if (operators.length > 1) {
                    this.builderAddBrackets(builder, condition, new typeorm_1.Brackets((qb) => {
                        operators.forEach((operator) => {
                            const value = object[operator];
                            if (operator !== "$or") {
                                this.builderSetWhere(qb, condition, field, value, customOperators, operator);
                            }
                            else {
                                const orKeys = Object.keys(object.$or);
                                if (orKeys.length === 1) {
                                    this.setSearchFieldObjectCondition(qb, condition, field, object.$or, customOperators);
                                }
                                else {
                                    this.builderAddBrackets(qb, condition, new typeorm_1.Brackets((qb2) => {
                                        this.setSearchFieldObjectCondition(qb2, "$or", field, object.$or, customOperators);
                                    }));
                                }
                            }
                        });
                    }));
                }
            }
        }
    }
    getSelect(query, options) {
        const allowed = this.getAllowedColumns(this.entityColumns || [], options);
        const columns = query.fields && query.fields.length
            ? query.fields.filter((field) => allowed.some((col) => field === col))
            : allowed;
        return [
            ...new Set([
                ...(options.persist && options.persist.length ? options.persist : []),
                ...columns,
                ...(this.entityPrimaryColumns || []),
            ]),
        ].map((col) => `${this.alias}.${col}`);
    }
    getSort(query, options) {
        return query.sort && query.sort.length
            ? this.mapSort(query.sort)
            : options.sort && options.sort.length
                ? this.mapSort(options.sort)
                : {};
    }
    getFieldWithAlias(field, sort = false) {
        const i = ["mysql", "mariadb"].includes(this.dbName) ? "`" : '"';
        const cols = field.split(".");
        switch (cols.length) {
            case 1:
                if (sort) {
                    return `${this.alias}.${field}`;
                }
                const dbColName = this.entityColumnsHash[field] !== field
                    ? this.entityColumnsHash[field]
                    : field;
                return `${i}${this.alias}${i}.${i}${dbColName}${i}`;
            case 2:
                return field;
            default:
                return cols.slice(cols.length - 2, cols.length).join(".");
        }
    }
    mapSort(sort) {
        const params = {};
        for (let i = 0; i < sort.length; i++) {
            const field = this.getFieldWithAlias(sort[i].field, true);
            const checkedFiled = this.checkSqlInjection(field);
            params[checkedFiled] = sort[i].order;
        }
        return params;
    }
    mapOperatorsToQuery(cond, param, customOperators = {}) {
        const field = this.getFieldWithAlias(cond.field);
        const likeOperator = this.dbName === "postgres" ? "ILIKE" : "LIKE";
        let str;
        let params;
        if (cond.operator[0] !== "$") {
            cond.operator = ("$" + cond.operator);
        }
        switch (cond.operator) {
            case types_1.CondOperator.EQUALS:
                str = `${field} = :${param}`;
                break;
            case types_1.CondOperator.NOT_EQUALS:
                str = `${field} != :${param}`;
                break;
            case types_1.CondOperator.GREATER_THAN:
                str = `${field} > :${param}`;
                break;
            case types_1.CondOperator.LOWER_THAN:
                str = `${field} < :${param}`;
                break;
            case types_1.CondOperator.GREATER_THAN_EQUALS:
                str = `${field} >= :${param}`;
                break;
            case types_1.CondOperator.LOWER_THAN_EQUALS:
                str = `${field} <= :${param}`;
                break;
            case types_1.CondOperator.STARTS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `${cond.value}%` };
                break;
            case types_1.CondOperator.ENDS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `%${cond.value}` };
                break;
            case types_1.CondOperator.CONTAINS:
                str = `${field} LIKE :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.EXCLUDES:
                str = `${field} NOT LIKE :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.IN:
                this.checkFilterIsArray(cond);
                str = `${field} IN (:...${param})`;
                break;
            case types_1.CondOperator.NOT_IN:
                this.checkFilterIsArray(cond);
                str = `${field} NOT IN (:...${param})`;
                break;
            case types_1.CondOperator.IS_NULL:
                str = `${field} IS NULL`;
                params = {};
                break;
            case types_1.CondOperator.NOT_NULL:
                str = `${field} IS NOT NULL`;
                params = {};
                break;
            case types_1.CondOperator.BETWEEN:
                this.checkFilterIsArray(cond, cond.value.length !== 2);
                str = `${field} BETWEEN :${param}0 AND :${param}1`;
                params = {
                    [`${param}0`]: cond.value[0],
                    [`${param}1`]: cond.value[1],
                };
                break;
            // case insensitive
            case types_1.CondOperator.EQUALS_LOW:
                str = `LOWER(${field}) = :${param}`;
                break;
            case types_1.CondOperator.NOT_EQUALS_LOW:
                str = `LOWER(${field}) != :${param}`;
                break;
            case types_1.CondOperator.STARTS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `${cond.value}%` };
                break;
            case types_1.CondOperator.ENDS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}` };
                break;
            case types_1.CondOperator.CONTAINS_LOW:
                str = `LOWER(${field}) ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.EXCLUDES_LOW:
                str = `LOWER(${field}) NOT ${likeOperator} :${param}`;
                params = { [param]: `%${cond.value}%` };
                break;
            case types_1.CondOperator.IN_LOW:
                this.checkFilterIsArray(cond);
                str = `LOWER(${field}) IN (:...${param})`;
                break;
            case types_1.CondOperator.NOT_IN_LOW:
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
                }
                catch (error) {
                    this.throwBadRequestException(`Invalid custom operator '${field}' query`);
                }
                break;
        }
        if (typeof params === "undefined") {
            params = { [param]: cond.value };
        }
        return { str: str, params };
    }
    checkFilterIsArray(cond, withLength) {
        /* istanbul ignore if */
        if (!Array.isArray(cond.value) ||
            !cond.value.length ||
            (!(0, lodash_1.isNil)(withLength) ? withLength : false)) {
            this.throwBadRequestException(`Invalid column '${cond.field}' value`);
        }
    }
    checkSqlInjection(field) {
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
exports.TypeOrmCrudService = TypeOrmCrudService;
//# sourceMappingURL=type-orm-crud.service.js.map