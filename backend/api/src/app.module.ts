import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Category } from './categories/entities/category.entity';
import { Comment } from './comments/entities/comment.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { Rating } from './ratings/entities/rating.entity';
import { RecipeIngredient } from './recipes/entities/recipe-ingredient.entity';
import { Recipe } from './recipes/entities/recipe.entity';
import { User } from './users/entities/user.entity';
import { RecipesModule } from './recipes/recipes.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig]
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 30
      }
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: parseInt(process.env.DB_PORT ?? '3306', 10),
        username: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASS ?? '',
        database: process.env.DB_NAME ?? 'shopcook',
        entities: [User, Category, Ingredient, Recipe, RecipeIngredient, Rating, Comment, Favorite, PasswordResetToken],
        synchronize: false,
        logging: false
      })
    }),
    UsersModule,
    AuthModule,
    RecipesModule,
    CommentsModule,
    RatingsModule,
    FavoritesModule,
    CategoriesModule,
    IngredientsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
