import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationRepository } from '../../application/notification/notification-repository.port';
import { AppNotification, NotificationFilter, NotificationsResult } from '../../domain/notification/notification.model';

const EMPTY_RESULT: NotificationsResult = { items: [], totalCount: 0, unreadCount: 0, archivedCount: 0 };

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
  private readonly repository = inject(NotificationRepository);
  private readonly router = inject(Router);

  protected readonly filter = signal<NotificationFilter>('All');
  protected readonly result = signal<NotificationsResult>(EMPTY_RESULT);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  setFilter(filter: NotificationFilter): void {
    this.filter.set(filter);
    this.load();
  }

  open(notification: AppNotification): void {
    if (!notification.isRead) {
      this.repository.markAsRead(notification.id).subscribe(() => this.load());
    }
    if (notification.requestId) {
      this.router.navigate(['/requests', notification.requestId]);
    }
  }

  archive(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.busyId.set(notification.id);
    this.repository.archive(notification.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: () => this.busyId.set(null)
    });
  }

  markAllAsRead(): void {
    this.repository.markAllAsRead().subscribe(() => this.load());
  }

  timeAgo(iso: string): string {
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) {
      return 'ahora';
    }
    if (seconds < 3600) {
      return `hace ${Math.floor(seconds / 60)} min`;
    }
    if (seconds < 86_400) {
      return `hace ${Math.floor(seconds / 3600)} h`;
    }
    return `hace ${Math.floor(seconds / 86_400)} d`;
  }

  private load(): void {
    this.loading.set(true);
    this.repository.getMine(this.filter()).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
