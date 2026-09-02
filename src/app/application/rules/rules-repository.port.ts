import { Observable } from 'rxjs';
import { ApprovalRule } from '../../domain/rules/approval-rule.model';

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class RulesRepository {
  abstract getApprovalRule(): Observable<ApprovalRule | null>;
  abstract setApprovalRule(minAmount: number, secondApproverRoleId: string): Observable<{ approvalRuleId: string }>;
}
