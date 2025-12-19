import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  isMenuCollapsed = true;
  user$ = this.authService.currentUser$;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu(): void {
    this.isMenuCollapsed = true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
