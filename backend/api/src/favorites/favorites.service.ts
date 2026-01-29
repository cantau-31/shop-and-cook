import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Recipe } from '../recipes/entities/recipe.entity';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepo: Repository<Favorite>,
    @InjectRepository(Recipe)
    private readonly recipesRepo: Repository<Recipe>
  ) {}

  async toggle(userId: string, recipeId: string, shouldFavorite: boolean) {
    if (shouldFavorite) {
      await this.favoritesRepo.upsert(
        {
          userId,
          recipeId
        },
        ['userId', 'recipeId']
      );
    } else {
      await this.favoritesRepo.delete({ userId, recipeId });
    }
    return { success: true };
  }

  async listForUser(userId: string) {
    const favorites = await this.favoritesRepo.find({
      where: { userId }
    });
    const recipeIds = favorites.map((fav) => fav.recipeId);
    if (!recipeIds.length) {
      return [];
    }
    const qb = this.recipesRepo
      .createQueryBuilder('recipe')
      .leftJoin('recipe.ratings', 'rating')
      .addSelect('AVG(rating.stars)', 'recipe_averageRating')
      .addSelect('COUNT(rating.id)', 'recipe_ratingCount')
      .where('recipe.id IN (:...ids)', { ids: recipeIds })
      .groupBy('recipe.id');

    const { raw, entities } = await qb.getRawAndEntities();

    return entities.map((recipe, index) => {
      const row = raw[index] ?? {};
      const average = Number(row['recipe_averageRating'] ?? 0);
      const ratingCount = Number(row['recipe_ratingCount'] ?? 0);
      return Object.assign(recipe, {
        averageRating: average,
        ratingCount,
        rating: average,
        isFavorite: true
      });
    });
  }
}
