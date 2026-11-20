import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmSelectImports } from '@nova/ui/select';
import { type AppOption, AppControlBase } from './control-base';

/**
 * Lista desplegable sin búsqueda (pocas opciones). Para catálogos largos o
 * búsqueda en servidor usa `app-combobox`.
 */
@Component({
  selector: 'app-select',
  imports: [HlmSelectImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <hlm-select
      [value]="value()"
      [itemToString]="toLabel"
      [disabled]="disabled() || readonly()"
      (valueChange)="value.set($event ?? null)"
      (closed)="touch.emit()"
    >
      <hlm-select-trigger [buttonId]="controlId()" [forceInvalid]="showInvalid()" class="w-full">
        <hlm-select-value [placeholder]="placeholder()" />
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        @for (opt of options(); track $index) {
          <hlm-select-item [value]="opt.value" [disabled]="!!opt.disabled">{{ opt.label }}</hlm-select-item>
        }
      </hlm-select-content>
    </hlm-select>
  `,
})
export class AppSelect<T> extends AppControlBase implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);
  readonly options = input.required<readonly AppOption<T>[]>();
  readonly placeholder = input('Seleccionar…');

  protected readonly toLabel = (v: T): string => this.options().find((o) => Object.is(o.value, v))?.label ?? '';
}
