import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkflowRepository } from '../../application/workflow/workflow-repository.port';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';

export interface CreateWorkflowDialogResult {
  workflowDefinitionId: string;
  draftVersionId: string;
}

@Component({
  selector: 'app-create-workflow-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ModalShellComponent
  ],
  templateUrl: './create-workflow-dialog.component.html',
  styleUrl: './create-workflow-dialog.component.scss'
})
export class CreateWorkflowDialogComponent {
  private readonly repository = inject(WorkflowRepository);
  private readonly dialogRef = inject(MatDialogRef<CreateWorkflowDialogComponent, CreateWorkflowDialogResult | null>);

  protected name = '';
  protected description = '';

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (!this.name.trim()) {
      this.errorMessage.set('El nombre del workflow es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    this.repository.createDefinition(this.name.trim(), this.description.trim()).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo crear el workflow.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
