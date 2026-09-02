import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ApprovalRepository } from './application/approval/approval-repository.port';
import { AuthRepository } from './application/identity/auth-repository.port';
import { IdentityRepository } from './application/identity/identity-repository.port';
import { NotificationRepository } from './application/notification/notification-repository.port';
import { OrganizationRepository } from './application/organization/organization-repository.port';
import { RequestRepository } from './application/request/request-repository.port';
import { RulesRepository } from './application/rules/rules-repository.port';
import { WorkflowRepository } from './application/workflow/workflow-repository.port';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ApprovalApiService } from './infrastructure/api/approval-api.service';
import { AuthApiService } from './infrastructure/api/auth-api.service';
import { IdentityApiService } from './infrastructure/api/identity-api.service';
import { NotificationApiService } from './infrastructure/api/notification-api.service';
import { OrganizationApiService } from './infrastructure/api/organization-api.service';
import { RequestApiService } from './infrastructure/api/request-api.service';
import { RulesApiService } from './infrastructure/api/rules-api.service';
import { WorkflowApiService } from './infrastructure/api/workflow-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: AuthRepository, useClass: AuthApiService },
    { provide: RequestRepository, useClass: RequestApiService },
    { provide: ApprovalRepository, useClass: ApprovalApiService },
    { provide: IdentityRepository, useClass: IdentityApiService },
    { provide: OrganizationRepository, useClass: OrganizationApiService },
    { provide: RulesRepository, useClass: RulesApiService },
    { provide: WorkflowRepository, useClass: WorkflowApiService },
    { provide: NotificationRepository, useClass: NotificationApiService }
  ]
};
