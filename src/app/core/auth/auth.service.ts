import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRepository } from '../../application/identity/auth-repository.port';
import { LoginResult } from '../../domain/identity/identity.model';

const USER_STORAGE_KEY = 'fluy.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authRepository = inject(AuthRepository);

  private readonly sessionSignal = signal<LoginResult | null>(this.readStoredSession());

  readonly currentUser = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);

  login(email: string, password: string): Observable<LoginResult> {
    return this.authRepository.login(email, password).pipe(tap((result) => this.setSession(result)));
  }

  setPassword(token: string, newPassword: string): Observable<LoginResult> {
    return this.authRepository.setPassword(token, newPassword).pipe(tap((result) => this.setSession(result)));
  }

  logout(): void {
    this.sessionSignal.set(null);

    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignorado a propósito — el estado en memoria ya se limpió.
    }
  }

  private setSession(result: LoginResult): void {
    this.sessionSignal.set(result);

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Almacenamiento no disponible — la sesión sigue viva en memoria para esta pestaña.
    }
  }

  private readStoredSession(): LoginResult | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginResult) : null;
    } catch {
      return null;
    }
  }
}
