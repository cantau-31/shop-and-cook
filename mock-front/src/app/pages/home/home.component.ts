import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe, RecipeQueryParams } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { RecipeFiltersComponent } from '../../components/recipe-filters/recipe-filters.component';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
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
  categories: Category[] = [];

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
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
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: this.router.url } });
      return;
    }
    this.recipeService.toggleFavorite(id).subscribe({
      next: () => {
        this.notifications.success('Favori mis à jour');
        this.recipes = this.recipes.map((recipe) =>
          recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
        );
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
      next: (response) => {
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

  private loadCategories(): void {
    this.categoryService.list().subscribe({
      next: (items) => (this.categories = items),
      error: () => {
        this.categories = [];
      }
    });
  }
}
