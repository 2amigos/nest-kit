"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedRequest = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
exports.ParsedRequest = (0, common_1.createParamDecorator)((_, ctx) => {
    return helpers_1.R.getContextRequest(ctx)[constants_1.PARSED_CRUD_REQUEST_KEY];
});
//# sourceMappingURL=parsed-request.decorator.js.map