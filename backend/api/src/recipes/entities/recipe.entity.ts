import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { User } from '../../users/entities/user.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @ManyToOne(() => User, (user) => user.recipes, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ name: 'author_id', type: 'bigint', unsigned: true })
  authorId!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl?: string;

  @Column({ type: 'int', unsigned: true, default: 1 })
  servings!: number;

  @Column({ name: 'prep_minutes', type: 'int', unsigned: true, default: 0 })
  prepMinutes!: number;

  @Column({ name: 'cook_minutes', type: 'int', unsigned: true, default: 0 })
  cookMinutes!: number;

  @Column({ type: 'tinyint', unsigned: true, default: 1 })
  difficulty!: number;

  @Column({ name: 'steps_json', type: 'json' })
  steps!: string[];

  @ManyToOne(() => Category, (category) => category.recipes, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category | null;

  @Column({
    name: 'category_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  categoryId?: string | null;

  @Column({ name: 'is_published', type: 'tinyint', default: true })
  isPublished!: boolean;

  @Column({ name: 'hidden_at', type: 'datetime', nullable: true })
  hiddenAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, {
    cascade: true,
  })
  ingredients!: RecipeIngredient[];

  @OneToMany(() => Rating, (rating) => rating.recipe)
  ratings!: Rating[];

  @OneToMany(() => Comment, (comment) => comment.recipe)
  comments!: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.recipe)
  favorites!: Favorite[];
}
