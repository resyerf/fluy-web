import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { BranchService } from '../../core/branch/branch.service';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { MyBranch } from '../../domain/identity/identity.model';

/**
 * Selector de sede post-login (CODE.md §9.25). Flujo: usuario loguea → si tiene 2+
 * sedes accesibles, aterriza acá y elige una (se preselecciona la de la última sesión si sigue
 * siendo accesible); si tiene 0 o 1, LoginComponent nunca navega hasta acá — se resuelve solo.
 * También sirve como pantalla de "cambiar sede" en cualquier momento desde el shell.
 */
@Component({
  selector: 'app-select-branch',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './select-branch.component.html',
  styleUrl: './select-branch.component.scss'
})
export class SelectBranchComponent {
  private readonly identityRepository = inject(IdentityRepository);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly branches = signal<MyBranch[]>([]);
  protected readonly currentBranchId = this.branchService.activeBranch()?.id ?? null;

  constructor() {
    this.identityRepository.getMyBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  select(branch: MyBranch): void {
    this.branchService.setBranch(branch);
    this.router.navigateByUrl('/requests');
  }
}
