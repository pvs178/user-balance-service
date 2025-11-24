import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TransactionHistory } from './entities/transaction-history.entity';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DatabaseSeedService } from './database/database-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'user_balance',
      entities: [User, TransactionHistory],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      extra: {
        max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
        min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
        connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) || 2000,
      },
    }),
    TypeOrmModule.forFeature([User, TransactionHistory]),
    UsersModule,
    TransactionsModule,
  ],
  providers: [DatabaseSeedService],
})
export class AppModule {}

