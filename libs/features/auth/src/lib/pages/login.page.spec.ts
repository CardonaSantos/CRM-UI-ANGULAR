import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query';
import { AppToast } from '@nova/app';
import { AuthStore } from '@nova/core/auth';
import { API_BASE_URL } from '@nova/core/http';
import { LoginPage } from './login.page';

// JWT sin firma con un usuario válido (lo decodifica AuthStore).
const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '');
const TOKEN = `${b64({ alg: 'none' })}.${b64({
  sub: 1,
  nombre: 'Ana',
  correo: 'ana@nova.gt',
  rol: 'ADMIN',
  activo: true,
  empresaId: 1,
  exp: Math.floor(Date.now() / 1000) + 3600,
})}.x`;

describe('LoginPage', () => {
  const toast = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', children: [] }]),
        provideTanStackQuery(() => new QueryClient()),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: AppToast, useValue: toast },
      ],
    });
  });

  async function fillAndSubmit(correo: string, contrasena: string) {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const [email, password] = Array.from(el.querySelectorAll('input'));
    email.value = correo;
    email.dispatchEvent(new Event('input'));
    password.value = contrasena;
    password.dispatchEvent(new Event('input'));
    // Sin whenStable: el submit queda pendiente hasta que responda el backend.
    el.querySelector('form')?.dispatchEvent(new Event('submit'));
    return fixture;
  }

  it('no llama al backend si el formulario es inválido', async () => {
    const fixture = await fillAndSubmit('no-es-correo', '');
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).expectNone('/api/auth/login-user');
    expect(fixture.nativeElement.textContent).toContain('Correo no válido');
  });

  it('inicia sesión, normaliza el correo y navega', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    await fillAndSubmit('  Ana@Nova.GT ', 'secreto');

    const ctrl = TestBed.inject(HttpTestingController);
    const req = await vi.waitFor(() => ctrl.expectOne('/api/auth/login-user'));
    expect(req.request.body).toEqual({ correo: 'ana@nova.gt', contrasena: 'secreto' });
    req.flush({ access_token: TOKEN });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));

    expect(TestBed.inject(AuthStore).user()?.nombre).toBe('Ana');
    expect(toast.success).toHaveBeenCalled();
  });
});
