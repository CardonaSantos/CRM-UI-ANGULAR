import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@nova/core/auth';
import { AppButton, AppCard, AppPage } from '@nova/app';

/** Sin permiso para la ruta pedida (lo redirige `permissionGuard`). */
@Component({
  selector: 'nv-forbidden-page',
  imports: [AppPage, AppCard, AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Acceso restringido">
      <app-card description="Tu rol no tiene permiso para ver esta sección. Si crees que es un error, contacta a un administrador.">
        <app-button variant="outline" (click)="router.navigate(['/'])">Ir al inicio</app-button>
      </app-card>
    </app-page>
  `,
})
export class ForbiddenPage {
  protected readonly router = inject(Router);
}

/** Ruta del menú que todavía no se migró desde React. */
@Component({
  selector: 'nv-pending-page',
  imports: [AppPage, AppCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Vista pendiente de migración">
      <app-card description="Esta sección todavía vive en la UI React. Se migra en las próximas fases (guía §14)." />
    </app-page>
  `,
})
export class PendingPage {}

/** Inicio provisional de la Fase 0 (el dashboard real llega en fases siguientes). */
@Component({
  selector: 'nv-welcome-page',
  imports: [AppPage, AppCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page [title]="'Hola, ' + (auth.user()?.nombre ?? '')" description="NOVA CRM — nueva interfaz en Angular.">
      <app-card
        title="Fase 0 lista"
        description="El menú lateral muestra solo los módulos que permite tu rol. Las vistas se irán migrando por fases."
      />
    </app-page>
  `,
})
export class WelcomePage {
  protected readonly auth = inject(AuthStore);
}
