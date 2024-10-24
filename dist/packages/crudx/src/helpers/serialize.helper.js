"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializeHelper = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SerializeHelper {
    static createGetManyDto(dto, resourceName) {
        class GetManyResponseDto {
        }
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: dto, isArray: true }),
            (0, class_transformer_1.Type)(() => dto)
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Array)
        ], GetManyResponseDto.prototype, "data", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "count", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "total", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "page", void 0);
        tslib_1.__decorate([
            (0, swagger_1.ApiProperty)({ type: "number" })
            // @ts-ignore
            ,
            tslib_1.__metadata("design:type", Number)
        ], GetManyResponseDto.prototype, "pageCount", void 0);
        Object.defineProperty(GetManyResponseDto, "name", {
            writable: false,
            value: `GetMany${resourceName}ResponseDto`,
        });
        return GetManyResponseDto;
    }
    static createGetOneResponseDto(resourceName) {
        class GetOneResponseDto {
        }
        Object.defineProperty(GetOneResponseDto, "name", {
            writable: false,
            value: `${resourceName}ResponseDto`,
        });
        return GetOneResponseDto;
    }
}
exports.SerializeHelper = SerializeHelper;
//# sourceMappingURL=serialize.helper.js.map