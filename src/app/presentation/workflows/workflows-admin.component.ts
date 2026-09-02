import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { WorkflowRepository } from '../../application/workflow/workflow-repository.port';
import { TenantRole } from '../../domain/identity/identity.model';
import { WorkflowDefinitionSummary, WorkflowVersionDetail } from '../../domain/workflow/workflow.model';

const CONDITION_OPERATORS = [
  { value: 'GreaterThanOrEqual', label: '>=' },
  { value: 'GreaterThan', label: '>' },
  { value: 'LessThanOrEqual', label: '<=' },
  { value: 'LessThan', label: '<' },
  { value: 'Equal', label: '=' }
];

const SIGNAL_BY_DEFINITION_STATUS: Record<string, string> = {
  Draft: '',
  Published: 'is-go',
  Archived: ''
};

@Component({
  selector: 'app-workflows-admin',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './workflows-admin.component.html',
  styleUrl: './workflows-admin.component.scss'
})
export class WorkflowsAdminComponent {
  private readonly workflowRepository = inject(WorkflowRepository);
  private readonly identityRepository = inject(IdentityRepository);

  protected readonly loading = signal(true);
  protected readonly definitions = signal<WorkflowDefinitionSummary[]>([]);
  protected readonly roles = signal<TenantRole[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly editingVersionId = signal<string | null>(null);
  protected readonly editingVersion = signal<WorkflowVersionDetail | null>(null);

  protected readonly operators = CONDITION_OPERATORS;
  protected readonly signalByDefinitionStatus = SIGNAL_BY_DEFINITION_STATUS;

  protected newName = '';
  protected newDescription = '';

  protected stepName = '';
  protected stepRoleId = '';

  protected fromStepId = '';
  protected toStepId: string | null = null;
  protected conditionField: string | null = null;
  protected conditionOperator: string | null = null;
  protected conditionValue: number | null = null;

  constructor() {
    this.load();
  }

  createDefinition(): void {
    this.errorMessage.set(null);
    this.workflowRepository.createDefinition(this.newName, this.newDescription).subscribe({
      next: (result) => {
        this.newName = '';
        this.newDescription = '';
        this.load();
        this.openEditor(result.draftVersionId);
      },
      error: (error) => this.errorMessage.set(error?.error?.detail ?? 'No se pudo crear el workflow.')
    });
  }

  archive(definitionId: string): void {
    this.workflowRepository.archive(definitionId).subscribe({ next: () => this.load() });
  }

  openEditor(versionId: string): void {
    this.editingVersionId.set(versionId);
    this.errorMessage.set(null);
    this.loadVersion(versionId);
  }

  closeEditor(): void {
    this.editingVersionId.set(null);
    this.editingVersion.set(null);
    this.load();
  }

  addStep(): void {
    const versionId = this.editingVersionId();
    if (!versionId) {
      return;
    }

    this.errorMessage.set(null);
    this.workflowRepository.addStep(versionId, this.stepName, this.stepRoleId).subscribe({
      next: () => {
        this.stepName = '';
        this.stepRoleId = '';
        this.loadVersion(versionId);
      },
      error: (error) => this.errorMessage.set(error?.error?.detail ?? 'No se pudo agregar el paso.')
    });
  }

  setInitialStep(stepId: string): void {
    const versionId = this.editingVersionId();
    if (!versionId) {
      return;
    }

    this.workflowRepository.setInitialStep(versionId, stepId).subscribe({ next: () => this.loadVersion(versionId) });
  }

  addTransition(): void {
    const versionId = this.editingVersionId();
    if (!versionId) {
      return;
    }

    this.errorMessage.set(null);
    const order = this.editingVersion()?.transitions.length ?? 0;

    this.workflowRepository
      .addTransition(versionId, this.fromStepId, this.toStepId, this.conditionField, this.conditionOperator, this.conditionValue, order)
      .subscribe({
        next: () => {
          this.fromStepId = '';
          this.toStepId = null;
          this.conditionField = null;
          this.conditionOperator = null;
          this.conditionValue = null;
          this.loadVersion(versionId);
        },
        error: (error) => this.errorMessage.set(error?.error?.detail ?? 'No se pudo agregar la transición.')
      });
  }

  publish(): void {
    const versionId = this.editingVersionId();
    if (!versionId) {
      return;
    }

    this.errorMessage.set(null);
    this.workflowRepository.publish(versionId).subscribe({
      next: () => this.closeEditor(),
      error: (error) => this.errorMessage.set(error?.error?.detail ?? 'No se pudo publicar el workflow.')
    });
  }

  protected stepName_(stepId: string): string {
    return this.editingVersion()?.steps.find((s) => s.id === stepId)?.name ?? stepId;
  }

  protected operatorLabel(operator: string | null): string {
    return CONDITION_OPERATORS.find((o) => o.value === operator)?.label ?? '';
  }

  private load(): void {
    this.loading.set(true);
    this.identityRepository.getRoles().subscribe({ next: (roles) => this.roles.set(roles) });
    this.workflowRepository.getDefinitions().subscribe({
      next: (definitions) => {
        this.definitions.set(definitions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadVersion(versionId: string): void {
    this.workflowRepository.getVersion(versionId).subscribe({ next: (version) => this.editingVersion.set(version) });
  }
}
