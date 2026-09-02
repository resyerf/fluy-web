import { Injectable, inject, signal } from '@angular/core';
import { TenantService } from '../tenancy/tenant.service';

export interface ActiveBranch {
  id: string;
  name: string;
}

/**
 * Sede activa de la sesión (CODE.md §9.25). Persistida por subdominio de tenant, no
 * globalmente — si el mismo navegador se usa para más de un tenant, cada uno recuerda su propia
 * última sede sin pisarse. `null` es un estado legítimo (tenant sin sedes configuradas, o el
 * usuario todavía no eligió) — no filtra nada, no bloquea nada, es el comportamiento anterior a
 * esta funcionalidad.
 */
@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly tenant = inject(TenantService);

  private readonly activeBranchSignal = signal<ActiveBranch | null>(this.readStored());

  readonly activeBranch = this.activeBranchSignal.asReadonly();

  setBranch(branch: ActiveBranch): void {
    this.activeBranchSignal.set(branch);

    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(branch));
    } catch {
      // Almacenamiento no disponible — la sede activa sigue viva en memoria para esta pestaña.
    }
  }

  clearBranch(): void {
    this.activeBranchSignal.set(null);

    try {
      localStorage.removeItem(this.storageKey());
    } catch {
      // Ignorado a propósito — ver setBranch().
    }
  }

  private storageKey(): string {
    return `fluy.branch.${this.tenant.tenant() ?? 'unknown'}`;
  }

  private readStored(): ActiveBranch | null {
    try {
      const raw = localStorage.getItem(this.storageKey());
      return raw ? (JSON.parse(raw) as ActiveBranch) : null;
    } catch {
      return null;
    }
  }
}
