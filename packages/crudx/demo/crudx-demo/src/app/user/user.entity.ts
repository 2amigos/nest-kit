import * as bcrypt from "bcryptjs";
import { Exclude } from "class-transformer";
import {
  AfterLoad,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Address } from "../address/address.entity";
import { Contract } from "../contract/contract.entity";
import { Phone } from "../phone/phone.entity";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 125 })
  email: string;

  @Column({ type: "timestamp", nullable: true })
  emailConfirmedAt: Date;

  @Column({ type: "varchar", nullable: true })
  @Exclude()
  emailToken: string;

  @Column({ type: "varchar", length: 80 })
  @Exclude({ toClassOnly: false, toPlainOnly: true })
  password: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Phone, (phone) => phone.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  phones: Phone[];

  @OneToMany(() => Contract, (contract) => contract.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  contracts: Contract[];

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  addresses: Address[];

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @Exclude()
  private tempPassword?: string;

  @BeforeInsert()
  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private async encryptPassword(): Promise<void> {
    if (this.tempPassword !== null && this.tempPassword !== this.password) {
      try {
        await this.hashPassword();
        // After changed, temp password should be reassigned to new one, so if we try to save again,
        // it does not change the password wrongly
        this.tempPassword = this.password;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Unable to encrypt password: " + error.message);
        }
      }
    }
  }
}
