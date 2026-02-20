import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Recipe,
      Comment,
      Rating,
      Favorite,
      PasswordResetToken,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
