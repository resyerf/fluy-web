import { Observable } from 'rxjs';
import { WorkflowDefinitionSummary, WorkflowVersionDetail } from '../../domain/workflow/workflow.model';

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class WorkflowRepository {
  abstract getDefinitions(): Observable<WorkflowDefinitionSummary[]>;
  abstract createDefinition(name: string, description: string): Observable<{ workflowDefinitionId: string; draftVersionId: string }>;
  abstract getVersion(versionId: string): Observable<WorkflowVersionDetail>;
  abstract addStep(versionId: string, name: string, approverRoleId: string): Observable<{ workflowStepId: string }>;
  abstract addTransition(
    versionId: string,
    fromStepId: string,
    toStepId: string | null,
    conditionField: string | null,
    conditionOperator: string | null,
    conditionValue: number | null,
    order: number
  ): Observable<{ workflowTransitionId: string }>;
  abstract setInitialStep(versionId: string, stepId: string): Observable<{ workflowVersionId: string; stepId: string }>;
  abstract publish(versionId: string): Observable<{ workflowDefinitionId: string; workflowVersionId: string }>;
  abstract archive(definitionId: string): Observable<{ workflowDefinitionId: string }>;
}
