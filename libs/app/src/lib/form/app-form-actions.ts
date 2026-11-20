import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppButton } from '../primitives/app-button';

/**
 * Botones "Guardar" y "Cancelar" de un formulario (guía §9). Va dentro del
 * `<form>`: el botón principal es `type="submit"`. En móvil ocupan todo el
 * ancho y el principal queda arriba (más fácil de alcanzar con el pulgar).
 */
@Component({
  selector: 'app-form-actions',
  imports: [AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end',
    '[class.sm:justify-between]': 'hasExtra()',
  },
  template: `
    <div class="flex flex-col gap-2 empty:hidden sm:flex-row"><ng-content /></div>
    <div class="flex flex-col-reverse gap-2 sm:flex-row">
      @if (cancelLabel()) {
        <app-button variant="outline" [disabled]="loading()" (click)="cancelled.emit()">{{ cancelLabel() }}</app-button>
      }
      <app-button type="submit" [variant]="tone() === 'danger' ? 'danger' : 'primary'" [loading]="loading()" [disabled]="disabled()">
        {{ submitLabel() }}
      </app-button>
    </div>
  `,
})
export class AppFormActions {
  readonly submitLabel = input('Guardar');
  /** Vacío para ocultar "Cancelar". */
  readonly cancelLabel = input('Cancelar');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly tone = input<'primary' | 'danger'>('primary');
  /** Hay acciones extra a la izquierda (contenido proyectado). */
  readonly hasExtra = input(false);
  readonly cancelled = output<void>();
}
