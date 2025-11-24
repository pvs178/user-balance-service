import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { TransactionHistory, TransactionAction } from '../entities/transaction-history.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TransactionHistory)
    private readonly transactionRepository: Repository<TransactionHistory>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.seedUser();
    } catch (error) {
      console.error('Failed to seed user data', error);
      throw error;
    }
  }

  private async seedUser() {
    const userId = 1;
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const user = queryRunner.manager.create(User, {
          id: userId,
          balance: 1000.0,
        });
        await queryRunner.manager.save(User, user);

        const initialBalance = this.parseBalance(user.balance);
        if (initialBalance > 0) {
          const initialTransaction = queryRunner.manager.create(TransactionHistory, {
            user_id: userId,
            action: TransactionAction.CREDIT,
            amount: initialBalance,
          });
          await queryRunner.manager.save(TransactionHistory, initialTransaction);
        }

        await queryRunner.commitTransaction();
        console.log(`User with ID ${userId} created successfully with initial balance ${initialBalance}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      const transactionCount = await this.transactionRepository.count({
        where: { user_id: userId },
      });

      if (transactionCount === 0) {
        const userBalance = this.parseBalance(existingUser.balance);
        if (userBalance > 0) {
          const initialTransaction = this.transactionRepository.create({
            user_id: userId,
            action: TransactionAction.CREDIT,
            amount: userBalance,
          });
          await this.transactionRepository.save(initialTransaction);
          console.log(`Initial credit transaction created for user ID ${userId} with amount ${userBalance}`);
        }
      }
    }
  }

  private parseBalance(balance: unknown): number {
    if (balance === null || balance === undefined) {
      return 0;
    }
    const parsed = parseFloat(String(balance));
    return isNaN(parsed) ? 0 : parsed;
  }
}
