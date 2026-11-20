import { ChangeDetectionStrategy, Component, type Signal, computed, input } from '@angular/core';
import { HlmLabel } from '@nova/ui/label';

/** Lo mínimo que `app-field` lee de un campo de Signal Forms (`f.nombre`). */
export type AppFieldRef = () => {
  required: Signal<boolean>;
  touched: Signal<boolean>;
  invalid: Signal<boolean>;
  errors: Signal<readonly { message?: string }[]>;
};

/**
 * Envoltorio de un control: label, hint, marca de requerido y primer error.
 * Lee el estado del campo de Signal Forms; las páginas nunca muestran errores a mano.
 */
@Component({
  selector: 'app-field',
  imports: [HlmLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2', '[attr.data-invalid]': 'error() ? true : null' },
  template: `
    <label hlmLabel [for]="for()">
      {{ label() }}
      @if (state()?.required()) {
        <span class="text-danger" aria-hidden="true">*</span>
      }
    </label>
    <ng-content />
    @if (error(); as message) {
      <p class="text-danger text-sm" role="alert">{{ message }}</p>
    } @else if (hint()) {
      <p class="text-muted-foreground text-sm">{{ hint() }}</p>
    }
  `,
})
export class AppField {
  readonly label = input.required<string>();
  /** id del control interno (se pasa como `inputId` al control). */
  readonly for = input<string>();
  readonly hint = input<string>();
  readonly field = input<AppFieldRef>();

  protected readonly state = computed(() => this.field()?.());

  protected readonly error = computed(() => {
    const s = this.state();
    if (!s || !s.touched() || !s.invalid()) return null;
    return s.errors()[0]?.message ?? 'Valor inválido';
  });
}
