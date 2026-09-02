export interface PendingApproval {
  approvalId: string;
  requestId: string;
  requestTitle: string;
  amount: number | null;
  requesterEmail: string;
  submittedAt: string | null;
  tier: number;
  requiredRoleName: string | null;
}
