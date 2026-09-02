import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'fluy.tenant';

/**
 * En producción el tenant se resuelve por subdominio (acme.fluy.com) — no hay nada que "elegir"
 * en el navegador. En local, sin subdominios reales, se pide una vez y se manda como header
 * X-Tenant en cada request (mismo mecanismo que ya soporta TenantResolutionMiddleware en
 * fluy-service para desarrollo, CODE.md §4.6).
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenantSignal = signal<string | null>(this.readStoredTenant());

  readonly tenant = this.tenantSignal.asReadonly();

  setTenant(subdomain: string): void {
    const normalized = subdomain.trim().toLowerCase();
    this.tenantSignal.set(normalized);

    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Almacenamiento no disponible (modo privado, etc.) — el tenant sigue viviendo en memoria.
    }
  }

  clearTenant(): void {
    this.tenantSignal.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorado a propósito — ver setTenant().
    }
  }

  private readStoredTenant(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
