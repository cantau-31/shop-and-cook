import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  MOCK_RECIPES,
  MOCK_USERS,
  MOCK_COMMENTS,
  MOCK_CATEGORIES,
  MOCK_FAVORITES,
  MOCK_RATINGS,
  MockUser
} from '../data/mock-data';
import { Recipe } from '../models/recipe.model';
import { Comment } from '../models/comment.model';
import { PaginatedResponse } from '../models/pagination.model';
import { LoginPayload, RegisterPayload } from '../services/auth.service';

interface FavoriteLink {
  userId: string;
  recipeId: string;
}

interface RatingLink {
  userId: string;
  recipeId: string;
  stars: number;
}

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  private recipes: Recipe[] = STRUCTURED_CLONE(MOCK_RECIPES);
  private users: MockUser[] = STRUCTURED_CLONE(MOCK_USERS);
  private comments: Comment[] = STRUCTURED_CLONE(MOCK_COMMENTS);
  private favorites: FavoriteLink[] = STRUCTURED_CLONE(MOCK_FAVORITES);
  private ratings: RatingLink[] = STRUCTURED_CLONE(MOCK_RATINGS);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const { method } = req;
    const path = req.url.replace(environment.apiUrl + '/', '').split('?')[0];

    try {
      if (path === 'auth/login' && method === 'POST') {
        return this.ok(this.login(req.body as LoginPayload));
      }
      if (path === 'auth/register' && method === 'POST') {
        return this.ok(this.register(req.body as RegisterPayload));
      }
      if (path === 'auth/forgot-password' && method === 'POST') {
        return this.ok({});
      }
      if (path === 'categories' && method === 'GET') {
        return this.ok(MOCK_CATEGORIES);
      }
      if (path === 'recipes' && method === 'GET') {
        return this.ok(this.listRecipes(req.url));
      }
      if (path.startsWith('recipes/') && method === 'GET') {
        const id = path.split('/')[1];
        return this.ok(this.getRecipe(id));
      }
      if (path === 'recipes' && method === 'POST') {
        return this.ok(this.createRecipe(req.body, this.userFromHeader(req)));
      }
      if (path.startsWith('recipes/') && method === 'PUT' && !path.endsWith('/ingredients')) {
        const id = path.split('/')[1];
        return this.ok(this.updateRecipe(id, req.body, this.userFromHeader(req)));
      }
      if (path.startsWith('recipes/') && method === 'DELETE') {
        const id = path.split('/')[1];
        return this.ok(this.deleteRecipe(id, this.userFromHeader(req)));
      }
      if (path.endsWith('/favorite') && method === 'POST') {
        const id = path.split('/')[1];
        return this.ok(this.toggleFavorite(id, this.userFromHeader(req)));
      }
      if (path.startsWith('recipes/') && path.endsWith('/rating') && method === 'POST') {
        const id = path.split('/')[1];
        return this.ok(this.rateRecipe(id, req.body.stars, this.userFromHeader(req)));
      }
      if (path === 'me/favorites' && method === 'GET') {
        const user = this.userFromHeader(req);
        return this.ok(this.listFavorites(user));
      }
      if (path.endsWith('/comments') && method === 'GET') {
        const id = path.split('/')[1];
        return this.ok(this.listComments(id));
      }
      if (path.endsWith('/comments') && method === 'POST') {
        const id = path.split('/')[1];
        return this.ok(this.createComment(id, req.body, this.userFromHeader(req)));
      }
      if (path.startsWith('comments/') && method === 'DELETE') {
        const id = path.split('/')[1];
        return this.ok(this.deleteComment(id, this.userFromHeader(req)));
      }
    } catch (err) {
      return throwError(() => err);
    }

    return next.handle(req);
  }

  private login(payload: LoginPayload) {
    const user = this.users.find((u) => u.email === payload.email && u.password === payload.password);
    if (!user) {
      throw this.error(401, 'Identifiants invalides');
    }
    return this.buildAuthResponse(user);
  }

  private register(payload: RegisterPayload) {
    if (this.users.some((u) => u.email === payload.email)) {
      throw this.error(400, 'Email déjà utilisé');
    }
    const newUser: MockUser = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      email: payload.email,
      displayName: payload.displayName,
      role: 'USER',
      password: payload.password,
    };
    this.users = [...this.users, newUser];
    return this.buildAuthResponse(newUser);
  }

  private listRecipes(url: string): PaginatedResponse<Recipe> {
    const search = new URL(url).searchParams;
    let items = [...this.recipes];
    const q = search.get('q');
    if (q) {
      items = items.filter((recipe) => recipe.title.toLowerCase().includes(q.toLowerCase()));
    }
    const category = search.get('category');
    if (category) {
      items = items.filter((recipe) => recipe.categoryId === category || recipe.category.toLowerCase() === category.toLowerCase());
    }
    const page = Number(search.get('page') ?? 1);
    const limit = Number(search.get('limit') ?? 12);
    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);
    return { items: paged, total, page, limit };
  }

  private getRecipe(id: string) {
    const recipe = this.recipes.find((r) => r.id === id);
    if (!recipe) throw this.error(404, 'Recette introuvable');
    return recipe;
  }

  private createRecipe(body: any, user: MockUser) {
    const newRecipe: Recipe = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      title: body.title,
      imageUrl: body.coverUrl ?? body.imageUrl ?? this.recipes[0]?.imageUrl ?? '',
      category: 'Plat',
      durationMinutes: body.durationMinutes ?? 30,
      difficulty: body.difficulty ?? 2,
      rating: 0,
      description: body.description ?? '',
      authorId: user.id,
      authorName: user.displayName,
      isFavorite: false,
      isPublished: true,
      servings: body.servings ?? 2,
      prepMinutes: body.prepMinutes ?? 10,
      cookMinutes: body.cookMinutes ?? 10,
      categoryId: body.categoryId?.toString() ?? '2',
      coverUrl: body.coverUrl,
      ingredients: body.ingredients ?? [],
      steps: body.steps ?? ['Nouvelle recette']
    };
    this.recipes = [newRecipe, ...this.recipes];
    return newRecipe;
  }

  private updateRecipe(id: string, body: any, user: MockUser) {
    const recipe = this.recipes.find((r) => r.id === id);
    if (!recipe) throw this.error(404, 'Recette introuvable');
    if (recipe.authorId !== user.id && user.role !== 'ADMIN') {
      throw this.error(403, 'Interdit');
    }
    Object.assign(recipe, body);
    this.recipes = this.recipes.map((r) => (r.id === id ? recipe : r));
    return recipe;
  }

  private deleteRecipe(id: string, user: MockUser) {
    const recipe = this.recipes.find((r) => r.id === id);
    if (!recipe) throw this.error(404, 'Recette introuvable');
    if (recipe.authorId !== user.id && user.role !== 'ADMIN') {
      throw this.error(403, 'Interdit');
    }
    this.recipes = this.recipes.filter((r) => r.id !== id);
    return { success: true };
  }

  private toggleFavorite(recipeId: string, user: MockUser) {
    const exists = this.favorites.find((f) => f.recipeId === recipeId && f.userId === user.id);
    if (exists) {
      this.favorites = this.favorites.filter((f) => !(f.recipeId === recipeId && f.userId === user.id));
    } else {
      this.favorites = [...this.favorites, { userId: user.id, recipeId }];
    }
    this.recipes = this.recipes.map((recipe) =>
      recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    return { success: true };
  }

  private rateRecipe(recipeId: string, stars: number, user: MockUser) {
    const existing = this.ratings.find((rating) => rating.recipeId === recipeId && rating.userId === user.id);
    if (existing) {
      existing.stars = stars;
    } else {
      this.ratings = [...this.ratings, { recipeId, userId: user.id, stars }];
    }
    const related = this.ratings.filter((rating) => rating.recipeId === recipeId);
    const average = related.reduce((sum, rating) => sum + rating.stars, 0) / related.length;
    this.recipes = this.recipes.map((recipe) =>
      recipe.id === recipeId ? { ...recipe, rating: average } : recipe
    );
    return { stars, average };
  }

  private listFavorites(user: MockUser) {
    const ids = this.favorites.filter((f) => f.userId === user.id).map((f) => f.recipeId);
    return this.recipes.filter((recipe) => ids.includes(recipe.id));
  }

  private listComments(recipeId: string) {
    const items = this.comments.filter((comment) => comment.recipeId === recipeId);
    return { items, total: items.length, page: 1, limit: 50 };
  }

  private createComment(recipeId: string, body: any, user: MockUser) {
    const newComment: Comment = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      recipeId,
      authorId: user.id,
      authorName: user.displayName,
      message: body.body ?? body.message ?? '',
      createdAt: new Date().toISOString(),
    };
    this.comments = [newComment, ...this.comments];
    return newComment;
  }

  private deleteComment(id: string, user: MockUser) {
    const comment = this.comments.find((c) => c.id === id);
    if (!comment) throw this.error(404, 'Commentaire introuvable');
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      throw this.error(403, 'Interdit');
    }
    this.comments = this.comments.filter((c) => c.id !== id);
    return { success: true };
  }

  private buildAuthResponse(user: MockUser) {
    const token = `mock-${user.id}`;
    const { password, ...safeUser } = user;
    return { accessToken: token, user: safeUser };
  }

  private userFromHeader(req: HttpRequest<any>): MockUser {
    const auth = req.headers.get('Authorization');
    if (!auth) throw this.error(401, 'Non authentifié');
    const token = auth.replace('Bearer ', '');
    const userId = token.replace('mock-', '');
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw this.error(401, 'Session invalide');
    return user;
  }

  private ok(body: any) {
    return of(new HttpResponse({ status: 200, body })).pipe(delay(200));
  }

  private error(status: number, message: string) {
    return new HttpErrorResponse({ status, statusText: message, error: { message } });
  }
}

function STRUCTURED_CLONE<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
