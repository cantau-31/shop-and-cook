import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { Recipe, RecipeQueryParams } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRecipes(filters: RecipeQueryParams = {}): Observable<PaginatedResponse<Recipe>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Recipe>>(`${this.baseUrl}/recipes`, { params });
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/recipes/${id}`);
  }

  createRecipe(payload: Partial<Recipe>): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/recipes`, payload);
  }

  updateRecipe(id: string, payload: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.baseUrl}/recipes/${id}`, payload);
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}`);
  }

  rateRecipe(id: string, rating: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/recipes/${id}/rating`, { rating });
  }

  toggleFavorite(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/recipes/${id}/favorite`, {});
  }

  getFavorites(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/me/favorites`);
  }
}
