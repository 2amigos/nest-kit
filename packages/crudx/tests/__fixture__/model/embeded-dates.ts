import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class EmbededDates {
  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date | null = null;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date | null = null;
}
