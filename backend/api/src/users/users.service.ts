import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserParams } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>
  ) {}

  async create(params: CreateUserParams) {
    const user = this.repo.create({
      email: params.email,
      passwordHash: params.passwordHash,
      displayName: params.displayName,
      role: params.role ?? 'USER'
    });
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
