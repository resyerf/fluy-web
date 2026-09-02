import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ApprovalRepository } from '../../application/approval/approval-repository.port';
import { BranchService } from '../../core/branch/branch.service';
import { PendingApproval } from '../../domain/approval/approval.model';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss'
})
export class PendingApprovalsComponent {
  private readonly repository = inject(ApprovalRepository);
  private readonly branch = inject(BranchService);

  protected readonly items = signal<PendingApproval[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);
  protected readonly comments: Record<string, string> = {};
  protected readonly errorMessages: Record<string, string> = {};

  constructor() {
    this.load();
  }

  approve(item: PendingApproval): void {
    this.act(item, () => this.repository.approve(item.requestId, this.comments[item.approvalId] || null));
  }

  reject(item: PendingApproval): void {
    const comment = this.comments[item.approvalId];
    if (!comment?.trim()) {
      this.errorMessages[item.approvalId] = 'El motivo del rechazo es obligatorio.';
      return;
    }
    this.act(item, () => this.repository.reject(item.requestId, comment));
  }

  requestCorrection(item: PendingApproval): void {
    const comment = this.comments[item.approvalId];
    if (!comment?.trim()) {
      this.errorMessages[item.approvalId] = 'El motivo de la corrección es obligatorio.';
      return;
    }
    this.act(item, () => this.repository.requestCorrection(item.requestId, comment));
  }

  private act(item: PendingApproval, action: () => ReturnType<ApprovalRepository['approve']>): void {
    delete this.errorMessages[item.approvalId];
    this.busyId.set(item.approvalId);

    action().subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (error) => {
        this.busyId.set(null);
        this.errorMessages[item.approvalId] = error?.error?.detail ?? 'No se pudo procesar la decisión.';
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.repository.getPending(this.branch.activeBranch()?.id ?? null).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
