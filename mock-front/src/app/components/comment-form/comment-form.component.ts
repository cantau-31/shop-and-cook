import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.scss'],
})
export class CommentFormComponent {
  @Input() recipeId!: string;
  @Output() commentCreated = new EventEmitter<Comment>();

  isSubmitting = false;

  form = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService
  ) {}

  submit(): void {
    if (this.form.invalid || !this.recipeId) {
      return;
    }

    this.isSubmitting = true;
    const message = this.form.value.message as string;

    this.commentService.createComment(this.recipeId, message).subscribe({
      next: (comment) => {
        this.form.reset();
        this.commentCreated.emit(comment);
      },
      error: () => {
        this.isSubmitting = false;
        // Could plug a toast here. Keeping it simple for now.
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
