import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, type Route, type UrlSegment } from '@angular/router';
import { AuthStore } from './auth.store';
import { Authorization } from './authorization';
import { authGuard, permissionGuard } from './guards';
import { CRM_PERMISSION as P } from './permissions';
import { RolUsuario } from './roles';
import { ROLE_PERMISSIONS } from './role-permissions';
import { CRM_TOKEN_STORAGE_KEY } from './session';
import { fakeJwt, validPayload } from './testing';

function login(rol: RolUsuario) {
  TestBed.inject(AuthStore).setSession(fakeJwt(validPayload({ rol })));
}

const runGuard = (guard: typeof authGuard, route: Route = {}, segments: UrlSegment[] = []) =>
  TestBed.runInInjectionContext(() => guard(route, segments));

describe('AuthStore', () => {
  beforeEach(() => localStorage.clear());

  it('restaura la sesión guardada', () => {
    localStorage.setItem(CRM_TOKEN_STORAGE_KEY, fakeJwt(validPayload()));
    const store = TestBed.inject(AuthStore);
    store.restore();
    expect(store.status()).toBe('authenticated');
    expect(store.role()).toBe(RolUsuario.TECNICO);
  });

  it('descarta un token inválido guardado', () => {
    localStorage.setItem(CRM_TOKEN_STORAGE_KEY, 'basura');
    const store = TestBed.inject(AuthStore);
    store.restore();
    expect(store.status()).toBe('anonymous');
    expect(localStorage.getItem(CRM_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('logout limpia la sesión', () => {
    login(RolUsuario.ADMIN);
    TestBed.inject(AuthStore).logout();
    expect(TestBed.inject(AuthStore).user()).toBeNull();
    expect(localStorage.getItem(CRM_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

describe('Authorization', () => {
  beforeEach(() => localStorage.clear());

  it('sin sesión no tiene permisos', () => {
    expect(TestBed.inject(Authorization).can(P.PERFIL_VER)).toBe(false);
  });

  it('SUPER_ADMIN tiene todos los permisos', () => {
    login(RolUsuario.SUPER_ADMIN);
    const authz = TestBed.inject(Authorization);
    expect(authz.canAll(Object.values(P))).toBe(true);
  });

  it('TECNICO no ve clientes.crear pero sí su dashboard', () => {
    login(RolUsuario.TECNICO);
    const authz = TestBed.inject(Authorization);
    expect(authz.can(P.CLIENTES_CREAR)).toBe(false);
    expect(authz.can(P.DASHBOARD_TECNICO_VER)).toBe(true);
    expect(authz.canAny([P.CLIENTES_CREAR, P.PERFIL_VER])).toBe(true);
  });

  it('todos los roles tienen una entrada en ROLE_PERMISSIONS', () => {
    for (const rol of Object.values(RolUsuario)) expect(ROLE_PERMISSIONS[rol]).toBeDefined();
  });
});

describe('guards', () => {
  beforeEach(() => localStorage.clear());

  it('authGuard manda a /login con redirect si no hay sesión', () => {
    TestBed.inject(AuthStore).restore();
    const result = runGuard(authGuard, {}, [{ path: 'clientes' } as UrlSegment]);
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login?redirect=%2Fclientes');
  });

  it('permissionGuard deja pasar con permiso y bloquea sin él', () => {
    login(RolUsuario.TECNICO);
    expect(runGuard(permissionGuard, { data: { permission: P.PERFIL_VER } })).toBe(true);
    const denied = runGuard(permissionGuard, { data: { permission: P.USUARIOS_VER } });
    expect(TestBed.inject(Router).serializeUrl(denied as UrlTree)).toBe('/forbidden');
  });
});
