"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUID = exports.validateParamOption = exports.validateNumeric = exports.validateSort = exports.validateJoin = exports.validateComparisonOperator = exports.validateCondition = exports.validateFields = exports.sortOrdersList = exports.comparisonOperatorsList = void 0;
const lodash_1 = require("lodash");
const exceptions_1 = require("../exceptions");
const types_1 = require("../types");
const checkers_helper_1 = require("./checkers.helper");
exports.comparisonOperatorsList = [
    ...(0, lodash_1.keys)(types_1.CondOperator).map((n) => types_1.CondOperator[n]),
];
exports.sortOrdersList = ["ASC", "DESC"];
const sortOrdersListStr = exports.sortOrdersList.join();
function validateFields(fields) {
    if (!(0, checkers_helper_1.isArrayOfStrings)(fields)) {
        throw new exceptions_1.RequestQueryException("Invalid fields. Array of strings expected");
    }
}
exports.validateFields = validateFields;
function validateCondition(val, cond, customOperators) {
    if (!(0, lodash_1.isObject)(val) || !(0, checkers_helper_1.isStringFull)(val.field)) {
        throw new exceptions_1.RequestQueryException(`Invalid field type in ${cond} condition. String expected`);
    }
    validateComparisonOperator(val.operator, customOperators);
}
exports.validateCondition = validateCondition;
function validateComparisonOperator(operator, customOperators = {}) {
    const extendedComparisonOperatorsList = [
        ...exports.comparisonOperatorsList,
        ...Object.keys(customOperators),
    ];
    if (!extendedComparisonOperatorsList.includes(operator)) {
        throw new exceptions_1.RequestQueryException(`Invalid comparison operator. ${extendedComparisonOperatorsList.join()} expected`);
    }
}
exports.validateComparisonOperator = validateComparisonOperator;
function validateJoin(join) {
    if (!(0, lodash_1.isObject)(join) || !(0, checkers_helper_1.isStringFull)(join.field)) {
        throw new exceptions_1.RequestQueryException("Invalid join field. String expected");
    }
    if (!(0, lodash_1.isUndefined)(join.select) && !(0, checkers_helper_1.isArrayOfStringsFull)(join.select)) {
        throw new exceptions_1.RequestQueryException("Invalid join select. Array of strings expected");
    }
}
exports.validateJoin = validateJoin;
function validateSort(sort) {
    if (!(0, lodash_1.isObject)(sort) || !(0, checkers_helper_1.isStringFull)(sort.field)) {
        throw new exceptions_1.RequestQueryException("Invalid sort field. String expected");
    }
    if (!(0, lodash_1.isEqual)(sort.order, exports.sortOrdersList[0]) &&
        !(0, lodash_1.isEqual)(sort.order, exports.sortOrdersList[1])) {
        throw new exceptions_1.RequestQueryException(`Invalid sort order. ${sortOrdersListStr} expected`);
    }
}
exports.validateSort = validateSort;
function validateNumeric(val, num) {
    if (!(0, lodash_1.isNumber)(val)) {
        throw new exceptions_1.RequestQueryException(`Invalid ${num}. Number expected`);
    }
}
exports.validateNumeric = validateNumeric;
function validateParamOption(options, name) {
    if (!(0, lodash_1.isObject)(options)) {
        throw new exceptions_1.RequestQueryException(`Invalid param ${name}. Invalid crud options`);
    }
    const option = options[name];
    if (option && option.disabled) {
        return;
    }
    if (!(0, lodash_1.isObject)(option) || (0, lodash_1.isNil)(option.field) || (0, lodash_1.isNil)(option.type)) {
        throw new exceptions_1.RequestQueryException(`Invalid param option in Crud`);
    }
}
exports.validateParamOption = validateParamOption;
function validateUUID(str, name) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidV4.test(str) && !uuid.test(str)) {
        throw new exceptions_1.RequestQueryException(`Invalid param ${name}. UUID string expected`);
    }
}
exports.validateUUID = validateUUID;
//# sourceMappingURL=request-validation.helper.js.map