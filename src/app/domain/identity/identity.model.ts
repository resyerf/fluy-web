export interface UserRoleAssignment {
  userRoleId: string;
  roleId: string;
  roleName: string;
  branchId: string | null;
  departmentId: string | null;
}

export interface TenantUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: UserRoleAssignment[];
}

export interface TenantRole {
  id: string;
  name: string;
  isSystemRole: boolean;
  permissionCodes: string[];
}

export interface PermissionCatalogItem {
  id: string;
  code: string;
  description: string;
}

export interface CreateUserResult {
  userId: string;
  activationEmailSent: boolean;
}

export interface MyBranch {
  id: string;
  name: string;
}

export interface LoginResult {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface UpdateProfileResult {
  id: string;
  email: string;
  fullName: string;
}
