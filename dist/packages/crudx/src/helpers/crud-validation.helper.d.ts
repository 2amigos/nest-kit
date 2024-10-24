import { ValidationPipe } from "@nestjs/common";
import { CrudValidationGroups } from "../enums";
import { CreateManyDto, CrudOptions, MergedCrudOptions } from "../interfaces";
export declare class BulkDto<T> implements CreateManyDto<T> {
    bulk: T[];
}
export declare const getValidationPipe: (options: CrudOptions, group?: CrudValidationGroups) => ValidationPipe | undefined;
export declare const createBulkDto: <T = any>(options: MergedCrudOptions) => any;
