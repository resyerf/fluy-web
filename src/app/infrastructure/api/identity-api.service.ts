import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import {
  CreateUserResult,
  MyBranch,
  PermissionCatalogItem,
  TenantRole,
  TenantUser
} from '../../domain/identity/identity.model';

@Injectable({ providedIn: 'root' })
export class IdentityApiService extends IdentityRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/identity`;

  override getUsers(): Observable<TenantUser[]> {
    return this.http.get<TenantUser[]>(`${this.baseUrl}/users`);
  }

  override getRoles(): Observable<TenantRole[]> {
    return this.http.get<TenantRole[]>(`${this.baseUrl}/roles`);
  }

  override getPermissionCatalog(): Observable<PermissionCatalogItem[]> {
    return this.http.get<PermissionCatalogItem[]>(`${this.baseUrl}/permissions`);
  }

  override getMyBranches(): Observable<MyBranch[]> {
    return this.http.get<MyBranch[]>(`${this.baseUrl}/my-branches`);
  }

  override createUser(email: string, fullName: string): Observable<CreateUserResult> {
    return this.http.post<CreateUserResult>(`${this.baseUrl}/users`, { email, fullName });
  }

  override createRole(name: string, permissionCodes: string[]): Observable<{ roleId: string }> {
    return this.http.post<{ roleId: string }>(`${this.baseUrl}/roles`, { name, permissionCodes });
  }

  override assignRole(
    userId: string,
    roleId: string,
    branchId: string | null,
    departmentId: string | null
  ): Observable<{ userRoleId: string }> {
    return this.http.post<{ userRoleId: string }>(`${this.baseUrl}/user-roles`, {
      userId,
      roleId,
      branchId,
      departmentId
    });
  }
}
