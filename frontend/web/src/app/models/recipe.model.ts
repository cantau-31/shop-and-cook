import { Comment } from './comment.model';
import { Ingredient } from './ingredient.model';

export type Difficulty = 'easy' | 'medium' | 'hard' | number;

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  durationMinutes: number;
  difficulty: Difficulty;
  rating: number;
  description?: string;
  authorId?: string;
  authorName?: string;
  isFavorite?: boolean;
  isPublished?: boolean;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  categoryId?: string | number | null;
  coverUrl?: string | null;
  ingredients: Ingredient[];
  steps: string[];
  comments?: Comment[];
}

export interface RecipeQueryParams {
  q?: string;
  category?: string;
  difficulty?: Difficulty | '';
  page?: number;
  limit?: number;
  maxTime?: number;
  authorId?: string;
}
