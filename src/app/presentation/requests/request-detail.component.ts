import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestRepository } from '../../application/request/request-repository.port';
import { RequestDetail } from '../../domain/request/request.model';

const SIGNAL_BY_STATUS: Record<string, string> = {
  Draft: '',
  Submitted: 'is-amber',
  ReturnedForCorrection: 'is-amber',
  Completed: 'is-go',
  Rejected: 'is-stop'
};

interface RouteStep {
  title: string;
  meta?: string;
  state: 'done' | 'current' | 'stop' | '';
}

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss'
})
export class RequestDetailComponent {
  private readonly repository = inject(RequestRepository);
  private readonly route = inject(ActivatedRoute);

  protected readonly request = signal<RequestDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly signalByStatus = SIGNAL_BY_STATUS;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  protected canSubmit(status: RequestDetail['status']): boolean {
    return status === 'Draft' || status === 'ReturnedForCorrection';
  }

  protected routeSteps(request: RequestDetail): RouteStep[] {
    if (!request.submittedAt) {
      return [];
    }

    const steps: RouteStep[] = [{ title: 'Enviada', state: 'done' }];
    const approval = request.latestApproval;

    if (!approval) {
      return steps;
    }

    if (approval.status === 'Pending') {
      steps.push({
        title: approval.tier > 1 ? `Paso ${approval.tier}` : 'Revisión',
        meta: approval.requiredRoleName ?? undefined,
        state: 'current'
      });
      steps.push({ title: '…', state: '' });
    } else if (approval.status === 'Approved' && request.status === 'Completed') {
      steps.push({ title: 'Completada', meta: approval.decidedAt ?? undefined, state: 'done' });
    } else if (approval.status === 'Rejected') {
      steps.push({ title: 'Rechazada', meta: approval.decidedAt ?? undefined, state: 'stop' });
    } else if (approval.status === 'ReturnedForCorrection') {
      steps.push({ title: 'Corrección solicitada', meta: approval.decidedAt ?? undefined, state: 'current' });
    }

    return steps;
  }

  submitRequest(): void {
    const current = this.request();
    if (!current) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.repository.submit(current.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.load(current.id);
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(error?.error?.detail ?? 'No se pudo enviar la solicitud.');
      }
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.repository.getById(id).subscribe({
      next: (request) => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: () => {
        this.request.set(null);
        this.loading.set(false);
      }
    });
  }
}
