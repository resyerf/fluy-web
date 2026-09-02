import { Observable } from 'rxjs';
import { PendingApproval } from '../../domain/approval/approval.model';

export interface ApprovalDecisionOutcome {
  requestId: string;
  status: string;
}

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class ApprovalRepository {
  abstract getPending(branchId: string | null): Observable<PendingApproval[]>;
  abstract approve(requestId: string, comment: string | null): Observable<ApprovalDecisionOutcome>;
  abstract reject(requestId: string, comment: string): Observable<ApprovalDecisionOutcome>;
  abstract requestCorrection(requestId: string, comment: string): Observable<ApprovalDecisionOutcome>;
}
