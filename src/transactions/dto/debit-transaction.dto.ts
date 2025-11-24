import { IsNumber, IsInt, Min } from 'class-validator';

export class DebitTransactionDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;
}

