export type NotificationType =
  | 'ApprovalAssigned'
  | 'RequestApproved'
  | 'RequestRejected'
  | 'RequestReturnedForCorrection'
  | 'RequestCompleted';

export type NotificationFilter = 'All' | 'Unread' | 'Archived';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  requestId: string | null;
  actorName: string | null;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface NotificationsResult {
  items: AppNotification[];
  totalCount: number;
  unreadCount: number;
  archivedCount: number;
}
