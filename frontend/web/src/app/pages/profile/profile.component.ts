import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.loadFavorites();
        this.loadMyRecipes(user.id);
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

  private loadMyRecipes(userId: string): void {
    this.loadingRecipes = true;
    this.recipeService.getRecipes({ authorId: userId, limit: 20 }).subscribe({
      next: (response: PaginatedResponse<Recipe>) =>
        (this.myRecipes = response.data),
      error: () => {
        this.loadingRecipes = false;
      },
      complete: () => (this.loadingRecipes = false),
    });
  }
}
