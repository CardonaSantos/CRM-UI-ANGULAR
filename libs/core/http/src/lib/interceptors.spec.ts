import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppToast } from '@nova/app';
import { AuthStore } from '@nova/core/auth';
import { provideCoreHttp } from './provide-core-http';
import { apiErrorMessage, safeEndpoint } from './interceptors';
import { skipErrorToast } from './http-context';

describe('helpers', () => {
  it('safeEndpoint deja solo el pathname', () => {
    expect(safeEndpoint('https://api.nova.gt:3000/clientes/5?token=secreto')).toBe('/clientes/5');
    expect(safeEndpoint('/api/pppoe/1/suspender?x=1')).toBe('/api/pppoe/1/suspender');
  });

  it('apiErrorMessage lee el mensaje de NestJS', () => {
    const err = (error: unknown, status = 400) => new HttpErrorResponse({ error, status });
    expect(apiErrorMessage(err({ message: 'Credenciales incorrectas' }))).toBe('Credenciales incorrectas');
    expect(apiErrorMessage(err({ message: ['a', 'b'] }))).toBe('a\nb');
    expect(apiErrorMessage(err(null, 0))).toBe('No se pudo conectar con el servidor');
    expect(apiErrorMessage(err({}), 'x')).toBe('x');
  });
});

describe('interceptores', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let toastError: ReturnType<typeof vi.fn>;
  let token: string | null;
  const logout = vi.fn();

  beforeEach(() => {
    token = 'abc';
    toastError = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideCoreHttp('/api/'),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        { provide: AppToast, useValue: { error: toastError } },
        { provide: AuthStore, useValue: { token: () => token, logout } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('agrega el Bearer solo a peticiones al backend', () => {
    http.get('/api/clientes').subscribe();
    http.get('https://maps.googleapis.com/x').subscribe();
    expect(ctrl.expectOne('/api/clientes').request.headers.get('Authorization')).toBe('Bearer abc');
    expect(ctrl.expectOne('https://maps.googleapis.com/x').request.headers.has('Authorization')).toBe(false);
  });

  it('muestra toast con el error y cierra sesión en 401', () => {
    http.get('/api/clientes').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/clientes').flush({ message: 'Token vencido' }, { status: 401, statusText: 'Unauthorized' });
    expect(toastError).toHaveBeenCalledWith('Token vencido');
    expect(logout).toHaveBeenCalled();
  });

  it('respeta SKIP_ERROR_TOAST', () => {
    http.get('/api/x', { context: skipErrorToast() }).subscribe({ error: () => undefined });
    ctrl.expectOne('/api/x').flush({}, { status: 500, statusText: 'Error' });
    expect(toastError).not.toHaveBeenCalled();
  });
});
