import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notifications: NotificationService, private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (this.authService.isLoggedIn()) {
            this.notifications.error('Session expirée. Merci de vous reconnecter.');
            this.authService.logout();
          }
        } else {
          const message =
            (error.error && (error.error.message || error.error['code'])) ||
            error.message ||
            'Erreur inattendue';
          this.notifications.error(message);
        }
        return throwError(() => error);
      })
    );
  }
}
