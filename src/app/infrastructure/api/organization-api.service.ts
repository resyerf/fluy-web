import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizationRepository } from '../../application/organization/organization-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { Branch, BranchWithCompany, Company, Department } from '../../domain/organization/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationApiService extends OrganizationRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/organization`;

  override getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies`);
  }

  override createCompany(name: string, legalIdentifier: string | null): Observable<{ companyId: string }> {
    return this.http.post<{ companyId: string }>(`${this.baseUrl}/companies`, { name, legalIdentifier });
  }

  override getBranches(companyId: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/companies/${companyId}/branches`);
  }

  override getAllBranches(): Observable<BranchWithCompany[]> {
    return this.http.get<BranchWithCompany[]>(`${this.baseUrl}/branches`);
  }

  override createBranch(companyId: string, name: string): Observable<{ branchId: string }> {
    return this.http.post<{ branchId: string }>(`${this.baseUrl}/companies/${companyId}/branches`, { name });
  }

  override getDepartments(branchId: string): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/branches/${branchId}/departments`);
  }

  override createDepartment(branchId: string, name: string): Observable<{ departmentId: string }> {
    return this.http.post<{ departmentId: string }>(`${this.baseUrl}/branches/${branchId}/departments`, { name });
  }
}
