import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkflowRepository } from '../../application/workflow/workflow-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { WorkflowDefinitionSummary, WorkflowVersionDetail } from '../../domain/workflow/workflow.model';

@Injectable({ providedIn: 'root' })
export class WorkflowApiService extends WorkflowRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/workflows`;

  override getDefinitions(): Observable<WorkflowDefinitionSummary[]> {
    return this.http.get<WorkflowDefinitionSummary[]>(this.baseUrl);
  }

  override createDefinition(name: string, description: string): Observable<{ workflowDefinitionId: string; draftVersionId: string }> {
    return this.http.post<{ workflowDefinitionId: string; draftVersionId: string }>(this.baseUrl, { name, description });
  }

  override getVersion(versionId: string): Observable<WorkflowVersionDetail> {
    return this.http.get<WorkflowVersionDetail>(`${this.baseUrl}/versions/${versionId}`);
  }

  override addStep(versionId: string, name: string, approverRoleId: string): Observable<{ workflowStepId: string }> {
    return this.http.post<{ workflowStepId: string }>(`${this.baseUrl}/versions/${versionId}/steps`, { name, approverRoleId });
  }

  override addTransition(
    versionId: string,
    fromStepId: string,
    toStepId: string | null,
    conditionField: string | null,
    conditionOperator: string | null,
    conditionValue: number | null,
    order: number
  ): Observable<{ workflowTransitionId: string }> {
    return this.http.post<{ workflowTransitionId: string }>(`${this.baseUrl}/versions/${versionId}/transitions`, {
      fromStepId,
      toStepId,
      conditionField,
      conditionOperator,
      conditionValue,
      order
    });
  }

  override setInitialStep(versionId: string, stepId: string): Observable<{ workflowVersionId: string; stepId: string }> {
    return this.http.put<{ workflowVersionId: string; stepId: string }>(`${this.baseUrl}/versions/${versionId}/initial-step`, { stepId });
  }

  override publish(versionId: string): Observable<{ workflowDefinitionId: string; workflowVersionId: string }> {
    return this.http.post<{ workflowDefinitionId: string; workflowVersionId: string }>(`${this.baseUrl}/versions/${versionId}/publish`, {});
  }

  override archive(definitionId: string): Observable<{ workflowDefinitionId: string }> {
    return this.http.post<{ workflowDefinitionId: string }>(`${this.baseUrl}/${definitionId}/archive`, {});
  }
}
