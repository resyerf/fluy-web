import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { PermissionCatalogItem } from '../../domain/identity/identity.model';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';

export interface CreateRoleDialogData {
  permissions: PermissionCatalogItem[];
}

interface PermissionGroup {
  label: string;
  items: PermissionCatalogItem[];
}

const GROUP_LABELS: Record<string, string> = {
  request: 'Solicitudes',
  organization: 'Organización',
  workflow: 'Workflows',
  rules: 'Reglas',
  users: 'Usuarios',
  roles: 'Roles',
  audit: 'Auditoría',
  billing: 'Facturación',
  subscription: 'Suscripción'
};

function groupPermissions(permissions: PermissionCatalogItem[]): PermissionGroup[] {
  const byPrefix = new Map<string, PermissionCatalogItem[]>();

  for (const permission of permissions) {
    const prefix = permission.code.split('.')[0];
    const items = byPrefix.get(prefix);
    if (items) {
      items.push(permission);
    } else {
      byPrefix.set(prefix, [permission]);
    }
  }

  return Array.from(byPrefix.entries()).map(([prefix, items]) => ({
    label: GROUP_LABELS[prefix] ?? prefix,
    items
  }));
}

@Component({
  selector: 'app-create-role-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ModalShellComponent
  ],
  templateUrl: './create-role-dialog.component.html',
  styleUrl: './create-role-dialog.component.scss'
})
export class CreateRoleDialogComponent {
  private readonly repository = inject(IdentityRepository);
  private readonly dialogRef = inject(MatDialogRef<CreateRoleDialogComponent, boolean | null>);
  protected readonly data = inject<CreateRoleDialogData>(MAT_DIALOG_DATA);
  protected readonly groups = groupPermissions(this.data.permissions);

  protected name = '';
  protected readonly selectedPermissions: Record<string, boolean> = {};

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    const permissionCodes = Object.entries(this.selectedPermissions)
      .filter(([, checked]) => checked)
      .map(([code]) => code);

    if (!this.name.trim()) {
      this.errorMessage.set('El nombre del rol es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    this.repository.createRole(this.name.trim(), permissionCodes).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.dialogRef.disableClose = false;
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo crear el rol.');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
