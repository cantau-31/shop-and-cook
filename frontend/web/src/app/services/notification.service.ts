import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type NotificationLevel = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  level: NotificationLevel;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly queue$ = new Subject<Notification>();

  get notifications$(): Observable<Notification> {
    return this.queue$.asObservable();
  }

  success(message: string) {
    this.push('success', message);
  }

  error(message: string) {
    this.push('error', message);
  }

  info(message: string) {
    this.push('info', message);
  }

  private push(level: NotificationLevel, message: string) {
    this.queue$.next({
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      level,
      message
    });
  }
}
