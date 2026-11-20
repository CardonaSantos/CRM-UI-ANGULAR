import { HttpErrorResponse, type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@nova/core/auth';
import { AppToast } from '@nova/app';
import { catchError, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { SKIP_ERROR_TOAST } from './http-context';

const isApiRequest = (url: string, base: string) => url.startsWith(base);

/** Agrega `Authorization: Bearer` a las peticiones al backend. Si responde 401, cierra la sesión. */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const base = inject(API_BASE_URL);

  if (!isApiRequest(req.url, base)) return next(req);

  const token = auth.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { redirect: router.url } });
      }
      return throwError(() => error);
    }),
  );
};

/** Mensaje legible de un error de NestJS (`{ statusCode, message, error }`). */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'No se pudo conectar con el servidor';
  const message: unknown = error.error?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

/** Muestra un toast con el mensaje del backend. Se desactiva con `SKIP_ERROR_TOAST`. */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(AppToast);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!req.context.get(SKIP_ERROR_TOAST)) toast.error(apiErrorMessage(error));
      return throwError(() => error);
    }),
  );
};

/**
 * Logging seguro (mismo criterio que `axiosClientCrm.ts` de producción):
 * solo método, endpoint relativo sin query, status y duración.
 * Nunca registra headers, body ni tokens. Solo se activa en desarrollo.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDevMode()) return next(req);

  const start = performance.now();
  const endpoint = safeEndpoint(req.url);
  const elapsed = () => `(${Math.round(performance.now() - start)} ms)`;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) console.debug(`✅ [CRM] ${event.status} ${req.method} ${endpoint} ${elapsed()}`);
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse && error.status ? `HTTP ${error.status}` : 'Error de red';
        console.debug(`⛔ [CRM] ${status} ${req.method} ${endpoint} ${elapsed()}`);
      },
    }),
  );
};

/** Solo el pathname: nunca protocolo, dominio, puerto ni query params. */
export function safeEndpoint(url: string): string {
  try {
    return new URL(url, 'http://local.invalid').pathname || '/';
  } catch {
    return url.split('?')[0] || '[endpoint desconocido]';
  }
}
