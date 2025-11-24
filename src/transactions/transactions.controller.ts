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
    console.log(`[TransactionsController] Debit request: userId=${debitDto.userId}, amount=${debitDto.amount}`);
    
    const result = await this.transactionsService.debit(
      debitDto.userId,
      debitDto.amount,
    );

    console.log(`[TransactionsController] Debit successful: transactionId=${result.id}, newBalance=${result.newBalance}`);

    return {
      success: true,
      transactionId: result.id,
      newBalance: result.newBalance,
    };
  }
}

