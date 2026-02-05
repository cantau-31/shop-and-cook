import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserParams } from './dto/create-user.dto';
import { FindAdminUsersQueryDto } from './dto/find-admin-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async updatePassword(id: string, passwordHash: string) {
    await this.repo.update({ id }, { passwordHash });
  }

  async listAdmin(query: FindAdminUsersQueryDto) {
    const [items, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      take: query.limit,
      skip: (query.page - 1) * query.limit
    });

    return {
      items: items.map((user) => this.toAdminUser(user)),
      total,
      page: query.page,
      limit: query.limit
    };
  }

  async updateAdmin(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && String(existing.id) !== String(id)) {
        throw new BadRequestException({
          code: 'ERR_EMAIL_TAKEN',
          message: 'Email already registered'
        });
      }
    }

    const updates: Partial<User> = {};
    if (dto.displayName !== undefined) updates.displayName = dto.displayName;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.blocked !== undefined) updates.blockedAt = dto.blocked ? new Date() : null;

    if (Object.keys(updates).length) {
      await this.repo.update({ id }, updates);
    }

    const updated = await this.repo.findOne({ where: { id } });
    return this.toAdminUser(updated!);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && String(existing.id) !== String(id)) {
        throw new BadRequestException({
          code: 'ERR_EMAIL_TAKEN',
          message: 'Email already registered'
        });
      }
    }

    const updates: Partial<User> = {};
    if (dto.displayName !== undefined) updates.displayName = dto.displayName;
    if (dto.email !== undefined) updates.email = dto.email;

    if (Object.keys(updates).length) {
      await this.repo.update({ id }, updates);
    }

    const updated = await this.repo.findOne({ where: { id } });
    return this.toPublicUser(updated!);
  }

  async deleteAdmin(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    await this.repo.delete({ id });
    return { success: true };
  }

  private toAdminUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      blockedAt: user.blockedAt ?? null
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}
