"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedBody = void 0;
const constants_1 = require("../constants");
const ParsedBody = () => (target, key, index) => {
    Reflect.defineMetadata(constants_1.PARSED_BODY_METADATA, { index }, target[key]);
};
exports.ParsedBody = ParsedBody;
//# sourceMappingURL=parsed-body.decorator.js.map