import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Contract } from "../contract/contract.entity";

@Entity()
export class Claim extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "amount", type: "double" })
  amount: number;

  @Column({ name: "date", type: "date" })
  date: Date;

  @Column({ name: "contractId", type: "int" })
  contractId: number;

  @ManyToOne((type) => Contract, (contract) => contract.id, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    referencedColumnName: "id",
    name: "contractId",
  })
  contract: Contract;
}
