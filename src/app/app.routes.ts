import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./presentation/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'set-password',
    loadComponent: () => import('./presentation/auth/set-password.component').then((m) => m.SetPasswordComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'requests', pathMatch: 'full' },
      {
        path: 'select-branch',
        loadComponent: () =>
          import('./presentation/branches/select-branch.component').then((m) => m.SelectBranchComponent)
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./presentation/requests/requests-list.component').then((m) => m.RequestsListComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./presentation/requests/request-detail.component').then((m) => m.RequestDetailComponent)
      },
      {
        path: 'approvals',
        loadComponent: () =>
          import('./presentation/approvals/pending-approvals.component').then((m) => m.PendingApprovalsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./presentation/notifications/notifications-list.component').then(
            (m) => m.NotificationsListComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () => import('./presentation/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'identity',
        loadComponent: () =>
          import('./presentation/identity/identity-admin.component').then((m) => m.IdentityAdminComponent)
      },
      {
        path: 'organization',
        loadComponent: () =>
          import('./presentation/organization/organization-admin.component').then((m) => m.OrganizationAdminComponent)
      },
      {
        path: 'rules',
        loadComponent: () => import('./presentation/rules/rules-admin.component').then((m) => m.RulesAdminComponent)
      },
      {
        path: 'workflows',
        loadComponent: () =>
          import('./presentation/workflows/workflows-admin.component').then((m) => m.WorkflowsAdminComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
