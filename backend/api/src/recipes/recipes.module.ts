import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../categories/entities/category.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { RecipesController } from './recipes.controller';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient, Ingredient, Category])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService]
})
export class RecipesModule {}
