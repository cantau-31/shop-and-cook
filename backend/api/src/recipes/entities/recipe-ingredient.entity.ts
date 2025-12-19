import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';

import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Recipe } from './recipe.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryColumn({ name: 'recipe_id', type: 'bigint', unsigned: true })
  recipeId!: string;

  @PrimaryColumn({ name: 'ingredient_id', type: 'bigint', unsigned: true })
  ingredientId!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity!: number;

  @Column({ length: 32 })
  unit!: string;

  @Column({ nullable: true, length: 160 })
  note?: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient!: Ingredient;
}
