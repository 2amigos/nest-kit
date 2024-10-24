import { CrudValidationGroups } from "@2amtech/crudx";
import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  ValidateIf,
  isEmpty,
  isNotEmpty,
  isString,
  isUUID,
} from "class-validator";

const { CREATE } = CrudValidationGroups;

export class PhoneDto {
  @IsNotEmpty()
  @IsString()
  @Expose()
  phoneNumber: string;
}
