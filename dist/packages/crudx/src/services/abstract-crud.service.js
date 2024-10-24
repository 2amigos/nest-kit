"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
class CrudService {
    throwBadRequestException(msg) {
        throw new common_1.BadRequestException(msg);
    }
    throwNotFoundException(name) {
        throw new common_1.NotFoundException(`${name} not found`);
    }
    /**
     * Wrap page into page-info
     * override this method to create custom page-info response
     * or set custom `serialize.getMany` dto in the controller's CrudOption
     * @param data
     * @param total
     * @param limit
     * @param offset
     */
    createPageInfo(data, total, limit, offset) {
        return {
            data,
            count: data.length,
            total,
            page: limit ? Math.floor(offset / limit) + 1 : 1,
            pageCount: limit && total ? Math.ceil(total / limit) : 1,
        };
    }
    /**
     * Determine if need paging
     * @param parsed
     * @param options
     */
    decidePagination(parsed, options) {
        var _a;
        return (((_a = options.query) === null || _a === void 0 ? void 0 : _a.alwaysPaginate) ||
            ((Number.isFinite(parsed.page) || Number.isFinite(parsed.offset)) &&
                !!this.getTake(parsed, options.query)));
    }
    /**
     * Get number of resources to be fetched
     * @param query
     * @param options
     */
    getTake(query, options) {
        if (query.limit) {
            return options.maxLimit
                ? query.limit <= options.maxLimit
                    ? query.limit
                    : options.maxLimit
                : query.limit;
        }
        /* istanbul ignore if */
        if (options.limit) {
            return options.maxLimit
                ? options.limit <= options.maxLimit
                    ? options.limit
                    : options.maxLimit
                : options.limit;
        }
        return options.maxLimit ? options.maxLimit : null;
    }
    /**
     * Get number of resources to be skipped
     * @param query
     * @param take
     */
    getSkip(query, take) {
        return query.page && take
            ? take * (query.page - 1)
            : query.offset
                ? query.offset
                : null;
    }
    /**
     * Get primary param name from CrudOptions
     * @param options
     */
    getPrimaryParams(options) {
        if ((0, lodash_1.isEmpty)(options.params)) {
            return [];
        }
        // @ts-ignore
        return (0, lodash_1.keys)(options.params)
            .filter((n) => (0, lodash_1.get)(options, `params[${n}].primary`, false))
            .map((p) => (0, lodash_1.get)(options, `params[${p}].field`));
    }
}
exports.CrudService = CrudService;
//# sourceMappingURL=abstract-crud.service.js.map