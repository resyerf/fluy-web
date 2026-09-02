import { Observable } from 'rxjs';
import { Branch, BranchWithCompany, Company, Department } from '../../domain/organization/organization.model';

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class OrganizationRepository {
  abstract getCompanies(): Observable<Company[]>;
  abstract createCompany(name: string, legalIdentifier: string | null): Observable<{ companyId: string }>;
  abstract getBranches(companyId: string): Observable<Branch[]>;
  abstract getAllBranches(): Observable<BranchWithCompany[]>;
  abstract createBranch(companyId: string, name: string): Observable<{ branchId: string }>;
  abstract getDepartments(branchId: string): Observable<Department[]>;
  abstract createDepartment(branchId: string, name: string): Observable<{ departmentId: string }>;
}
