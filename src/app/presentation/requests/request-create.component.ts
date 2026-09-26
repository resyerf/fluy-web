import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestRepository } from '../../application/request/request-repository.port';
import { BranchService } from '../../core/branch/branch.service';
import { RequestField } from '../../domain/request/request.model';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';

export interface RequestCreateDialogResult {
  requestId: string;
}

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ModalShellComponent
  ],
  templateUrl: './request-create.component.html',
  styleUrl: './request-create.component.scss'
})
export class RequestCreateComponent {
  private readonly repository = inject(RequestRepository);
  private readonly dialogRef = inject(MatDialogRef<RequestCreateComponent, RequestCreateDialogResult | null>);
  protected readonly branch = inject(BranchService);

  protected title = '';
  protected description = '';
  protected amount: number | null = null;
  protected readonly fields = signal<RequestField[]>([]);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  addField(): void {
    this.fields.update((current) => [...current, { key: '', value: '' }]);
  }

  removeField(index: number): void {
    this.fields.update((current) => current.filter((_, i) => i !== index));
  }

  submit(): void {
    this.errorMessage.set(null);
    this.saving.set(true);
    this.dialogRef.disableClose = true;

    const fields = this.fields().filter((field) => field.key.trim().length > 0);

    const branchId = this.branch.activeBranch()?.id ?? null;

    this.repository.create({ title: this.title, description: this.description, amount: this.amount, fields }, branchId).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.dialogRef.close({ requestId: result.requestId });
      },
      error: (error) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.errorMessage.set(this.extractErrorMessage(error));
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  private extractErrorMessage(error: unknown): string {
    const body = (error as { error?: { detail?: string; errors?: Record<string, string[]> } })?.error;

    if (body?.errors) {
      return Object.values(body.errors).flat().join(' ');
    }

    return body?.detail ?? 'No se pudo crear la solicitud.';
  }
}
