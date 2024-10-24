"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObjectFull = exports.isObject = exports.isIn = exports.isTrue = exports.isFalse = exports.isDateString = exports.hasValue = exports.isValue = exports.isArrayOfStringsFull = exports.isStringFull = exports.isArrayFull = exports.isArrayOfStrings = void 0;
const lodash_1 = require("lodash");
const isArrayOfStrings = (arr) => {
    return (0, lodash_1.isArray)(arr) && (0, lodash_1.every)(arr, lodash_1.isString);
};
exports.isArrayOfStrings = isArrayOfStrings;
const isArrayFull = (val) => Array.isArray(val) && !(0, lodash_1.isEmpty)(val);
exports.isArrayFull = isArrayFull;
const isStringFull = (val) => (0, lodash_1.isString)(val) && !(0, lodash_1.isEmpty)(val);
exports.isStringFull = isStringFull;
const isArrayOfStringsFull = (val) => (0, exports.isArrayFull)(val) && val.every((v) => (0, exports.isStringFull)(v));
exports.isArrayOfStringsFull = isArrayOfStringsFull;
const isValue = (val) => (0, exports.isStringFull)(val) || (0, lodash_1.isNumber)(val) || (0, lodash_1.isBoolean)(val) || (0, lodash_1.isDate)(val);
exports.isValue = isValue;
const hasValue = (val) => (0, exports.isArrayFull)(val) ? val.every((o) => (0, exports.isValue)(o)) : (0, exports.isValue)(val);
exports.hasValue = hasValue;
const isDateString = (val) => {
    const timestamp = Date.parse(val);
    return !isNaN(timestamp) && (0, lodash_1.isDate)(new Date(timestamp));
};
exports.isDateString = isDateString;
const isFalse = (val) => val === false;
exports.isFalse = isFalse;
const isTrue = (val) => val === true;
exports.isTrue = isTrue;
const isIn = (val, arr = []) => arr.some((o) => (0, lodash_1.isEqual)(val, o));
exports.isIn = isIn;
const isObject = (val) => typeof val === "object" && !(0, lodash_1.isNil)(val);
exports.isObject = isObject;
const isObjectFull = (val) => (0, exports.isObject)(val) && (0, lodash_1.keys)(val).length > 0;
exports.isObjectFull = isObjectFull;
//# sourceMappingURL=checkers.helper.js.map