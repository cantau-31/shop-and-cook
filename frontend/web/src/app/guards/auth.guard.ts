import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
      return false;
    }

    const allowedRoles = route.data['roles'] as UserRole[] | undefined;

    if (allowedRoles?.length && !allowedRoles.some((role) => this.authService.hasRole(role))) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
