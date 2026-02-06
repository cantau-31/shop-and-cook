import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { NotificationService } from '../../services/notification.service';
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
}
