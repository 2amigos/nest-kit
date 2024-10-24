import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Address } from "./address.entity";

@Entity()
export class AddressType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  type: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Address, (address) => address.type)
  address: Address;
}
