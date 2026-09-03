import { Observable } from 'rxjs';
import { AuditEvent } from '../../domain/request/audit-event.model';
import { RequestDocument } from '../../domain/request/document.model';
import { CreateRequestInput, RequestDetail, RequestSummary } from '../../domain/request/request.model';

export interface CreateRequestOutcome {
  requestId: string;
  status: string;
}

export interface SubmitRequestOutcome {
  requestId: string;
  status: string;
  submittedAt: string;
}

export interface UploadDocumentOutcome {
  documentId: string;
  fileName: string;
  sizeBytes: number;
}

/**
 * Puerto (CODE.md §5.5): infrastructure/api lo implementa contra fluy-service. Clase abstracta en
 * vez de interface de TS porque Angular necesita un token de inyección que exista en runtime.
 */
export abstract class RequestRepository {
  abstract getMine(branchId: string | null): Observable<RequestSummary[]>;
  abstract getById(id: string): Observable<RequestDetail>;
  abstract create(input: CreateRequestInput, branchId: string | null): Observable<CreateRequestOutcome>;
  abstract submit(id: string): Observable<SubmitRequestOutcome>;
  abstract uploadDocument(requestId: string, file: File): Observable<UploadDocumentOutcome>;
  abstract getDocuments(requestId: string): Observable<RequestDocument[]>;
  abstract downloadDocument(requestId: string, documentId: string): Observable<Blob>;
  abstract getAuditTrail(requestId: string): Observable<AuditEvent[]>;
}
