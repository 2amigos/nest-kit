"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudAuth = void 0;
const helpers_1 = require("../helpers");
const CrudAuth = (options) => (target) => {
    helpers_1.R.setCrudAuthOptions(options, target);
};
exports.CrudAuth = CrudAuth;
//# sourceMappingURL=crud-auth.decorator.js.map