import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Nested } from "./nested.model";

@Entity()
export class RelationTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id = 0;

  @Column({ type: "varchar", length: 200 })
  name = "";

  @Column({ type: "integer", name: "nested_id", nullable: true })
  nestedId: number | null = null;

  @ManyToOne(() => Nested, (nested) => nested.id, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({
    name: "nested_id",
    referencedColumnName: "id",
  })
  nested: Nested | null = null;
}
