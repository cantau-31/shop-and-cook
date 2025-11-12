import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe, RecipeQueryParams } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { RecipeFiltersComponent } from '../../components/recipe-filters/recipe-filters.component';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RecipeFiltersComponent,
    RecipeCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  recipes: Recipe[] = [];
  totalItems = 0;
  page = 1;
  limit = 9;
  loading = false;
  error: string | null = null;
  filters: RecipeQueryParams = {};

  categories = ['Entrée', 'Plat', 'Dessert', 'Vegan', 'Healthy'];

  constructor(private recipeService: RecipeService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  onFiltersChange(filters: RecipeQueryParams): void {
    this.filters = filters;
    this.page = 1;
    this.loadRecipes();
  }

  onViewRecipe(id: string): void {
    this.router.navigate(['/recipe', id]);
  }

  onToggleFavorite(id: string): void {
    this.recipeService.toggleFavorite(id).subscribe({
      next: () => this.loadRecipes(),
      error: () => {
        // Could add toast
      },
    });
  }

  changePage(page: number): void {
    this.page = page;
    this.loadRecipes();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.limit) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  trackRecipe(_index: number, recipe: Recipe): string {
    return recipe.id;
  }

  private loadRecipes(): void {
    this.loading = true;
    this.error = null;

    const params: RecipeQueryParams = {
      ...this.filters,
      page: this.page,
      limit: this.limit,
    };

    this.recipeService.getRecipes(params).subscribe({
      next: (response: any) => {
        this.recipes = response.items || [];
        this.totalItems = response.total || 0;
      },
      error: () => {
        this.error = 'Impossible de charger les recettes pour le moment.';
        this.recipes = []; // S'assurer que recipes reste un tableau
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
