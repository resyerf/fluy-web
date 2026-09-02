import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BranchService } from '../../core/branch/branch.service';
import { resolveBranchAndNavigate } from '../../core/branch/resolve-branch';
import { TenantService } from '../../core/tenancy/tenant.service';
import { IdentityRepository } from '../../application/identity/identity-repository.port';

/** Destino del link de activación enviado por email (CODE.md §9.24) — token de PasswordSetToken vía query params. */
@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss'
})
export class SetPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly tenant = inject(TenantService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly branchService = inject(BranchService);
  private readonly identityRepository = inject(IdentityRepository);

  protected readonly tokenPresent: boolean;
  private readonly token: string;

  protected newPassword = '';
  protected confirmPassword = '';

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    this.token = params.get('token') ?? '';
    this.tokenPresent = this.token.length > 0;

    const tenantSubdomain = params.get('tenant');
    if (tenantSubdomain) {
      this.tenant.setTenant(tenantSubdomain);
    }
  }

  submit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.setPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        resolveBranchAndNavigate(this.identityRepository, this.branchService, this.router);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo activar la cuenta.');
      }
    });
  }
}
