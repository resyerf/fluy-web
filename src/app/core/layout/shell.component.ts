import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { BranchService } from '../branch/branch.service';
import { TenantService } from '../tenancy/tenant.service';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { path: '/requests', label: 'Mis solicitudes', icon: 'inbox', exact: true },
  { path: '/approvals', label: 'Aprobaciones', icon: 'fact_check' },
  { path: '/identity', label: 'Usuarios y roles', icon: 'group' },
  { path: '/organization', label: 'Organización', icon: 'account_tree' },
  { path: '/workflows', label: 'Workflows', icon: 'route' }
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    NotificationBellComponent,
    UserMenuComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  protected readonly tenant = inject(TenantService);
  protected readonly branch = inject(BranchService);
  protected readonly navLinks = NAV_LINKS;
}
