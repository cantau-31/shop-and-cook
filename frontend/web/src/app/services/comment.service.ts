import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';
import { PaginatedResponse } from '../models/pagination.model';

interface CommentApi {
  id: string | number;
  recipeId?: string | number;
  recipe_id?: string | number;
  userId?: string | number;
  user_id?: string | number;
  body?: string;
  message?: string;
  createdAt?: string;
  created_at?: string;
  authorName?: string;
  user?: { displayName?: string };
  recipeTitle?: string;
  recipe?: { title?: string };
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComments(recipeId: string): Observable<Comment[]> {
    return this.http
      .get<PaginatedResponse<CommentApi>>(`${this.baseUrl}/recipes/${recipeId}/comments`)
      .pipe(map((response) => (response.items || []).map(this.mapComment)));
  }

  createComment(recipeId: string, message: string): Observable<Comment> {
    return this.http
      .post<CommentApi>(`${this.baseUrl}/recipes/${recipeId}/comments`, { body: message })
      .pipe(map(this.mapComment));
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comments/${commentId}`);
  }

  getAdminComments(page = 1, limit = 20): Observable<PaginatedResponse<Comment>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http
      .get<PaginatedResponse<CommentApi>>(`${this.baseUrl}/admin/comments`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: (response.items || []).map(this.mapComment)
        }))
      );
  }

  private mapComment = (api: CommentApi): Comment => ({
    id: api.id?.toString() ?? `${Date.now()}`,
    recipeId: api.recipeId?.toString() ?? api.recipe_id?.toString() ?? '',
    authorId: api.userId?.toString() ?? api.user_id?.toString() ?? '',
    authorName: api.authorName ?? api.user?.displayName ?? 'Utilisateur',
    message: api.body ?? api.message ?? '',
    createdAt: api.createdAt ?? api.created_at ?? new Date().toISOString(),
    recipeTitle: api.recipeTitle ?? api.recipe?.title
  });
}
