import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PaginatedResponse } from '../../models/pagination.model';
import { Recipe, RecipeQueryParams } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { RecipeFiltersComponent } from '../../components/recipe-filters/recipe-filters.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    RecipeCardComponent,
    LoadingSpinnerComponent,
    RecipeFiltersComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = [];
  totalItems = 0;
  page = 1;
  limit = 9;
  loading = false;
  error: string | null = null;
  filters: RecipeQueryParams = {};
  categories: Category[] = [];
  searchTerm = '';
  showFilters = false;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    public authService: AuthService,
    private categoryService: CategoryService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadRecipes();
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
  }

  onFiltersChange(filters: RecipeQueryParams): void {
    const nextFilters: RecipeQueryParams = {
      ...this.filters,
      ...filters,
      q: this.searchTerm || undefined
    };
    this.filters = nextFilters;
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
    const target = this.recipes.find((recipe) => recipe.id === id);
    const nextState = !(target?.isFavorite ?? false);
    this.recipeService.toggleFavorite(id, nextState).subscribe({
      next: () => {
        this.notifications.success('Favori mis à jour');
        this.recipes = this.recipes.map((recipe) =>
          recipe.id === id ? { ...recipe, isFavorite: nextState } : recipe
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

  onSearch(): void {
    this.filters = {
      ...this.filters,
      q: this.searchTerm || undefined
    };
    this.page = 1;
    this.loadRecipes();
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => this.onSearch(), 300);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
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
