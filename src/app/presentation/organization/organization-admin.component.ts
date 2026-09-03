import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationRepository } from '../../application/organization/organization-repository.port';
import { Branch, Company, Department } from '../../domain/organization/organization.model';
import { CreateCompanyDialogComponent } from './create-company-dialog.component';

@Component({
  selector: 'app-organization-admin',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './organization-admin.component.html',
  styleUrl: './organization-admin.component.scss'
})
export class OrganizationAdminComponent {
  private readonly repository = inject(OrganizationRepository);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly companies = signal<Company[]>([]);

  protected readonly branchesByCompany: Record<string, Branch[] | undefined> = {};
  protected readonly branchesLoading: Record<string, boolean> = {};

  protected readonly departmentsByBranch: Record<string, Department[] | undefined> = {};
  protected readonly departmentsLoading: Record<string, boolean> = {};

  // Sedes y departamentos se crean inline (el usuario ya está mirando al padre
  // dentro de su panel expandido — un modal centrado interrumpiría un
  // contexto en el que ya está parado). Empresa sigue siendo un diálogo:
  // es una acción de nivel raíz, sin panel padre del que colgar la fila.
  protected readonly creatingBranchFor: Record<string, boolean> = {};
  protected readonly branchDraftName: Record<string, string> = {};
  protected readonly branchSaving: Record<string, boolean> = {};
  protected readonly branchError: Record<string, string> = {};

  protected readonly creatingDepartmentFor: Record<string, boolean> = {};
  protected readonly departmentDraftName: Record<string, string> = {};
  protected readonly departmentSaving: Record<string, boolean> = {};
  protected readonly departmentError: Record<string, string> = {};

  constructor() {
    this.loadCompanies();
  }

  openCreateCompanyDialog(): void {
    this.dialog
      .open(CreateCompanyDialogComponent, { width: '440px' })
      .afterClosed()
      .subscribe((created) => {
        if (created) {
          this.loadCompanies();
        }
      });
  }

  startCreateBranch(company: Company): void {
    this.creatingBranchFor[company.id] = true;
    this.branchDraftName[company.id] = '';
    delete this.branchError[company.id];
  }

  cancelCreateBranch(companyId: string): void {
    this.creatingBranchFor[companyId] = false;
  }

  submitCreateBranch(company: Company): void {
    const name = (this.branchDraftName[company.id] ?? '').trim();
    if (!name) {
      this.branchError[company.id] = 'El nombre de la sede es obligatorio.';
      return;
    }

    delete this.branchError[company.id];
    this.branchSaving[company.id] = true;

    this.repository.createBranch(company.id, name).subscribe({
      next: () => {
        this.branchSaving[company.id] = false;
        this.creatingBranchFor[company.id] = false;
        this.loadBranches(company.id);
      },
      error: (error) => {
        this.branchSaving[company.id] = false;
        this.branchError[company.id] = error?.error?.detail ?? 'No se pudo crear la sede.';
      }
    });
  }

  startCreateDepartment(branch: Branch): void {
    this.creatingDepartmentFor[branch.id] = true;
    this.departmentDraftName[branch.id] = '';
    delete this.departmentError[branch.id];
  }

  cancelCreateDepartment(branchId: string): void {
    this.creatingDepartmentFor[branchId] = false;
  }

  submitCreateDepartment(branch: Branch): void {
    const name = (this.departmentDraftName[branch.id] ?? '').trim();
    if (!name) {
      this.departmentError[branch.id] = 'El nombre del departamento es obligatorio.';
      return;
    }

    delete this.departmentError[branch.id];
    this.departmentSaving[branch.id] = true;

    this.repository.createDepartment(branch.id, name).subscribe({
      next: () => {
        this.departmentSaving[branch.id] = false;
        this.creatingDepartmentFor[branch.id] = false;
        this.loadDepartments(branch.id);
      },
      error: (error) => {
        this.departmentSaving[branch.id] = false;
        this.departmentError[branch.id] = error?.error?.detail ?? 'No se pudo crear el departamento.';
      }
    });
  }

  loadBranches(companyId: string): void {
    this.branchesLoading[companyId] = true;
    this.repository.getBranches(companyId).subscribe({
      next: (branches) => {
        this.branchesByCompany[companyId] = branches;
        this.branchesLoading[companyId] = false;
      },
      error: () => {
        this.branchesLoading[companyId] = false;
      }
    });
  }

  loadDepartments(branchId: string): void {
    this.departmentsLoading[branchId] = true;
    this.repository.getDepartments(branchId).subscribe({
      next: (departments) => {
        this.departmentsByBranch[branchId] = departments;
        this.departmentsLoading[branchId] = false;
      },
      error: () => {
        this.departmentsLoading[branchId] = false;
      }
    });
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.repository.getCompanies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
