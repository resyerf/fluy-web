import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationRepository } from '../../application/organization/organization-repository.port';
import { Branch, Company, Department } from '../../domain/organization/organization.model';

@Component({
  selector: 'app-organization-admin',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './organization-admin.component.html',
  styleUrl: './organization-admin.component.scss'
})
export class OrganizationAdminComponent {
  private readonly repository = inject(OrganizationRepository);

  protected readonly loading = signal(true);
  protected readonly companies = signal<Company[]>([]);

  protected newCompanyName = '';
  protected newCompanyLegalIdentifier = '';
  protected readonly creatingCompany = signal(false);
  protected readonly createCompanyError = signal<string | null>(null);

  protected readonly branchesByCompany: Record<string, Branch[] | undefined> = {};
  protected readonly branchesLoading: Record<string, boolean> = {};
  protected readonly newBranchName: Record<string, string> = {};
  protected readonly creatingBranchFor = signal<string | null>(null);
  protected readonly branchError: Record<string, string> = {};

  protected readonly departmentsByBranch: Record<string, Department[] | undefined> = {};
  protected readonly departmentsLoading: Record<string, boolean> = {};
  protected readonly newDepartmentName: Record<string, string> = {};
  protected readonly creatingDepartmentFor = signal<string | null>(null);
  protected readonly departmentError: Record<string, string> = {};

  constructor() {
    this.loadCompanies();
  }

  createCompany(): void {
    if (!this.newCompanyName.trim()) {
      this.createCompanyError.set('El nombre de la empresa es obligatorio.');
      return;
    }

    this.creatingCompany.set(true);
    this.createCompanyError.set(null);

    this.repository.createCompany(this.newCompanyName.trim(), this.newCompanyLegalIdentifier.trim() || null).subscribe({
      next: () => {
        this.creatingCompany.set(false);
        this.newCompanyName = '';
        this.newCompanyLegalIdentifier = '';
        this.loadCompanies();
      },
      error: (error) => {
        this.creatingCompany.set(false);
        this.createCompanyError.set(error?.error?.detail ?? 'No se pudo crear la empresa.');
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

  createBranch(company: Company): void {
    const name = this.newBranchName[company.id];
    if (!name?.trim()) {
      return;
    }

    delete this.branchError[company.id];
    this.creatingBranchFor.set(company.id);

    this.repository.createBranch(company.id, name.trim()).subscribe({
      next: () => {
        this.creatingBranchFor.set(null);
        this.newBranchName[company.id] = '';
        this.loadBranches(company.id);
      },
      error: (error) => {
        this.creatingBranchFor.set(null);
        this.branchError[company.id] = error?.error?.detail ?? 'No se pudo crear la sede.';
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

  createDepartment(branch: Branch): void {
    const name = this.newDepartmentName[branch.id];
    if (!name?.trim()) {
      return;
    }

    delete this.departmentError[branch.id];
    this.creatingDepartmentFor.set(branch.id);

    this.repository.createDepartment(branch.id, name.trim()).subscribe({
      next: () => {
        this.creatingDepartmentFor.set(null);
        this.newDepartmentName[branch.id] = '';
        this.loadDepartments(branch.id);
      },
      error: (error) => {
        this.creatingDepartmentFor.set(null);
        this.departmentError[branch.id] = error?.error?.detail ?? 'No se pudo crear el departamento.';
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
