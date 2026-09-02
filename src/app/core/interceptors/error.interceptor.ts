import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Un 401 significa sesión inválida/expirada — nunca "no tiene el permiso", eso es un 403 que cada
 * pantalla maneja por su cuenta (el backend nunca deja de ser la autoridad real, esto es solo UX).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    })
  );
};
