import { inject } from '@angular/core';
import type { Route } from '@angular/router';
import { Authorization, CRM_PERMISSION as P, anonymousGuard, authGuard, permissionGuard } from '@nova/core/auth';
import { ForbiddenPage, NAV, PendingPage, ShellLayout, WelcomePage, filterNav, firstNavPath } from '@nova/core/layout';

/** "/" lleva a la primera sección que el rol puede ver (técnicos → su inicio). */
const homeRedirect = () => firstNavPath(filterNav(NAV, inject(Authorization).can)) ?? '/perfil';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canMatch: [anonymousGuard],
    loadComponent: () => import('@nova/features/auth').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: ShellLayout,
    canMatch: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: homeRedirect },
      {
        path: 'inicio',
        canMatch: [permissionGuard],
        data: { permission: P.DASHBOARD_VER },
        component: WelcomePage,
      },
      {
        path: 'tecnico/inicio',
        canMatch: [permissionGuard],
        data: { permission: P.DASHBOARD_TECNICO_VER },
        component: WelcomePage,
      },
      {
        path: '_design',
        canMatch: [permissionGuard],
        data: { permission: P.PRUEBAS_VER },
        loadComponent: () => import('@nova/features/design').then((m) => m.DesignCatalogPage),
      },
      { path: 'forbidden', component: ForbiddenPage },
      // Rutas de NAV todavía no migradas (Fases 1–7).
      { path: '**', component: PendingPage },
    ],
  },
  // Sin sesión, cualquier otra URL termina en authGuard → /login.
];
