import { Injectable, computed, signal } from '@angular/core';
import { CRM_TOKEN_STORAGE_KEY, decodeSession, type SessionUser } from './session';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

/** Estado de sesión (reemplaza al store Zustand `useStoreCrm`). */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<SessionUser | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _status = signal<AuthStatus>('loading');

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly status = this._status.asReadonly();
  readonly role = computed(() => this._user()?.rol ?? null);
  readonly isAuthenticated = computed(() => this._status() === 'authenticated');

  /** Restaura la sesión guardada. Se ejecuta en `provideAppInitializer`. */
  restore(): void {
    const token = readToken();
    if (!token || !this.setSession(token)) this.clear();
  }

  /** Guarda el token si es válido. Devuelve false si el backend mandó algo inválido. */
  setSession(token: string): boolean {
    const user = decodeSession(token);
    if (!user) {
      this.clear();
      return false;
    }
    writeToken(token);
    this._token.set(token);
    this._user.set(user);
    this._status.set('authenticated');
    return true;
  }

  logout(): void {
    this.clear();
  }

  private clear(): void {
    writeToken(null);
    this._token.set(null);
    this._user.set(null);
    this._status.set('anonymous');
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(CRM_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CRM_TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(CRM_TOKEN_STORAGE_KEY);
  } catch {
    // Storage no disponible: la sesión dura lo que dure la pestaña.
  }
}
