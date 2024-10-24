"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudBaseInterceptor = void 0;
const helpers_1 = require("../helpers");
class CrudBaseInterceptor {
    getCrudInfo(context) {
        const ctrl = context.getClass();
        const handler = context.getHandler();
        const ctrlOptions = helpers_1.R.getCrudOptions(ctrl);
        const crudOptions = ctrlOptions
            ? ctrlOptions
            : {
                query: {},
                routes: {},
                params: {},
                operators: {},
            };
        const action = helpers_1.R.getAction(handler);
        return { ctrlOptions, crudOptions, action };
    }
}
exports.CrudBaseInterceptor = CrudBaseInterceptor;
//# sourceMappingURL=crud-base.interceptor.js.map