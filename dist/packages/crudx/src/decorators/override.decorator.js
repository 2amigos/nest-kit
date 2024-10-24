"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Override = void 0;
const constants_1 = require("../constants");
const Override = (name) => (target, key, descriptor) => {
    Reflect.defineMetadata(constants_1.OVERRIDE_METHOD_METADATA, name || `${key}Base`, target[key]);
    return descriptor;
};
exports.Override = Override;
//# sourceMappingURL=override.decorator.js.map