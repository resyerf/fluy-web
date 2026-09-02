import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateRequestOutcome,
  RequestRepository,
  SubmitRequestOutcome
} from '../../application/request/request-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { CreateRequestInput, RequestDetail, RequestSummary } from '../../domain/request/request.model';

@Injectable({ providedIn: 'root' })
export class RequestApiService extends RequestRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/requests`;

  override getMine(branchId: string | null): Observable<RequestSummary[]> {
    const params: Record<string, string> = {};
    if (branchId) {
      params['branchId'] = branchId;
    }
    return this.http.get<RequestSummary[]>(`${this.baseUrl}/mine`, { params });
  }

  override getById(id: string): Observable<RequestDetail> {
    return this.http.get<RequestDetail>(`${this.baseUrl}/${id}`);
  }

  override create(input: CreateRequestInput, branchId: string | null): Observable<CreateRequestOutcome> {
    return this.http.post<CreateRequestOutcome>(this.baseUrl, { ...input, branchId });
  }

  override submit(id: string): Observable<SubmitRequestOutcome> {
    return this.http.post<SubmitRequestOutcome>(`${this.baseUrl}/${id}/submit`, {});
  }
}
