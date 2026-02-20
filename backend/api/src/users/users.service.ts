import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from './entities/user.entity';
import { CreateUserParams } from './dto/create-user.dto';
import { FindAdminUsersQueryDto } from './dto/find-admin-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    privacyAcceptedAt: Date | null;
    privacyPolicyVersion: string | null;
  };
  recipes: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  comments: Array<{
    id: string;
    recipeId: string;
    body: string;
    createdAt: Date;
  }>;
  ratings: Array<{
    id: string;
    recipeId: string;
    stars: number;
    createdAt: Date;
  }>;
  favorites: Array<{
    recipeId: string;
    createdAt: Date;
  }>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipesRepo: Repository<Recipe>,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Rating)
    private readonly ratingsRepo: Repository<Rating>,
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokensRepo: Repository<PasswordResetToken>,
  ) {}

  async create(params: CreateUserParams) {
    const user = this.repo.create({
      email: params.email,
      passwordHash: params.passwordHash,
      displayName: params.displayName,
      role: params.role ?? 'USER',
      privacyAcceptedAt: params.privacyAcceptedAt ?? null,
      privacyPolicyVersion: params.privacyPolicyVersion ?? null,
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
    await this.deleteAccountData(id);
    return { success: true };
  }

  async exportOwnData(id: string): Promise<UserDataExport> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const [recipes, comments, ratings, favorites] = await Promise.all([
      this.recipesRepo.find({
        where: { authorId: id },
        order: { createdAt: 'DESC' }
      }),
      this.commentsRepo.find({
        where: { userId: id },
        order: { createdAt: 'DESC' }
      }),
      this.ratingsRepo.find({
        where: { userId: id },
        order: { createdAt: 'DESC' }
      }),
      this.favoritesRepo.find({
        where: { userId: id },
        order: { createdAt: 'DESC' }
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: String(user.id),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
        privacyAcceptedAt: user.privacyAcceptedAt ?? null,
        privacyPolicyVersion: user.privacyPolicyVersion ?? null
      },
      recipes: recipes.map((recipe) => ({
        id: String(recipe.id),
        title: recipe.title,
        slug: recipe.slug,
        isPublished: Boolean(recipe.isPublished),
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
      })),
      comments: comments.map((comment) => ({
        id: String(comment.id),
        recipeId: String(comment.recipeId),
        body: comment.body,
        createdAt: comment.createdAt,
      })),
      ratings: ratings.map((rating) => ({
        id: String(rating.id),
        recipeId: String(rating.recipeId),
        stars: rating.stars,
        createdAt: rating.createdAt,
      })),
      favorites: favorites.map((favorite) => ({
        recipeId: String(favorite.recipeId),
        createdAt: favorite.createdAt,
      }))
    };
  }

  async deleteOwnAccount(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'ERR_USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    await this.deleteAccountData(id);
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

  private async deleteAccountData(userId: string) {
    await this.repo.manager.transaction(async (manager) => {
      await manager.delete(Favorite, { userId });
      await manager.delete(Rating, { userId });
      await manager.delete(Comment, { userId });
      await manager.delete(Recipe, { authorId: userId });
      await manager.delete(PasswordResetToken, { userId });
      await manager.delete(User, { id: userId });
    });
  }
}
