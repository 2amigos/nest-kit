import { CrudValidationGroups } from "@2amtech/crudx";
import { Exclude } from "class-transformer";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "../user/user.entity";

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Contract extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "userId" })
  @Exclude({ toPlainOnly: true })
  userId: string;

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

  @ManyToOne((type) => User, (user) => user.id)
  @JoinColumn({
    referencedColumnName: "id",
    foreignKeyConstraintName: "contact_user",
  })
  user: User;
}
