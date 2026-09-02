export interface WorkflowVersionSummary {
  id: string;
  versionNumber: number;
  status: string;
}

export interface WorkflowDefinitionSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  versions: WorkflowVersionSummary[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  approverRoleId: string;
  approverRoleName: string;
  order: number;
}

export interface WorkflowTransition {
  id: string;
  fromStepId: string;
  toStepId: string | null;
  conditionField: string | null;
  conditionOperator: string | null;
  conditionValue: number | null;
  order: number;
}

export interface WorkflowVersionDetail {
  id: string;
  workflowDefinitionId: string;
  versionNumber: number;
  status: string;
  initialStepId: string | null;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}
