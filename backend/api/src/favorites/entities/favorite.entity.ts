import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from '../../users/entities/user.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @PrimaryColumn({ name: 'recipe_id', type: 'bigint', unsigned: true })
  recipeId!: string;

  @Column({ 
    name: 'created_at', 
    type: 'datetime'
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Recipe, (recipe) => recipe.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;
}
