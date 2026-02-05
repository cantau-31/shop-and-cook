import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { Comment } from '../../comments/entities/comment.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';

export type UserRole = 'USER' | 'ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'display_name', length: 120 })
  displayName!: string;

  @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
  role!: UserRole;

  @Column({ name: 'blocked_at', type: 'datetime', nullable: true })
  blockedAt?: Date | null;

  @Column({ 
    name: 'created_at', 
    type: 'datetime', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  createdAt!: Date;

  @OneToMany(() => Recipe, (recipe) => recipe.author)
  recipes!: Recipe[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings!: Rating[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens!: PasswordResetToken[];
}
