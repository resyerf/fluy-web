import { Observable } from 'rxjs';
import { NotificationFilter, NotificationsResult } from '../../domain/notification/notification.model';

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class NotificationRepository {
  abstract getMine(filter: NotificationFilter): Observable<NotificationsResult>;
  abstract markAsRead(notificationId: string): Observable<void>;
  abstract markAllAsRead(): Observable<{ updated: number }>;
  abstract archive(notificationId: string): Observable<void>;
}
