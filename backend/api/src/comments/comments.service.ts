import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FindCommentsQueryDto } from './dto/find-comments-query.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  async listPublic(recipeId: string, query: FindCommentsQueryDto) {
    const [items, total] = await this.repo.findAndCount({
      where: { recipeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      items: items.map((comment) => this.toPublicComment(comment)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async create(recipeId: string, user: User, dto: CreateCommentDto) {
    const comment = this.repo.create({
      recipeId,
      userId: user.id,
      body: dto.body,
    });
    const saved = await this.repo.save(comment);
    const withAuthor = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return this.toPublicComment(withAuthor!);
  }

  async delete(commentId: string, user: User) {
    const comment = await this.repo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException({
        code: 'ERR_COMMENT_NOT_FOUND',
        message: 'Comment not found',
      });
    }

    const isAuthor = String(comment.userId) === String(user.id);
    const withinWindow =
      Date.now() - new Date(comment.createdAt).getTime() <= 10 * 60 * 1000;

    if (!isAuthor && user.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'ERR_FORBIDDEN',
        message: 'Forbidden',
      });
    }

    if (isAuthor && !withinWindow && user.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'ERR_DELETE_WINDOW',
        message: 'Edition window exceeded',
      });
    }

    await this.repo.delete({ id: commentId });
    return { success: true };
  }

  private toPublicComment(comment: Comment & { user?: User }) {
    return {
      id: comment.id,
      recipeId: comment.recipeId,
      userId: comment.userId,
      authorName: comment.user?.displayName ?? 'Utilisateur',
      message: comment.body,
      createdAt: comment.createdAt,
    };
  }
}
