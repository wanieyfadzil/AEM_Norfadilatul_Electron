
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  from,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';

import { OfflineAuthService } from './offline-auth.service';

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl =
    'http://test-demo.aemenersol.com/api/account/login';

  private readonly tokenKey = 'aem_auth_token';
  private readonly offlineSessionKey = 'aem_offline_session';

  constructor(
    private http: HttpClient,
    private offlineAuth: OfflineAuthService
  ) {}

  login(username: string, password: string): Observable<any> {
    const request: LoginRequest = { username, password };

    return this.http.post<any>(this.loginUrl, request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Fallback only when the API is unreachable or has a server error.
        const canFallback =
          error.status === 0 || error.status >= 500;

        if (!canFallback) {
          return throwError(() => error);
        }

        return from(
          this.offlineAuth.verifyOffline(username, password)
        ).pipe(
          switchMap(valid => {
            if (valid) {
              return of({ __offlineFallback: true });
            }

            return throwError(() => error);
          })
        );
      }),

      tap(response => {
        if (response?.__offlineFallback === true) {
          localStorage.setItem(this.offlineSessionKey, 'true');
          return;
        }

        localStorage.removeItem(this.offlineSessionKey);

        const token = this.extractToken(response);

        if (token) {
          localStorage.setItem(this.tokenKey, token);

          // Save only credentials that were accepted by the API.
          void this.offlineAuth
            .saveVerifiedUser(username, password)
            .catch(error => {
              console.error(
                'Unable to save offline login:',
                error
              );
            });
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() ||
      localStorage.getItem(this.offlineSessionKey) === 'true';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.offlineSessionKey);
  }

  private extractToken(response: any): string | null {
    if (typeof response === 'string') {
      return response;
    }

    if (response?.token) {
      return response.token;
    }

    if (response?.access_token) {
      return response.access_token;
    }

    return null;
  }
}