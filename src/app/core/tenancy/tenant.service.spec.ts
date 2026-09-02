import { TestBed } from '@angular/core/testing';
import { TenantService } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantService);
  });

  afterEach(() => localStorage.clear());

  it('starts with no tenant when localStorage is empty', () => {
    expect(service.tenant()).toBeNull();
  });

  it('normalizes and persists the subdomain on setTenant', () => {
    service.setTenant('  ACME  ');

    expect(service.tenant()).toBe('acme');
    expect(localStorage.getItem('fluy.tenant')).toBe('acme');
  });

  it('clears the tenant from both the signal and localStorage', () => {
    service.setTenant('acme');
    service.clearTenant();

    expect(service.tenant()).toBeNull();
    expect(localStorage.getItem('fluy.tenant')).toBeNull();
  });

  it('reads a previously stored tenant on construction (new browser tab / reload)', () => {
    localStorage.setItem('fluy.tenant', 'globex');

    // Instancia nueva a propósito: el singleton de TestBed ya se construyó en beforeEach,
    // antes de que existiera este valor en localStorage.
    const freshInstance = new TenantService();

    expect(freshInstance.tenant()).toBe('globex');
  });
});
