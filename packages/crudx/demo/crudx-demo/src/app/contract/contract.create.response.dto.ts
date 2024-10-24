import { Exclude } from "class-transformer";

export class ContractCreateResponseDto {
  readonly id: number;

  @Exclude()
  readonly userId: string;

  readonly contractNumber: string;
  readonly startedAt: string;
  readonly note: string;
}
