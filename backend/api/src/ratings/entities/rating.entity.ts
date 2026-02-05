import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ratings')
@Unique('UNQ_RATING_USER_RECIPE', ['userId', 'recipeId'])
export class Rating {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'recipe_id', type: 'bigint', unsigned: true })
  recipeId!: string;

  @Column({ type: 'tinyint', unsigned: true })
  stars!: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.ratings, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Recipe, (recipe) => recipe.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;
}
