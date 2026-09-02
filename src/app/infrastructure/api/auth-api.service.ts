import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepository } from '../../application/identity/auth-repository.port';
import { API_BASE_URL } from '../../core/config/api.config';
import { LoginResult } from '../../domain/identity/identity.model';

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
}
