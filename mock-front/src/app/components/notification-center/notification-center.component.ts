import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';

import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private sub?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notifications$.subscribe((notification) => {
      this.notifications = [...this.notifications, notification];
      timer(4000).subscribe(() => this.dismiss(notification.id));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter((item) => item.id !== id);
  }

  trackById(_index: number, item: Notification) {
    return item.id;
  }
}
