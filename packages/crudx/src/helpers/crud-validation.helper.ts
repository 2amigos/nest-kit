import { ValidationPipe } from "@nestjs/common";
import { isFalse } from "../helpers";
import { isNil } from "lodash";
import { CrudValidationGroups } from "../enums";
import { CreateManyDto, CrudOptions, MergedCrudOptions } from "../interfaces";
import { IsArray, ArrayNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class BulkDto<T> implements CreateManyDto<T> {
  // @ts-ignore
  bulk: T[];
}

export const getValidationPipe = (
  options: CrudOptions,
  group?: CrudValidationGroups
): ValidationPipe | undefined => {
  return !isFalse(options.validation)
    ? new ValidationPipe({
        ...(options.validation || {}),
        groups: group ? [group] : undefined,
      })
    : undefined;
};

export const createBulkDto = <T = any>(options: MergedCrudOptions): any => {
  if (!isFalse(options.validation)) {
    const hasDto: boolean = !isNil(options.dto?.create);
    const groups: CrudValidationGroups[] | undefined = !hasDto
      ? [CrudValidationGroups.CREATE]
      : undefined;
    const always: boolean | undefined = hasDto ? true : undefined;
    const Model = hasDto ? options.dto?.create : options.model.type;

    class BulkDtoImpl implements CreateManyDto<T> {
      @IsArray({ groups, always })
      @ArrayNotEmpty({ groups, always })
      @ValidateNested({ each: true, groups, always })
      @Type(() => Model)
      // @ts-ignore
      bulk: T[];
    }

    Object.defineProperty(BulkDtoImpl, "name", {
      writable: false,
      value: `CreateMany${options.model.type.name}Dto`,
    });

    return BulkDtoImpl;
  } else {
    return BulkDto;
  }
};
