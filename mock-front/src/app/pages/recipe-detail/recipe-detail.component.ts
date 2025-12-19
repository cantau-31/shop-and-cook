import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';

import { Comment } from '../../models/comment.model';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { NotificationService } from '../../services/notification.service';
import { CommentFormComponent } from '../../components/comment-form/comment-form.component';
import { CommentListComponent } from '../../components/comment-list/comment-list.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { DifficultyLabelPipe } from '../../pipes/difficulty-label.pipe';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    NgClass,
    DifficultyLabelPipe,
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
  currentUser: User | null = null;
  myRating: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private authService: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });

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
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return;
    }
    this.recipeService.toggleFavorite(this.recipe.id).subscribe(() => {
      const nextFavoriteState = !this.recipe?.isFavorite;
      this.recipe = {
        ...this.recipe!,
        isFavorite: nextFavoriteState,
      };
      this.notifications.success(
        nextFavoriteState ? 'Ajouté aux favoris' : 'Retiré des favoris'
      );
    });
  }

  rateRecipe(rating: number): void {
    if (!this.recipe) {
      return;
    }
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return;
    }
    this.recipeService.rateRecipe(this.recipe.id, rating).subscribe({
      next: (result) => {
        this.myRating = result.stars ?? rating;
        this.recipe = {
          ...this.recipe!,
          rating: result.average ?? rating,
        };
        this.notifications.success('Merci pour votre note !');
      }
    });
  }

  onCommentCreated(comment: Comment): void {
    const enriched = {
      ...comment,
      authorName: comment.authorName ?? this.currentUser?.displayName ?? 'Vous',
      authorId: comment.authorId ?? this.currentUser?.id ?? '',
    };
    this.comments = [enriched, ...this.comments];
    this.notifications.success('Commentaire publié');
  }

  onDeleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter((comment) => comment.id !== commentId);
        this.notifications.success('Commentaire supprimé');
      },
    });
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

  private redirectToLogin(): void {
    const redirectTo = this.recipe ? `/recipe/${this.recipe.id}` : this.router.url;
    this.router.navigate(['/login'], { queryParams: { redirectTo } });
  }
}
