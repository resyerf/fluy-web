import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BranchService } from '../../core/branch/branch.service';
import { resolveBranchAndNavigate } from '../../core/branch/resolve-branch';
import { TenantService } from '../../core/tenancy/tenant.service';
import { IdentityRepository } from '../../application/identity/identity-repository.port';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly branchService = inject(BranchService);
  private readonly identityRepository = inject(IdentityRepository);

  protected subdomain = this.tenant.tenant() ?? '';
  protected email = '';
  protected password = '';

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);
    this.tenant.setTenant(this.subdomain);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        resolveBranchAndNavigate(this.identityRepository, this.branchService, this.router);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo iniciar sesión.');
      }
    });
  }
}
