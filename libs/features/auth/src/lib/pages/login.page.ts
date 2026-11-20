import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthStore } from '@nova/core/auth';
import { AppButton, AppCard, AppCenteredScreen, AppField, AppInput, AppStack, AppToast } from '@nova/app';
import { injectLogin } from '../data-access/auth.queries';
import type { LoginDto } from '../data-access/auth.models';

@Component({
  selector: 'nv-login-page',
  imports: [FormField, AppCenteredScreen, AppCard, AppField, AppInput, AppButton, AppStack],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(AppToast);

  /** `?redirect=/ruta` que deja authGuard (withComponentInputBinding). */
  readonly redirect = input<string>();

  protected readonly login = injectLogin();
  protected readonly year = new Date().getFullYear();

  protected readonly model = signal<LoginDto>({ correo: '', contrasena: '' });
  protected readonly f = form(this.model, (p) => {
    required(p.correo, { message: 'Ingresa tu correo' });
    email(p.correo, { message: 'Correo no válido' });
    required(p.contrasena, { message: 'Ingresa tu contraseña' });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.f, async () => {
      const res = await this.login.mutateAsync(this.model()).catch(() => null); // el interceptor ya mostró el error
      if (!res) return undefined;

      if (!res.access_token || !this.auth.setSession(res.access_token)) {
        this.toast.error('El servidor no devolvió una sesión válida');
        return undefined;
      }

      this.toast.success('Inicio de sesión exitoso');
      await this.router.navigateByUrl(this.safeRedirect());
      return undefined;
    });
  }

  /** Solo rutas internas, para no permitir redirecciones abiertas. */
  private safeRedirect(): string {
    const r = this.redirect();
    return r && r.startsWith('/') && !r.startsWith('//') ? r : '/';
  }
}
