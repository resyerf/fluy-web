import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { BranchService } from '../../core/branch/branch.service';
import { TenantService } from '../../core/tenancy/tenant.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  protected readonly tenant = inject(TenantService);
  protected readonly branch = inject(BranchService);

  protected readonly editingName = signal(false);
  protected fullNameDraft = '';
  protected readonly savingName = signal(false);
  protected readonly nameError = signal<string | null>(null);

  protected currentPassword = '';
  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly changingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSuccess = signal(false);

  initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  }

  startEditName(currentName: string): void {
    this.fullNameDraft = currentName;
    this.nameError.set(null);
    this.editingName.set(true);
  }

  cancelEditName(): void {
    this.editingName.set(false);
  }

  saveName(): void {
    const fullName = this.fullNameDraft.trim();
    if (!fullName) {
      this.nameError.set('El nombre no puede estar vacío.');
      return;
    }

    this.nameError.set(null);
    this.savingName.set(true);

    this.auth.updateProfile(fullName).subscribe({
      next: () => {
        this.savingName.set(false);
        this.editingName.set(false);
      },
      error: (error) => {
        this.savingName.set(false);
        this.nameError.set(error?.error?.detail ?? 'No se pudo actualizar el nombre.');
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }

    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.changingPassword.set(true);

    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSuccess.set(true);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (error) => {
        this.changingPassword.set(false);
        this.passwordError.set(error?.error?.detail ?? 'No se pudo cambiar la contraseña.');
      }
    });
  }
}
