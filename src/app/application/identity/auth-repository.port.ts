import { Observable } from 'rxjs';
import { LoginResult, UpdateProfileResult } from '../../domain/identity/identity.model';

/** Puerto (CODE.md §5.5): infrastructure/api lo implementa contra fluy-service. */
export abstract class AuthRepository {
  abstract login(email: string, password: string): Observable<LoginResult>;
  abstract setPassword(token: string, newPassword: string): Observable<LoginResult>;
  abstract updateProfile(fullName: string): Observable<UpdateProfileResult>;
  abstract changePassword(currentPassword: string, newPassword: string): Observable<void>;
}
