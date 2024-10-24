import { CrudValidationGroups } from "@2amtech/crudx";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { isEmpty } from "lodash";

import { PhoneDto } from "../phone/phone.dto";

import { IsEmailUserAlreadyExist } from "./user-email-already-exists.constraint";

const { CREATE } = CrudValidationGroups;

export class UserDto {
  @ValidateIf((o) => !isEmpty(o.email))
  @IsEmail()
  @IsEmailUserAlreadyExist({
    message: "Email already exists",
    groups: [CREATE],
  })
  email: string;

  @ValidateIf((o) => !isEmpty(o.email))
  @IsString()
  @IsNotEmpty()
  @MaxLength(32, { message: "Password is too long" })
  @MinLength(8, {
    message: "Password must be at least 8 characters long",
  })
  password: string;

  phone: PhoneDto | [];
}
