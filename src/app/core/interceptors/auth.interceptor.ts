import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenancy/tenant.service';

/**
 * Adjunta X-Tenant (resolución de tenant en desarrollo local, sin subdominios reales — mismo
 * mecanismo que TenantResolutionMiddleware acepta en fluy-service) y el Bearer token si hay
 * sesión activa. No decide si la request debería llevarlos o no: eso lo determina el propio
 * backend con TenantResolutionMiddleware/[Authorize].
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tenant = inject(TenantService);

  let headers = req.headers;

  const subdomain = tenant.tenant();
  if (subdomain) {
    headers = headers.set('X-Tenant', subdomain);
  }

  const token = auth.token();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(req.clone({ headers }));
};
