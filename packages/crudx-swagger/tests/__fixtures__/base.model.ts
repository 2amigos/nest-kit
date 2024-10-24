import { ApiProperty } from "@nestjs/swagger";
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number | null = null;

  @Column({ type: "varchar", length: 255 })
  @ApiProperty()
  name: string = "";

  @Column({ type: "int" })
  @ApiProperty()
  age: number = 0;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null = null;
}
