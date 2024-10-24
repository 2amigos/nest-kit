import { CrudValidationGroups } from "@2amtech/crudx";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Column } from "typeorm";

const { CREATE, UPDATE } = CrudValidationGroups;

export class ContractCreateDto {
  @MaxLength(60)
  @Column({ name: "contractNumber", type: "varchar", length: 60 })
  contractNumber: string;

  @IsNotEmpty()
  @IsDateString()
  @Column({ name: "startedAt", type: "date" })
  startedAt: Date;

  @Column({ name: "note", type: "varchar", length: "11", default: "" })
  @IsOptional({ groups: [UPDATE] })
  @IsString()
  note: string;
}
