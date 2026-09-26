import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationRepository } from '../../application/organization/organization-repository.port';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';

@Component({
  selector: 'app-create-company-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ModalShellComponent
  ],
  templateUrl: './create-company-dialog.component.html',
  styleUrl: './create-company-dialog.component.scss'
})
export class CreateCompanyDialogComponent {
  private readonly repository = inject(OrganizationRepository);
  private readonly dialogRef = inject(MatDialogRef<CreateCompanyDialogComponent, boolean | null>);

  protected name = '';
  protected legalIdentifier = '';

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (!this.name.trim()) {
      this.errorMessage.set('El nombre de la empresa es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    this.repository.createCompany(this.name.trim(), this.legalIdentifier.trim() || null).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo crear la empresa.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
