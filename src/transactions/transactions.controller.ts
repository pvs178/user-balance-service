import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DebitTransactionDto } from './dto/debit-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('debit')
  @HttpCode(HttpStatus.OK)
  async debit(@Body() debitDto: DebitTransactionDto): Promise<{
    success: boolean;
    transactionId: number;
    newBalance: number;
  }> {
    const result = await this.transactionsService.debit(
      debitDto.userId,
      debitDto.amount,
    );

    return {
      success: true,
      transactionId: result.id,
      newBalance: result.newBalance,
    };
  }
}

