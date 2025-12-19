import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @OneToMany(() => Recipe, (recipe) => recipe.category)
  recipes!: Recipe[];
}
