import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthRepository } from '../../application/identity/auth-repository.port';
import { LoginResult } from '../../domain/identity/identity.model';
import { AuthService } from './auth.service';

const SAMPLE_SESSION: LoginResult = {
  token: 'sample.jwt.token',
  userId: 'a212a643-6d0b-457c-a700-7e0c4fcc11ed',
  email: 'admin@wayne.fluy.com',
  fullName: 'Administrador Wayne',
  roles: ['TenantAdmin']
};

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jasmine.SpyObj<AuthRepository>;

  beforeEach(() => {
    localStorage.clear();
    authRepository = jasmine.createSpyObj<AuthRepository>('AuthRepository', ['login', 'setPassword']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthRepository, useValue: authRepository }]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when there is no stored session', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token()).toBeNull();
  });

  it('stores the session and exposes it as authenticated after a successful login', () => {
    authRepository.login.and.returnValue(of(SAMPLE_SESSION));

    service.login('admin@wayne.fluy.com', 'Wayne.Segura123!').subscribe();

    expect(authRepository.login).toHaveBeenCalledWith('admin@wayne.fluy.com', 'Wayne.Segura123!');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.token()).toBe(SAMPLE_SESSION.token);
    expect(service.currentUser()).toEqual(SAMPLE_SESSION);
    expect(JSON.parse(localStorage.getItem('fluy.session')!)).toEqual(SAMPLE_SESSION);
  });

  it('clears the session on logout', () => {
    authRepository.login.and.returnValue(of(SAMPLE_SESSION));
    service.login('admin@wayne.fluy.com', 'Wayne.Segura123!').subscribe();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('fluy.session')).toBeNull();
  });

  it('starts a new session after redeeming a set-password token', () => {
    authRepository.setPassword.and.returnValue(of(SAMPLE_SESSION));

    service.setPassword('raw-token', 'NuevaClave123!').subscribe();

    expect(authRepository.setPassword).toHaveBeenCalledWith('raw-token', 'NuevaClave123!');
    expect(service.isAuthenticated()).toBeTrue();
  });
});
