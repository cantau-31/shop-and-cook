import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { Recipe, RecipeQueryParams } from '../models/recipe.model';

type Maybe<T> = T | null | undefined;

interface RecipeApi {
  id?: string | number;
  title?: string;
  slug?: string;
  coverUrl?: string | null;
  imageUrl?: string | null;
  category?: { id?: string | number; name?: string } | string | null;
  categoryId?: string | number | null;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  durationMinutes?: number;
  difficulty?: number | string;
  rating?: number;
  averageRating?: number;
  description?: string | null;
  authorId?: string | number;
  author?: { id?: string | number; displayName?: string };
  isFavorite?: boolean;
  ingredients?: Array<{
    ingredient?: { name?: string; unitDefault?: string };
    name?: string;
    quantity?: number;
    unit?: string;
  }>;
  steps?: string[] | string;
  steps_json?: string;
  hiddenAt?: string | null;
  hidden_at?: string | null;
  isPublished?: boolean;
  is_published?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private readonly baseUrl = environment.apiUrl;
  private readonly placeholderImage =
    'https://placehold.co/600x400?text=Shop+%26+Cook';

  constructor(private http: HttpClient) {}

  getRecipes(
    filters: RecipeQueryParams = {},
  ): Observable<PaginatedResponse<Recipe>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http
      .get<PaginatedResponse<RecipeApi>>(`${this.baseUrl}/recipes`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: (response.items || []).map((item) => this.mapRecipe(item)),
        })),
      );
  }

  getAdminRecipes(
    filters: RecipeQueryParams = {},
  ): Observable<PaginatedResponse<Recipe>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http
      .get<
        PaginatedResponse<RecipeApi>
      >(`${this.baseUrl}/recipes/admin`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: (response.items || []).map((item) => this.mapRecipe(item)),
        })),
      );
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http
      .get<RecipeApi>(`${this.baseUrl}/recipes/${id}`)
      .pipe(map((recipe) => this.mapRecipe(recipe)));
  }

  getRecipeForEdit(id: string): Observable<Recipe> {
    return this.http
      .get<RecipeApi>(`${this.baseUrl}/recipes/${id}/edit`)
      .pipe(map((recipe) => this.mapRecipe(recipe)));
  }

  getMyRecipes(
    filters: RecipeQueryParams = {},
  ): Observable<PaginatedResponse<Recipe>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http
      .get<
        PaginatedResponse<RecipeApi>
      >(`${this.baseUrl}/recipes/mine`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: (response.items || []).map((item) => this.mapRecipe(item)),
        })),
      );
  }

  createRecipe(payload: Partial<Recipe>): Observable<Recipe> {
    return this.http
      .post<RecipeApi>(`${this.baseUrl}/recipes`, payload)
      .pipe(map((recipe) => this.mapRecipe(recipe)));
  }

  updateRecipe(id: string, payload: Partial<Recipe>): Observable<Recipe> {
    return this.http
      .put<RecipeApi>(`${this.baseUrl}/recipes/${id}`, payload)
      .pipe(map((recipe) => this.mapRecipe(recipe)));
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}`);
  }

  toggleRecipeVisibility(
    id: string,
  ): Observable<{ success: boolean; hiddenAt?: string }> {
    return this.http.patch<{ success: boolean; hiddenAt?: string }>(
      `${this.baseUrl}/recipes/admin/${id}/hide`,
      {},
    );
  }

  rateRecipe(
    id: string,
    rating: number,
  ): Observable<{ stars: number; average: number }> {
    return this.http.post<{ stars: number; average: number }>(
      `${this.baseUrl}/recipes/${id}/rating`,
      {
        stars: rating,
      },
    );
  }

  toggleFavorite(id: string, shouldFavorite: boolean): Observable<void> {
    const url = `${this.baseUrl}/recipes/${id}/favorite`;
    return shouldFavorite
      ? this.http.post<void>(url, {})
      : this.http.delete<void>(url);
  }

  getFavorites(): Observable<Recipe[]> {
    return this.http
      .get<RecipeApi[]>(`${this.baseUrl}/me/favorites`)
      .pipe(map((items) => (items || []).map((item) => this.mapRecipe(item))));
  }

  private mapRecipe(api: RecipeApi): Recipe {
    const prepMinutes = Number(api.prepMinutes ?? 0);
    const cookMinutes = Number(api.cookMinutes ?? 0);
    const durationMinutes = api.durationMinutes ?? prepMinutes + cookMinutes;
    const categoryName =
      typeof api.category === 'string'
        ? api.category
        : (api.category?.name ?? '');
    const categoryId =
      typeof api.categoryId !== 'undefined'
        ? api.categoryId
        : typeof api.category === 'object'
          ? api.category?.id
          : null;
    const imageUrl = this.normalizeImageUrl(api.coverUrl ?? api.imageUrl);

    return {
      id: api.id?.toString() ?? '',
      title: api.title ?? 'Recette',
      imageUrl,
      category: categoryName ?? '',
      durationMinutes,
      difficulty:
        typeof api.difficulty === 'number'
          ? api.difficulty
          : this.normalizeDifficulty(api.difficulty),
      rating: Number(api.averageRating ?? api.rating ?? 0),
      description: api.description ?? '',
      authorId: api.authorId?.toString(),
      authorName: api.author?.displayName,
      isFavorite: api.isFavorite ?? false,
      servings: api.servings ?? 1,
      prepMinutes,
      cookMinutes,
      categoryId: categoryId ?? null,
      coverUrl: api.coverUrl ?? null,
      ingredients:
        api.ingredients?.map((item) => ({
          name: item.ingredient?.name ?? item.name ?? '',
          quantity: item.quantity ?? 0,
          unit: item.unit ?? item.ingredient?.unitDefault ?? '',
        })) ?? [],
      steps: this.resolveSteps(api.steps ?? api.steps_json),
      comments: [],
      hiddenAt: api.hiddenAt ?? api.hidden_at ?? null,
      isPublished: api.isPublished ?? api.is_published ?? true,
    };
  }

  private resolveSteps(value: Maybe<string[] | string>): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((step) => !!step);
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private normalizeDifficulty(value: Maybe<string | number>): number {
    if (value == null) {
      return 1;
    }
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    const normalized = value.toString().toLowerCase();
    const map: Record<string, number> = {
      easy: 1,
      medium: 3,
      hard: 5,
    };
    return map[normalized] ?? 1;
  }

  private normalizeImageUrl(value: Maybe<string>): string {
    if (!value) {
      return this.placeholderImage;
    }
    const trimmed = value.toString().trim();
    if (!trimmed) {
      return this.placeholderImage;
    }
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:')
    ) {
      return trimmed;
    }
    return this.placeholderImage;
  }
}
