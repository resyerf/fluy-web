import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateRequestOutcome,
  RequestRepository,
  SubmitRequestOutcome,
  UploadDocumentOutcome
} from '../../application/request/request-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { AuditEvent } from '../../domain/request/audit-event.model';
import { RequestDocument } from '../../domain/request/document.model';
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

  override uploadDocument(requestId: string, file: File): Observable<UploadDocumentOutcome> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadDocumentOutcome>(`${this.baseUrl}/${requestId}/documents`, formData);
  }

  override getDocuments(requestId: string): Observable<RequestDocument[]> {
    return this.http.get<RequestDocument[]>(`${this.baseUrl}/${requestId}/documents`);
  }

  override downloadDocument(requestId: string, documentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${requestId}/documents/${documentId}/download`, { responseType: 'blob' });
  }

  override getAuditTrail(requestId: string): Observable<AuditEvent[]> {
    return this.http.get<AuditEvent[]>(`${this.baseUrl}/${requestId}/audit`);
  }
}
