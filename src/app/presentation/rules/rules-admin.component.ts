import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { RulesRepository } from '../../application/rules/rules-repository.port';
import { TenantRole } from '../../domain/identity/identity.model';

@Component({
  selector: 'app-rules-admin',
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
  templateUrl: './rules-admin.component.html',
  styleUrl: './rules-admin.component.scss'
})
export class RulesAdminComponent {
  private readonly rulesRepository = inject(RulesRepository);
  private readonly identityRepository = inject(IdentityRepository);

  protected readonly loading = signal(true);
  protected readonly roles = signal<TenantRole[]>([]);
  protected readonly currentRule = signal<{ minAmount: number; secondApproverRoleName: string } | null>(null);

  protected minAmount: number | null = null;
  protected secondApproverRoleId = '';
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly savedMessage = signal(false);

  constructor() {
    this.load();
  }

  save(): void {
    if (this.minAmount === null || this.minAmount < 0 || !this.secondApproverRoleId) {
      this.errorMessage.set('El monto mínimo y el rol del segundo aprobador son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.savedMessage.set(false);

    this.rulesRepository.setApprovalRule(this.minAmount, this.secondApproverRoleId).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedMessage.set(true);
        this.loadRule();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo guardar la regla.');
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.identityRepository.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loadRule();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadRule(): void {
    this.rulesRepository.getApprovalRule().subscribe({
      next: (rule) => {
        this.currentRule.set(rule);
        if (rule) {
          this.minAmount = rule.minAmount;
          this.secondApproverRoleId = rule.secondApproverRoleId;
        }
      }
    });
  }
}
