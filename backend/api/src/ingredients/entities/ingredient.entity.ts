import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RecipeIngredient } from '../../recipes/entities/recipe-ingredient.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ name: 'unit_default', nullable: true, length: 16 })
  unitDefault?: string;

  @OneToMany(() => RecipeIngredient, (ri) => ri.ingredient)
  recipeIngredients!: RecipeIngredient[];
}
