import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Pantalla completa con el contenido centrado (login, errores fuera del shell). */
@Component({
  selector: 'app-centered-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bg-muted flex min-h-dvh w-full items-center justify-center p-4' },
  template: `<ng-content />`,
})
export class AppCenteredScreen {}
