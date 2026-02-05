import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { DataSource, IsNull, Repository, SelectQueryBuilder } from 'typeorm';

import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { User } from '../users/entities/user.entity';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/create-recipe.dto';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';
import { UpsertIngredientDto } from './dto/upsert-ingredient.dto';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllPublic(query: FindRecipesQueryDto) {
    const baseQb = this.buildListQuery(query, {
      requirePublished: true,
      requireVisible: true,
    });

    return this.executeListQuery(baseQb, query);
  }

  async findAllForAdmin(query: FindRecipesQueryDto) {
    const baseQb = this.buildListQuery(query, {
      requirePublished: false,
      requireVisible: !(query.includeHidden ?? false),
    });
    return this.executeListQuery(baseQb, query);
  }

  async findPublicByIdOrSlug(idOrSlug: string) {
    const recipe = await this.recipeRepo.findOne({
      where: [
        { id: idOrSlug, isPublished: true, hiddenAt: IsNull() },
        { slug: idOrSlug, isPublished: true, hiddenAt: IsNull() },
      ],
      relations: ['category', 'ingredients', 'ingredients.ingredient', 'ratings'],
    });

    if (!recipe) {
      throw new NotFoundException({
        code: 'ERR_RECIPE_NOT_FOUND',
        message: 'Recipe not found',
      });
    }

    const average =
      recipe.ratings?.length && recipe.ratings.length > 0
        ? recipe.ratings.reduce((sum, rating) => sum + rating.stars, 0) /
          recipe.ratings.length
        : 0;

    return {
      ...recipe,
      averageRating: average,
      ratingCount: recipe.ratings?.length ?? 0,
      rating: average,
    };
  }

  async findEntity(id: string) {
    const recipe = await this.recipeRepo.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException({
        code: 'ERR_RECIPE_NOT_FOUND',
        message: 'Recipe not found',
      });
    }
    return recipe;
  }
  

  async create(author: User, dto: CreateRecipeDto) {
    this.ensurePublishable(dto.steps, dto.ingredients);

    const slug = await this.buildUniqueSlug(dto.title);
    const recipe = this.recipeRepo.create({
      title: dto.title,
      slug,
      authorId: author.id,
      coverUrl: dto.coverUrl,
      servings: dto.servings,
      prepMinutes: dto.prepMinutes,
      cookMinutes: dto.cookMinutes,
      difficulty: dto.difficulty,
      steps: dto.steps,
      categoryId: dto.categoryId != null ? String(dto.categoryId) : null,
      isPublished: dto.isPublished ?? true,
    });

    const saved = await this.recipeRepo.save(recipe);
    await this.syncIngredients(saved.id, dto.ingredients);
    return this.findPublicByIdOrSlug(saved.id);
  }

  async update(recipeId: string, user: User, dto: UpdateRecipeDto) {
    const recipe = await this.findEntity(recipeId);
    this.ensureOwnership(recipe, user);

    if (dto.title && dto.title !== recipe.title) {
      recipe.slug = await this.buildUniqueSlug(dto.title, recipe.id);
      recipe.title = dto.title;
    }

    if (dto.categoryId !== undefined) {
      recipe.categoryId =
        dto.categoryId != null ? String(dto.categoryId) : null;
    }
    if (dto.coverUrl !== undefined) recipe.coverUrl = dto.coverUrl;
    if (dto.servings !== undefined) recipe.servings = dto.servings;
    if (dto.prepMinutes !== undefined) recipe.prepMinutes = dto.prepMinutes;
    if (dto.cookMinutes !== undefined) recipe.cookMinutes = dto.cookMinutes;
    if (dto.difficulty !== undefined) recipe.difficulty = dto.difficulty;
    if (dto.steps) {
      if (!dto.steps.length) {
        throw new BadRequestException({
          code: 'ERR_INVALID_STEPS',
          message: 'At least one step required',
        });
      }
      recipe.steps = dto.steps;
    }
    if (dto.isPublished !== undefined) recipe.isPublished = dto.isPublished;

    await this.recipeRepo.save(recipe);

    if (dto.ingredients) {
      await this.syncIngredients(recipe.id, dto.ingredients);
    }

    return this.findPublicByIdOrSlug(recipe.id);
  }

  async hide(recipeId: string) {
    const recipe = await this.findEntity(recipeId);
    recipe.hiddenAt = recipe.hiddenAt ? null : new Date();
    await this.recipeRepo.save(recipe);
    return { success: true, hiddenAt: recipe.hiddenAt };
  }

  async replaceIngredients(
    recipeId: string,
    user: User,
    ingredients: UpsertIngredientDto[],
  ) {
    const recipe = await this.findEntity(recipeId);
    this.ensureOwnership(recipe, user);
    this.ensurePublishable(recipe.steps, ingredients);
    await this.syncIngredients(recipeId, ingredients);
    return this.findPublicByIdOrSlug(recipe.id);
  }

  private buildListQuery(
    query: FindRecipesQueryDto,
    options: { requirePublished?: boolean; requireVisible?: boolean } = {},
  ) {
    const baseQb = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.category', 'category');

    if (options.requirePublished !== false) {
      baseQb.where('recipe.isPublished = :isPublished', { isPublished: true });
    } else {
      baseQb.where('1=1');
    }

    if (options.requireVisible !== false) {
      baseQb.andWhere('recipe.hiddenAt IS NULL');
    }

    this.applyFilters(baseQb, query);
    return baseQb;
  }

  private applyFilters(builder: SelectQueryBuilder<Recipe>, query: FindRecipesQueryDto) {
    if (query.q) {
      builder.andWhere('LOWER(recipe.title) LIKE :q', {
        q: `%${query.q.toLowerCase()}%`,
      });
    }

    if (query.category) {
      if (typeof query.category === 'number') {
        builder.andWhere('recipe.categoryId = :category', {
          category: query.category,
        });
      } else {
        builder.andWhere('LOWER(category.name) = :categoryName', {
          categoryName: query.category.toLowerCase(),
        });
      }
    }

    if (query.difficulty) {
      builder.andWhere('recipe.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    if (query.maxTime) {
      builder.andWhere('recipe.prepMinutes + recipe.cookMinutes <= :maxTime', {
        maxTime: query.maxTime,
      });
    }

    if (query.authorId) {
      builder.andWhere('recipe.authorId = :authorId', {
        authorId: query.authorId,
      });
    }
  }

  private async executeListQuery(
    baseQb: SelectQueryBuilder<Recipe>,
    query: FindRecipesQueryDto,
  ) {
    const qb = baseQb
      .clone()
      .leftJoin('recipe.ratings', 'rating')
      .addSelect('AVG(rating.stars)', 'recipe_averageRating')
      .addSelect('COUNT(rating.id)', 'recipe_ratingCount')
      .groupBy('recipe.id')
      .addGroupBy('category.id')
      .orderBy('recipe.createdAt', 'DESC')
      .take(query.limit)
      .skip((query.page - 1) * query.limit);

    const [{ raw, entities }, total] = await Promise.all([
      qb.getRawAndEntities(),
      baseQb.clone().getCount(),
    ]);

    const items = entities.map((recipe, index) => {
      const row = raw[index] ?? {};
      const average = Number(row['recipe_averageRating'] ?? 0);
      const ratingCount = Number(row['recipe_ratingCount'] ?? 0);
      return Object.assign(recipe, {
        averageRating: average,
        ratingCount,
        rating: average,
      });
    });

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async remove(recipeId: string, user: User) {
    const recipe = await this.findEntity(recipeId);
    this.ensureOwnership(recipe, user);
    await this.recipeRepo.delete(recipeId);
    return { success: true };
  }

  private ensureOwnership(recipe: Recipe, user: User) {
    if (String(recipe.authorId) !== String(user.id) && user.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'ERR_FORBIDDEN',
        message: 'Forbidden',
      });
    }
  }

  private ensurePublishable(
    steps: string[],
    ingredients: UpsertIngredientDto[],
  ) {
    if (!steps?.length) {
      throw new BadRequestException({
        code: 'ERR_INVALID_STEPS',
        message: 'At least one step required',
      });
    }
    if (!ingredients?.length) {
      throw new BadRequestException({
        code: 'ERR_INVALID_INGREDIENTS',
        message: 'At least one ingredient required',
      });
    }
  }

  private async buildUniqueSlug(title: string, currentId?: string) {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let suffix = 1;
    while (true) {
      const existing = await this.recipeRepo.findOne({
        where: { slug },
        withDeleted: false,
      });
      if (!existing || existing.id === currentId) {
        return slug;
      }
      slug = `${base}-${suffix++}`;
    }
  }

  private async syncIngredients(
    recipeId: string,
    items: UpsertIngredientDto[],
  ) {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(RecipeIngredient, { recipeId });

      for (const item of items) {
        let ingredientId = item.ingredientId;
        if (!ingredientId && item.name) {
          const ingredientRepo = manager.getRepository(Ingredient);
          const existing = await ingredientRepo.findOne({
            where: { name: item.name },
          });
          if (existing) {
            ingredientId = Number(existing.id);
          } else {
            const newIngredient = await ingredientRepo.save(
              ingredientRepo.create({
                name: item.name,
                unitDefault: item.unit,
              }),
            );
            ingredientId = Number(newIngredient.id);
          }
        }

        if (!ingredientId) {
          throw new BadRequestException({
            code: 'ERR_INVALID_INGREDIENT',
            message: 'Ingredient id or name required',
          });
        }

        const entity = manager.create(RecipeIngredient, {
          recipeId,
          ingredientId: String(ingredientId),
          quantity: item.quantity,
          unit: item.unit,
          note: item.note,
        });
        await manager.save(entity);
      }
    });
  }
}
