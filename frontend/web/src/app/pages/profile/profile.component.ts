import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  favorites: Recipe[] = [];
  myRecipes: Recipe[] = [];
  loadingFavorites = false;
  loadingRecipes = false;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private userService: UserService,
    private router: Router,
    private notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user?.role === 'USER') {
        this.loadFavorites();
        this.loadMyRecipes(user.id);
      } else {
        this.favorites = [];
        this.myRecipes = [];
      }
    });
  }

  private loadFavorites(): void {
    this.loadingFavorites = true;
    this.recipeService.getFavorites().subscribe({
      next: (recipes) => (this.favorites = recipes),
      error: () => {
        this.loadingFavorites = false;
      },
      complete: () => (this.loadingFavorites = false),
    });
  }

  removeFavorite(recipeId: string): void {
    this.recipeService.toggleFavorite(recipeId, false).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(
          (recipe) => recipe.id !== recipeId,
        );
        this.notifications.success('Favori retiré');
      },
    });
  }

  deleteRecipe(recipeId: string): void {
    if (!confirm('Supprimer définitivement cette recette ?')) {
      return;
    }
    this.recipeService.deleteRecipe(recipeId).subscribe({
      next: () => {
        this.myRecipes = this.myRecipes.filter(
          (recipe) => recipe.id !== recipeId,
        );
        this.notifications.success('Recette supprimée');
      },
    });
  }

  private loadMyRecipes(userId: string): void {
    this.loadingRecipes = true;
    this.recipeService.getMyRecipes({ limit: 20 }).subscribe({
      next: (response: PaginatedResponse<Recipe>) =>
        (this.myRecipes = response.items),
      error: () => {
        this.loadingRecipes = false;
      },
      complete: () => (this.loadingRecipes = false),
    });
  }

  exportMyData(): void {
    this.userService.exportMyData().subscribe({
      next: (payload) => {
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `shop-and-cook-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.notifications.success('Export RGPD prêt');
      },
    });
  }

  deleteMyAccount(): void {
    if (!confirm('Confirmer la suppression définitive de votre compte et de vos données ?')) {
      return;
    }

    this.userService.deleteMyAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.notifications.success('Compte supprimé');
        this.router.navigate(['/']);
      },
    });
  }
}
