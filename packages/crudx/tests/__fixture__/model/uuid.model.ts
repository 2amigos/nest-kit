import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UuidModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string | any;

  @Column({ type: "varchar", nullable: true, length: 255 })
  name: string | null = null;

  @Column({ type: "integer", nullable: true })
  age: number | null = null;
}
