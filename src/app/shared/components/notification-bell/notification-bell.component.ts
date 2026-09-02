import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, startWith, switchMap } from 'rxjs';
import { NotificationRepository } from '../../../application/notification/notification-repository.port';
import { AppNotification, NotificationFilter, NotificationsResult } from '../../../domain/notification/notification.model';

const POLL_INTERVAL_MS = 30_000;

const EMPTY_RESULT: NotificationsResult = { items: [], totalCount: 0, unreadCount: 0, archivedCount: 0 };

/**
 * Campana de notificaciones del shell (spec §20/§24). Refresca en segundo plano cada 30s para
 * que la badge de no-leídas se mantenga al día aunque el usuario nunca abra el menú — no hay
 * push/WebSocket todavía, así que polling es el mecanismo más simple que cumple el mismo objetivo.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink, MatBadgeModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent {
  private readonly repository = inject(NotificationRepository);
  private readonly router = inject(Router);

  protected readonly filter = signal<NotificationFilter>('All');
  protected readonly result = signal<NotificationsResult>(EMPTY_RESULT);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);

  constructor() {
    interval(POLL_INTERVAL_MS)
      .pipe(startWith(0), switchMap(() => this.repository.getMine(this.filter())))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  setFilter(filter: NotificationFilter, event: Event): void {
    event.stopPropagation();
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

  markAllAsRead(event: Event): void {
    event.stopPropagation();
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
