import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

import { User } from "../user/user.entity";

import { AddressType } from "./address-type.entity";

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ type: "varchar", nullable: false })
  street: string;

  @Column({ type: "int", nullable: true })
  number: number;

  @Column({ type: "varchar", nullable: false })
  city: string;

  @Column({ type: "varchar", nullable: false, length: 2 })
  state: string;

  @Column({ name: "user_id", type: "varchar", nullable: false })
  userId: UUID;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ name: "type_id", type: "int", nullable: false })
  typeId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "address_user",
  })
  user: User;

  @ManyToOne(() => AddressType, (addressType) => addressType.id, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "type_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "address_addresstype",
  })
  type: AddressType;
}
