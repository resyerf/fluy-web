export interface AuditEvent {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  previousState: string | null;
  newState: string | null;
  metadata: string | null;
  reason: string | null;
  comment: string | null;
  createdAt: string;
}
