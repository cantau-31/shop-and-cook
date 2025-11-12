import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComments(recipeId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/recipes/${recipeId}/comments`);
  }

  createComment(recipeId: string, message: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/recipes/${recipeId}/comments`, { message });
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comments/${commentId}`);
  }
}
