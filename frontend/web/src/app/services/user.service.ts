import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { AdminUser, User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';

interface AdminUserApi {
  id?: string | number;
  email?: string;
  displayName?: string;
  display_name?: string;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
  created_at?: string;
  blockedAt?: string | null;
  blocked_at?: string | null;
}

export interface UpdateAdminUserPayload {
  displayName?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  blocked?: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string;
  email?: string;
}

interface ProfileUserApi {
  id?: string | number;
  email?: string;
  displayName?: string;
  display_name?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    privacyAcceptedAt: string | null;
    privacyPolicyVersion: string | null;
  };
  recipes: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  comments: Array<{
    id: string;
    recipeId: string;
    body: string;
    createdAt: string;
  }>;
  ratings: Array<{
    id: string;
    recipeId: string;
    stars: number;
    createdAt: string;
  }>;
  favorites: Array<{
    recipeId: string;
    createdAt: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAdminUsers(page = 1, limit = 20): Observable<PaginatedResponse<AdminUser>> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http
      .get<PaginatedResponse<AdminUserApi>>(`${this.baseUrl}/admin/users`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: (response.items || []).map(this.mapAdminUser)
        }))
      );
  }

  updateAdminUser(id: string, payload: UpdateAdminUserPayload): Observable<AdminUser> {
    return this.http
      .patch<AdminUserApi>(`${this.baseUrl}/admin/users/${id}`, payload)
      .pipe(map(this.mapAdminUser));
  }

  deleteAdminUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${id}`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http.patch<ProfileUserApi>(`${this.baseUrl}/me`, payload).pipe(
      map((api) => ({
        id: api.id?.toString() ?? '',
        email: api.email ?? '',
        displayName: api.displayName ?? api.display_name ?? '',
        role: api.role ?? 'USER',
      }))
    );
  }

  exportMyData(): Observable<UserDataExport> {
    return this.http.get<UserDataExport>(`${this.baseUrl}/me/export`);
  }

  deleteMyAccount(): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/me`);
  }

  private mapAdminUser = (api: AdminUserApi): AdminUser => ({
    id: api.id?.toString() ?? '',
    email: api.email ?? '',
    displayName: api.displayName ?? api.display_name ?? '',
    role: api.role ?? 'USER',
    createdAt: api.createdAt ?? api.created_at,
    blockedAt: api.blockedAt ?? api.blocked_at ?? null
  });
}
