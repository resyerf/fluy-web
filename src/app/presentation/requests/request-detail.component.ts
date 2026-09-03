import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestRepository } from '../../application/request/request-repository.port';
import { AuditEvent } from '../../domain/request/audit-event.model';
import { RequestDocument } from '../../domain/request/document.model';
import { RequestDetail } from '../../domain/request/request.model';

const SIGNAL_BY_STATUS: Record<string, string> = {
  Draft: '',
  Submitted: 'is-amber',
  ReturnedForCorrection: 'is-amber',
  Completed: 'is-go',
  Rejected: 'is-stop'
};

const AUDIT_ACTION_LABEL: Partial<Record<string, string>> = {
  'request.created': 'Solicitud creada',
  'request.submitted': 'Solicitud enviada',
  'request.approved': 'Solicitud aprobada',
  'request.rejected': 'Solicitud rechazada',
  'request.correction_requested': 'Corrección solicitada'
};

interface RouteStep {
  title: string;
  meta?: string;
  state: 'done' | 'current' | 'stop' | '';
}

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss'
})
export class RequestDetailComponent {
  private readonly repository = inject(RequestRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly request = signal<RequestDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly signalByStatus = SIGNAL_BY_STATUS;
  protected readonly auditActionLabel = AUDIT_ACTION_LABEL;

  protected readonly documents = signal<RequestDocument[]>([]);
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly downloadingId = signal<string | null>(null);

  protected readonly auditEvents = signal<AuditEvent[]>([]);
  protected readonly showAudit = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
    this.loadDocuments(id);
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

  triggerFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const current = this.request();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!current || !file) {
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);

    this.repository.uploadDocument(current.id, file).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = '';
        this.loadDocuments(current.id);
      },
      error: (error) => {
        this.uploading.set(false);
        this.uploadError.set(error?.error?.detail ?? 'No se pudo subir el archivo.');
      }
    });
  }

  downloadDocument(document: RequestDocument): void {
    const current = this.request();
    if (!current) {
      return;
    }

    this.downloadingId.set(document.id);
    this.repository.downloadDocument(current.id, document.id).subscribe({
      next: (blob) => {
        this.downloadingId.set(null);
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.downloadingId.set(null)
    });
  }

  toggleAudit(): void {
    const current = this.request();
    if (!current) {
      return;
    }

    const next = !this.showAudit();
    this.showAudit.set(next);
    if (next && this.auditEvents().length === 0) {
      this.repository.getAuditTrail(current.id).subscribe({ next: (events) => this.auditEvents.set(events) });
    }
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

  private loadDocuments(id: string): void {
    this.repository.getDocuments(id).subscribe({ next: (documents) => this.documents.set(documents) });
  }
}
