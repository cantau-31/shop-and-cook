import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent {
  @Input() comments: Comment[] | null = [];
  @Input() currentUserId?: string | null;
  @Input() isAdmin = false;
  @Output() deleteRequested = new EventEmitter<string>();

  canDelete(comment: Comment) {
    if (!comment.id) {
      return false;
    }
    if (this.isAdmin) {
      return true;
    }
    return this.currentUserId != null && comment.authorId === this.currentUserId;
  }

  isMine(comment: Comment) {
    return this.currentUserId != null && comment.authorId === this.currentUserId;
  }

  trackComment(_index: number, comment: Comment) {
    return comment.id;
  }
}
