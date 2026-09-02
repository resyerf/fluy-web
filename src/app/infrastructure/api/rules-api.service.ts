import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RulesRepository } from '../../application/rules/rules-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { ApprovalRule } from '../../domain/rules/approval-rule.model';

@Injectable({ providedIn: 'root' })
export class RulesApiService extends RulesRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/rules`;

  override getApprovalRule(): Observable<ApprovalRule | null> {
    return this.http.get<ApprovalRule | null>(`${this.baseUrl}/approval`);
  }

  override setApprovalRule(minAmount: number, secondApproverRoleId: string): Observable<{ approvalRuleId: string }> {
    return this.http.put<{ approvalRuleId: string }>(`${this.baseUrl}/approval`, { minAmount, secondApproverRoleId });
  }
}
