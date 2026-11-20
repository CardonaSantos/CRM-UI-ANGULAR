import { Injectable, computed, inject } from '@angular/core';
import { AuthStore } from './auth.store';
import type { CrmPermission } from './permissions';
import { ROLE_PERMISSIONS } from './role-permissions';

/**
 * Permisos del usuario actual (reemplaza a `useAuthorization` / `<Can>`).
 * El backend sigue siendo la autoridad: aquí solo se oculta UI.
 */
@Injectable({ providedIn: 'root' })
export class Authorization {
  private readonly auth = inject(AuthStore);

  private readonly perms = computed(() => {
    const role = this.auth.role();
    return new Set<CrmPermission>(role ? ROLE_PERMISSIONS[role] : []);
  });

  readonly can = (p: CrmPermission): boolean => this.perms().has(p);
  readonly canAny = (ps: readonly CrmPermission[]): boolean => ps.some(this.can);
  readonly canAll = (ps: readonly CrmPermission[]): boolean => ps.every(this.can);
}
