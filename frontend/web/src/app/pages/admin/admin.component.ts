import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

import { Comment } from '../../models/comment.model';
import { Recipe } from '../../models/recipe.model';
import { CommentService } from '../../services/comment.service';
import { RecipeService } from '../../services/recipe.service';

interface AdminComment extends Comment {
  recipeTitle: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, LoadingSpinnerComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  recipes: Recipe[] = [];
  comments: AdminComment[] = [];
  loading = false;
  feedback: string | null = null;
  error: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  deleteRecipe(recipeId: string): void {
    this.recipeService.deleteRecipe(recipeId).subscribe({
      next: () => {
        this.feedback = 'Recette supprimée';
        this.recipes = this.recipes.filter((recipe) => recipe.id !== recipeId);
      },
    });
  }

  deleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.feedback = 'Commentaire supprimé';
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
      },
    });
  }

  toggleVisibility(recipe: Recipe): void {
    this.recipeService.toggleRecipeVisibility(recipe.id).subscribe({
      next: (response) => {
        const hiddenAt = response.hiddenAt ?? null;
        this.recipes = this.recipes.map((item) =>
          item.id === recipe.id ? { ...item, hiddenAt } : item
        );
        this.feedback = hiddenAt ? 'Recette masquée' : 'Recette restaurée';
      },
    });
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      recipes: this.recipeService.getAdminRecipes({ limit: 50, page: 1, includeHidden: true }),
      comments: this.commentService.getAdminComments(1, 50)
    }).subscribe({
      next: ({ recipes, comments }) => {
        this.recipes = recipes.items;
        this.comments = comments.items.map((comment) => ({
          ...comment,
          recipeTitle: comment.recipeTitle ?? 'Recette'
        }));
      },
      error: () => {
        this.error = 'Impossible de charger les données admin.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
