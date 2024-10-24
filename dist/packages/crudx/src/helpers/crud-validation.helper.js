"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBulkDto = exports.getValidationPipe = exports.BulkDto = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const helpers_1 = require("../helpers");
const lodash_1 = require("lodash");
const enums_1 = require("../enums");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BulkDto {
}
exports.BulkDto = BulkDto;
const getValidationPipe = (options, group) => {
    return !(0, helpers_1.isFalse)(options.validation)
        ? new common_1.ValidationPipe(Object.assign(Object.assign({}, (options.validation || {})), { groups: group ? [group] : undefined }))
        : undefined;
};
exports.getValidationPipe = getValidationPipe;
const createBulkDto = (options) => {
    var _a, _b;
    if (!(0, helpers_1.isFalse)(options.validation)) {
        const hasDto = !(0, lodash_1.isNil)((_a = options.dto) === null || _a === void 0 ? void 0 : _a.create);
        const groups = !hasDto
            ? [enums_1.CrudValidationGroups.CREATE]
            : undefined;
        const always = hasDto ? true : undefined;
        const Model = hasDto ? (_b = options.dto) === null || _b === void 0 ? void 0 : _b.create : options.model.type;
        class BulkDtoImpl {
        }
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: Model, isArray: true }),
            (0, class_validator_1.IsArray)({ groups, always }),
            (0, class_validator_1.ArrayNotEmpty)({ groups, always }),
            (0, class_validator_1.ValidateNested)({ each: true, groups, always }),
            (0, class_transformer_1.Type)(() => Model)
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Array)
        ], BulkDtoImpl.prototype, "bulk", void 0);
        Object.defineProperty(BulkDtoImpl, "name", {
            writable: false,
            value: `CreateMany${options.model.type.name}Dto`,
        });
        return BulkDtoImpl;
    }
    else {
        return BulkDto;
    }
};
exports.createBulkDto = createBulkDto;
//# sourceMappingURL=crud-validation.helper.js.map