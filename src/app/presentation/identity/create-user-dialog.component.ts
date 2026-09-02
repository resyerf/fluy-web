import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IdentityRepository } from '../../application/identity/identity-repository.port';

export interface CreateUserDialogResult {
  activationEmailSent: boolean;
}

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.scss'
})
export class CreateUserDialogComponent {
  private readonly repository = inject(IdentityRepository);
  private readonly dialogRef = inject(MatDialogRef<CreateUserDialogComponent, CreateUserDialogResult | null>);

  protected email = '';
  protected fullName = '';

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (!this.email.trim() || !this.fullName.trim()) {
      this.errorMessage.set('Email y nombre son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.repository.createUser(this.email.trim(), this.fullName.trim()).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.dialogRef.close({ activationEmailSent: result.activationEmailSent });
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo crear el usuario.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
