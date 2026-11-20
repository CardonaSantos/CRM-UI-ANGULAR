import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@nova/core/http';
import type { LoginDto, LoginResponse } from './auth.models';

/** HttpClient puro, sin estado. */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/auth`;

  login(dto: LoginDto) {
    return this.http.post<LoginResponse>(`${this.base}/login-user`, dto);
  }
}
