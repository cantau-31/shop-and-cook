import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authRequest = this.addAuthHeader(req);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        const alreadyRetried = req.headers.has('x-refresh-attempted');
        if (
          error.status === 401 &&
          !alreadyRetried &&
          this.authService.hasRefreshToken &&
          !this.isAuthEndpoint(req.url)
        ) {
          return this.authService.refreshSession().pipe(
            switchMap(() => {
              const retryRequest = this.addAuthHeader(
                req.clone({
                  setHeaders: {
                    'x-refresh-attempted': 'true'
                  }
                })
              );
              return next.handle(retryRequest);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(req: HttpRequest<unknown>) {
    const token = this.authService.token;
    if (!token) {
      return req;
    }
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string) {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')
    );
  }
}
