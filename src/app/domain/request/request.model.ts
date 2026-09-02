export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'InReview'
  | 'Approved'
  | 'Rejected'
  | 'ReturnedForCorrection'
  | 'Completed'
  | 'Cancelled';

export interface RequestSummary {
  id: string;
  title: string;
  amount: number | null;
  status: RequestStatus;
  submittedAt: string | null;
}

export interface RequestField {
  key: string;
  value: string;
}

export interface LatestApproval {
  status: string;
  comment: string | null;
  decidedAt: string | null;
  tier: number;
  requiredRoleName: string | null;
}

export interface RequestDetail {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  amount: number | null;
  status: RequestStatus;
  submittedAt: string | null;
  fields: RequestField[];
  latestApproval: LatestApproval | null;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  amount: number | null;
  fields: RequestField[];
}
