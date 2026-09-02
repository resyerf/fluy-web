import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationRepository } from '../../application/notification/notification-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { NotificationFilter, NotificationsResult } from '../../domain/notification/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService extends NotificationRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/notifications`;

  override getMine(filter: NotificationFilter): Observable<NotificationsResult> {
    return this.http.get<NotificationsResult>(this.baseUrl, { params: { filter } });
  }

  override markAsRead(notificationId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }

  override markAllAsRead(): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.baseUrl}/read-all`, {});
  }

  override archive(notificationId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${notificationId}/archive`, {});
  }
}
