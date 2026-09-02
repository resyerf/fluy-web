import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { RequestRepository } from '../../application/request/request-repository.port';
import { BranchService } from '../../core/branch/branch.service';
import { RequestSummary } from '../../domain/request/request.model';

const SIGNAL_BY_STATUS: Record<string, string> = {
  Draft: '',
  Submitted: 'is-amber',
  ReturnedForCorrection: 'is-amber',
  Completed: 'is-go',
  Rejected: 'is-stop'
};

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.scss'
})
export class RequestsListComponent {
  private readonly repository = inject(RequestRepository);
  private readonly branch = inject(BranchService);

  protected readonly requests = signal<RequestSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly columns = ['title', 'amount', 'status', 'submittedAt'];
  protected readonly signalByStatus = SIGNAL_BY_STATUS;

  constructor() {
    this.repository.getMine(this.branch.activeBranch()?.id ?? null).subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
