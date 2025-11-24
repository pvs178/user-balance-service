import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { TransactionHistory, TransactionAction } from '../entities/transaction-history.entity';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TransactionHistory)
    private readonly transactionRepository: Repository<TransactionHistory>,
    private readonly usersService: UsersService,
  ) {}

  async recalculateBalance(userId: number, queryRunner?: QueryRunner): Promise<number> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(TransactionHistory)
      : this.transactionRepository;

    const result = await repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(CASE WHEN transaction.action = :credit THEN transaction.amount ELSE -transaction.amount END), 0)', 'balance')
      .where('transaction.user_id = :userId', { userId })
      .setParameter('credit', TransactionAction.CREDIT)
      .getRawOne();

    return parseFloat(result.balance) || 0;
  }

  async debit(userId: number, amount: number): Promise<TransactionHistory> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      const currentBalance = await this.recalculateBalance(userId, queryRunner);

      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const transaction = await queryRunner.manager.save(TransactionHistory, {
        user_id: userId,
        action: TransactionAction.DEBIT,
        amount: amount,
      });

      const newBalance = await this.recalculateBalance(userId, queryRunner);
      await this.usersService.updateBalance(userId, newBalance, queryRunner);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

