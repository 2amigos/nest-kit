import { Exclude } from "class-transformer";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "../user/user.entity";

@Entity()
export class Phone extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar", nullable: false })
  userId: string;

  @Column({ type: "varchar", nullable: false })
  phoneNumber: string;

  @ManyToOne((type) => User, (user) => user.id)
  @JoinColumn({
    referencedColumnName: "id",
    foreignKeyConstraintName: "UserId",
  })
  user: User;
}
