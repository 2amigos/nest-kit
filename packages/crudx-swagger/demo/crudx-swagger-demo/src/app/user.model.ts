import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_swagger")
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: "varchar", length: 150 })
  name: string;

  @ApiProperty()
  @Column({ type: "integer", nullable: true })
  age: number | null;
}
