import { Observable } from 'rxjs';
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

/**
 * Puerto (CODE.md §5.5): infrastructure/api lo implementa contra fluy-service. Clase abstracta en
 * vez de interface de TS porque Angular necesita un token de inyección que exista en runtime.
 */
export abstract class RequestRepository {
  abstract getMine(branchId: string | null): Observable<RequestSummary[]>;
  abstract getById(id: string): Observable<RequestDetail>;
  abstract create(input: CreateRequestInput, branchId: string | null): Observable<CreateRequestOutcome>;
  abstract submit(id: string): Observable<SubmitRequestOutcome>;
}
