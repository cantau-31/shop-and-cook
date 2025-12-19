import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User, UserRole } from '../models/user.model';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  displayName: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'sc_token';
  private readonly userKey = 'sc_user';
  private readonly baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);
    if (storedToken && storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, payload)
      .pipe(
        tap((response) => this.persistSession(response)),
        map((response) => response.user)
      );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/register`, payload)
      .pipe(
        tap((response) => this.persistSession(response)),
        map((response) => response.user)
      );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === role;
  }

  updateStoredUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}
