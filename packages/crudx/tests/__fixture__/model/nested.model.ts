import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { IdentityType } from "./identity-type.model";

@Entity()
export class Nested extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = 0;

  @Column({ type: "varchar", length: 200 })
  identity = "";

  @Column({ name: "identity_type", type: "integer", nullable: true })
  typeId: number | null = null;

  @ManyToOne(() => IdentityType, (type) => type.id, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({
    name: "identity_type_id",
    referencedColumnName: "id",
  })
  type: IdentityType | null = null;
}
