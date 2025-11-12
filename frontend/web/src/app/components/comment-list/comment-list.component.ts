import { Component, Input } from '@angular/core';
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
}
