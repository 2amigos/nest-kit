import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RelationTest } from "./relation-test.model";
import { EmbededDates } from "./embeded-dates";

@Entity()
export class TestingModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ name: "first_name", type: "varchar", length: 100 })
  firstName: string = "";

  @Column({ name: "last_name", type: "varchar", length: 100 })
  lastName: string = "";

  @Column({ type: "integer" })
  age: number = 0;

  @Column({ type: "int", name: "relation_id", nullable: true })
  relationTestId: number | null = null;

  @ManyToOne(() => RelationTest, (relationTest) => relationTest.id, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({
    name: "relation_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "testing-relation-fk",
  })
  relationTest: RelationTest | null = null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  @Column(() => EmbededDates)
  dates?: EmbededDates;
}
