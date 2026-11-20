import { CRM_PERMISSION, ROLE_PERMISSIONS, RolUsuario } from '@nova/core/auth';
import { NAV, type NavItem, filterNav, firstNavPath } from './nav';
import { NAV_ICONS } from './nav-icons';

const canFor = (rol: RolUsuario) => (p: string) => (ROLE_PERMISSIONS[rol] as readonly string[]).includes(p);
const flat = (items: readonly NavItem[]): NavItem[] => items.flatMap((i) => [i, ...flat(i.children ?? [])]);
const paths = (items: readonly NavItem[]) => flat(items).flatMap((i) => (i.path ? [i.path] : []));

describe('NAV', () => {
  it('todos los iconos de NAV están registrados en NAV_ICONS', () => {
    const registered = new Set(Object.keys(NAV_ICONS));
    for (const item of flat(NAV)) if (item.icon) expect(registered).toContain(item.icon);
  });

  it('todos los permisos de NAV existen en CRM_PERMISSION', () => {
    const known = new Set<string>(Object.values(CRM_PERMISSION));
    for (const item of flat(NAV)) if (item.permission) expect(known).toContain(item.permission);
  });

  it('las rutas son únicas, en minúsculas y kebab-case', () => {
    const all = paths(NAV);
    expect(new Set(all).size).toBe(all.length);
    for (const p of all) expect(p).toMatch(/^\/[a-z0-9_/-]+$/);
  });
});

describe('filterNav', () => {
  it('TECNICO ve su inicio y no ve usuarios ni el inicio general', () => {
    const visible = paths(filterNav(NAV, canFor(RolUsuario.TECNICO)));
    expect(visible).toContain('/tecnico/inicio');
    expect(visible).toContain('/tickets/tecnico');
    expect(visible).not.toContain('/usuarios');
    expect(visible).not.toContain('/inicio');
    expect(firstNavPath(filterNav(NAV, canFor(RolUsuario.TECNICO)))).toBe('/tecnico/inicio');
  });

  it('oculta grupos sin hijos visibles', () => {
    const tienda = filterNav(NAV, canFor(RolUsuario.TIENDA));
    expect(tienda.find((i) => i.label === 'PPPoE')).toBeUndefined();
    expect(tienda.find((i) => i.label === 'Clientes')?.children?.map((c) => c.path)).toEqual(['/clientes']);
  });

  it('SUPER_ADMIN ve un solo "Inicio"', () => {
    const top = filterNav(NAV, canFor(RolUsuario.SUPER_ADMIN)).filter((i) => i.label === 'Inicio');
    expect(top.map((i) => i.path)).toEqual(['/inicio']);
  });

  it('sin permisos no queda nada', () => {
    expect(filterNav(NAV, () => false)).toEqual([]);
  });
});
