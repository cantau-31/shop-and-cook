import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TitleCasePipe, DecimalPipe } from '@angular/common';

import { Comment } from '../../models/comment.model';
import { Recipe } from '../../models/recipe.model';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { CommentFormComponent } from '../../components/comment-form/comment-form.component';
import { CommentListComponent } from '../../components/comment-list/comment-list.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    TitleCasePipe,
    DecimalPipe,
    CommentFormComponent,
    CommentListComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  comments: Comment[] = [];
  loading = false;
  error: string | null = null;

  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(
      (user) => (this.isAuthenticated = !!user)
    );

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadRecipe(id);
        this.loadComments(id);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.recipe) {
      return;
    }
    this.recipeService.toggleFavorite(this.recipe.id).subscribe(() => {
      this.recipe = {
        ...this.recipe!,
        isFavorite: !this.recipe?.isFavorite,
      };
    });
  }

  rateRecipe(rating: number): void {
    if (!this.recipe) {
      return;
    }
    this.recipeService.rateRecipe(this.recipe.id, rating).subscribe(() => {
      this.recipe = {
        ...this.recipe!,
        rating,
      };
    });
  }

  onCommentCreated(comment: Comment): void {
    this.comments = [comment, ...this.comments];
  }

  private loadRecipe(id: string): void {
    this.loading = true;
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.error = null;
      },
      error: () => {
        this.error = 'Recette introuvable.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private loadComments(id: string): void {
    this.commentService.getComments(id).subscribe({
      next: (comments) => (this.comments = comments),
    });
  }
}
