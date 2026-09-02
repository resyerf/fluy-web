import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { OrganizationRepository } from '../../application/organization/organization-repository.port';
import {
  PermissionCatalogItem,
  TenantRole,
  TenantUser
} from '../../domain/identity/identity.model';
import { BranchWithCompany } from '../../domain/organization/organization.model';
import { CreateRoleDialogComponent } from './create-role-dialog.component';
import { CreateUserDialogComponent } from './create-user-dialog.component';

const SIGNAL_BY_USER_STATUS: Record<string, string> = {
  Invited: 'is-amber',
  Active: 'is-go',
  Disabled: 'is-stop'
};

@Component({
  selector: 'app-identity-admin',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule
  ],
  templateUrl: './identity-admin.component.html',
  styleUrl: './identity-admin.component.scss'
})
export class IdentityAdminComponent {
  private readonly repository = inject(IdentityRepository);
  private readonly organizationRepository = inject(OrganizationRepository);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly users = signal<TenantUser[]>([]);
  protected readonly roles = signal<TenantRole[]>([]);
  protected readonly permissions = signal<PermissionCatalogItem[]>([]);
  protected readonly branches = signal<BranchWithCompany[]>([]);
  protected readonly signalByUserStatus = SIGNAL_BY_USER_STATUS;

  protected readonly lastCreatedUserEmailSent = signal<boolean | null>(null);

  protected readonly selectedRoleByUser: Record<string, string> = {};
  protected readonly selectedBranchByUser: Record<string, string | null> = {};
  protected readonly assigningUserId = signal<string | null>(null);
  protected readonly assignError: Record<string, string> = {};

  constructor() {
    this.load();
  }

  openCreateUserDialog(): void {
    this.lastCreatedUserEmailSent.set(null);

    this.dialog
      .open(CreateUserDialogComponent, { width: '440px' })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.lastCreatedUserEmailSent.set(result.activationEmailSent);
          this.loadUsers();
        }
      });
  }

  openCreateRoleDialog(): void {
    this.dialog
      .open(CreateRoleDialogComponent, { width: '480px', data: { permissions: this.permissions() } })
      .afterClosed()
      .subscribe((created) => {
        if (created) {
          this.loadRoles();
        }
      });
  }

  assignRole(user: TenantUser): void {
    const roleId = this.selectedRoleByUser[user.id];
    if (!roleId) {
      return;
    }

    delete this.assignError[user.id];
    this.assigningUserId.set(user.id);
    const branchId = this.selectedBranchByUser[user.id] ?? null;

    this.repository.assignRole(user.id, roleId, branchId, null).subscribe({
      next: () => {
        this.assigningUserId.set(null);
        this.loadUsers();
      },
      error: (error) => {
        this.assigningUserId.set(null);
        this.assignError[user.id] = error?.error?.detail ?? 'No se pudo asignar el rol.';
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.organizationRepository.getAllBranches().subscribe({ next: (items) => this.branches.set(items) });
    this.repository.getPermissionCatalog().subscribe({
      next: (items) => {
        this.permissions.set(items);
        this.loadUsers();
        this.loadRoles();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadUsers(): void {
    this.repository.getUsers().subscribe({ next: (items) => this.users.set(items) });
  }

  private loadRoles(): void {
    this.repository.getRoles().subscribe({ next: (items) => this.roles.set(items) });
  }

  protected branchName(branchId: string): string {
    return this.branches().find((b) => b.id === branchId)?.name ?? branchId;
  }
}
