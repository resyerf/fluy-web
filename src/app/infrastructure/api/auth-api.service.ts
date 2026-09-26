import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepository } from '../../application/identity/auth-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { LoginResult, UpdateProfileResult } from '../../domain/identity/identity.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/v1/auth`;

  override login(email: string, password: string): Observable<LoginResult> {
    return this.http.post<LoginResult>(`${this.baseUrl}/login`, { email, password });
  }

  override setPassword(token: string, newPassword: string): Observable<LoginResult> {
    return this.http.post<LoginResult>(`${this.baseUrl}/set-password`, { token, newPassword });
  }

  override updateProfile(fullName: string): Observable<UpdateProfileResult> {
    return this.http.patch<UpdateProfileResult>(`${this.baseUrl}/me`, { fullName });
  }

  override changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, { currentPassword, newPassword });
  }
}
