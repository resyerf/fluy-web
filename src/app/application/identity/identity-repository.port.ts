import { Observable } from 'rxjs';
import {
  CreateUserResult,
  MyBranch,
  PermissionCatalogItem,
  TenantRole,
  TenantUser
} from '../../domain/identity/identity.model';

/** Puerto (CODE.md §5.5) — infrastructure/api lo implementa contra fluy-service. */
export abstract class IdentityRepository {
  abstract getUsers(): Observable<TenantUser[]>;
  abstract getRoles(): Observable<TenantRole[]>;
  abstract getPermissionCatalog(): Observable<PermissionCatalogItem[]>;
  abstract getMyBranches(): Observable<MyBranch[]>;
  abstract createUser(email: string, fullName: string): Observable<CreateUserResult>;
  abstract createRole(name: string, permissionCodes: string[]): Observable<{ roleId: string }>;
  abstract assignRole(
    userId: string,
    roleId: string,
    branchId: string | null,
    departmentId: string | null
  ): Observable<{ userRoleId: string }>;
}
