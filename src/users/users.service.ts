import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateBalance(
    userId: number,
    newBalance: number,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    const user = await this.findOne(userId);
    user.balance = newBalance;

    if (queryRunner) {
      return await queryRunner.manager.save(User, user);
    }

    return await this.userRepository.save(user);
  }
}

