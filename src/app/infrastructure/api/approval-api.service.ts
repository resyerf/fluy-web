import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApprovalDecisionOutcome, ApprovalRepository } from '../../application/approval/approval-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { PendingApproval } from '../../domain/approval/approval.model';

@Injectable({ providedIn: 'root' })
export class ApprovalApiService extends ApprovalRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/approvals`;

  override getPending(branchId: string | null): Observable<PendingApproval[]> {
    const params: Record<string, string> = {};
    if (branchId) {
      params['branchId'] = branchId;
    }
    return this.http.get<PendingApproval[]>(`${this.baseUrl}/pending`, { params });
  }

  override approve(requestId: string, comment: string | null): Observable<ApprovalDecisionOutcome> {
    return this.http.post<ApprovalDecisionOutcome>(`${this.baseUrl}/${requestId}/approve`, { comment });
  }

  override reject(requestId: string, comment: string): Observable<ApprovalDecisionOutcome> {
    return this.http.post<ApprovalDecisionOutcome>(`${this.baseUrl}/${requestId}/reject`, { comment });
  }

  override requestCorrection(requestId: string, comment: string): Observable<ApprovalDecisionOutcome> {
    return this.http.post<ApprovalDecisionOutcome>(`${this.baseUrl}/${requestId}/request-correction`, { comment });
  }
}
