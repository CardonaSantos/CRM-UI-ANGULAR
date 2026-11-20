import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query';
import { AuthStore } from '@nova/core/auth';
import { API_BASE_URL } from '@nova/core/http';
import { appRoutes } from './app.routes';

const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '');
const tokenFor = (rol: string) =>
  `${b64({ alg: 'none' })}.${b64({
    sub: 1,
    nombre: 'Prueba',
    correo: 'p@nova.gt',
    rol,
    activo: true,
    empresaId: 1,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.x`;

describe('appRoutes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTanStackQuery(() => new QueryClient()),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
  });

  /** Navega como `rol` (o sin sesión) y devuelve la URL final. */
  async function landOn(url: string, rol?: string): Promise<string> {
    const auth = TestBed.inject(AuthStore);
    if (rol) auth.setSession(tokenFor(rol));
    else auth.restore();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  it('sin sesión manda al login conservando el destino', async () => {
    expect(await landOn('/clientes')).toBe('/login?redirect=%2Fclientes');
  });

  it.each([
    ['ADMIN', '/inicio'],
    ['TECNICO', '/tecnico/inicio'],
  ])('"/" lleva a %s a %s', async (rol, expected) => {
    expect(await landOn('/', rol)).toBe(expected);
  });

  it('una ruta sin permiso va a /forbidden', async () => {
    expect(await landOn('/_design', 'TECNICO')).toBe('/forbidden');
  });

  it('con sesión, /login vuelve al inicio', async () => {
    expect(await landOn('/login', 'ADMIN')).toBe('/inicio');
  });
});
