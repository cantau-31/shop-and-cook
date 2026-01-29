import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, map, Observable, shareReplay, tap, throwError } from 'rxjs';

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
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'sc_token';
  private readonly userKey = 'sc_user';
  private readonly refreshTokenKey = 'sc_refresh';
  private readonly baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshInFlight$?: Observable<AuthResponse>;

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
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/auth/forgot-password`, { email })
      .pipe(map(() => void 0));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private get refreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  get hasRefreshToken(): boolean {
    return !!this.refreshToken;
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

  refreshSession(): Observable<AuthResponse> {
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<AuthResponse>(
          `${this.baseUrl}/auth/refresh`,
          { refreshToken: this.refreshToken },
          {
            headers: {
              Authorization: `Bearer ${this.refreshToken}`
            }
          }
        )
        .pipe(
          tap((response) => this.persistSession(response)),
          finalize(() => {
            this.refreshInFlight$ = undefined;
          }),
          shareReplay(1)
        );
    }

    return this.refreshInFlight$;
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}
