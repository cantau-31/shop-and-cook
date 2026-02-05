import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { Comment } from '../../models/comment.model';
import { Recipe } from '../../models/recipe.model';
import { AdminUser } from '../../models/user.model';
import { CommentService } from '../../services/comment.service';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';

interface AdminComment extends Comment {
  recipeTitle: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ConfirmModalComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  recipes: Recipe[] = [];
  comments: AdminComment[] = [];
  users: AdminUser[] = [];
  loading = false;
  userSubmitting = false;
  feedback: string | null = null;
  error: string | null = null;
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  editingUser: AdminUser | null = null;
  private confirmAction: (() => void) | null = null;

  constructor(
    private recipeService: RecipeService,
    private commentService: CommentService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  userForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER', Validators.required],
    blocked: [false]
  });

  ngOnInit(): void {
    this.loadData();
  }

  confirmDeleteRecipe(recipe: Recipe): void {
    this.confirmTitle = 'Supprimer la recette';
    this.confirmMessage = `Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?`;
    this.confirmAction = () => this.executeDeleteRecipe(recipe.id);
    this.confirmOpen = true;
  }

  confirmDeleteComment(comment: AdminComment): void {
    this.confirmTitle = 'Supprimer le commentaire';
    this.confirmMessage = `Supprimer le commentaire de ${comment.authorName} sur "${comment.recipeTitle}" ?`;
    this.confirmAction = () => this.executeDeleteComment(comment.id);
    this.confirmOpen = true;
  }

  confirmDeleteUser(user: AdminUser): void {
    this.confirmTitle = 'Supprimer l’utilisateur';
    this.confirmMessage = `Supprimer le compte de ${user.displayName} (${user.email}) ?`;
    this.confirmAction = () => this.executeDeleteUser(user.id);
    this.confirmOpen = true;
  }

  startEditUser(user: AdminUser): void {
    this.editingUser = user;
    this.userForm.reset({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      blocked: !!user.blockedAt
    });
  }

  cancelEditUser(): void {
    this.editingUser = null;
    this.userForm.reset({
      displayName: '',
      email: '',
      role: 'USER',
      blocked: false
    });
  }

  saveUser(): void {
    if (!this.editingUser || this.userForm.invalid) {
      return;
    }
    this.userSubmitting = true;
    const payload = this.userForm.value;
    this.userService
      .updateAdminUser(this.editingUser.id, {
        displayName: payload.displayName ?? '',
        email: payload.email ?? '',
        role: (payload.role ?? 'USER') as 'USER' | 'ADMIN',
        blocked: !!payload.blocked
      })
      .subscribe({
        next: (updated) => {
          this.users = this.users.map((user) => (user.id === updated.id ? updated : user));
          this.feedback = 'Utilisateur mis à jour';
          this.editingUser = null;
        },
        error: () => {
          this.error = "Impossible de mettre à jour l'utilisateur.";
        },
        complete: () => {
          this.userSubmitting = false;
        }
      });
  }

  handleConfirm(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.closeConfirm();
  }

  handleCancel(): void {
    this.closeConfirm();
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
      comments: this.commentService.getAdminComments(1, 50),
      users: this.userService.getAdminUsers(1, 50)
    }).subscribe({
      next: ({ recipes, comments, users }) => {
        this.recipes = recipes.items;
        this.comments = comments.items.map((comment) => ({
          ...comment,
          recipeTitle: comment.recipeTitle ?? 'Recette'
        }));
        this.users = users.items;
      },
      error: () => {
        this.error = 'Impossible de charger les données admin.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private executeDeleteRecipe(recipeId: string): void {
    this.recipeService.deleteRecipe(recipeId).subscribe({
      next: () => {
        this.feedback = 'Recette supprimée';
        this.recipes = this.recipes.filter((recipe) => recipe.id !== recipeId);
      }
    });
  }

  private executeDeleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.feedback = 'Commentaire supprimé';
        this.comments = this.comments.filter((comment) => comment.id !== commentId);
      }
    });
  }

  private executeDeleteUser(userId: string): void {
    this.userService.deleteAdminUser(userId).subscribe({
      next: () => {
        this.feedback = 'Utilisateur supprimé';
        this.users = this.users.filter((user) => user.id !== userId);
        if (this.editingUser?.id === userId) {
          this.editingUser = null;
        }
      }
    });
  }

  private closeConfirm() {
    this.confirmOpen = false;
    this.confirmAction = null;
  }
}
