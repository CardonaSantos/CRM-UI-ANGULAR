import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { Authorization } from './authorization';
import type { CrmPermission } from './permissions';

/** Exige sesión. Sin sesión, redirige a /login conservando la URL pedida. */
export const authGuard: CanMatchFn = (_route, segments) => {
  if (inject(AuthStore).isAuthenticated()) return true;
  const redirect = '/' + segments.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], {
    queryParams: redirect !== '/' ? { redirect } : undefined,
  });
};

/** Solo para /login: si ya hay sesión, manda al inicio. */
export const anonymousGuard: CanMatchFn = () =>
  !inject(AuthStore).isAuthenticated() || inject(Router).createUrlTree(['/']);

/** Lee `data.permission` de la ruta. Si falta el permiso, va a /forbidden. */
export const permissionGuard: CanMatchFn = (route) => {
  const needed = route.data?.['permission'] as CrmPermission | undefined;
  return !needed || inject(Authorization).can(needed) || inject(Router).createUrlTree(['/forbidden']);
};
