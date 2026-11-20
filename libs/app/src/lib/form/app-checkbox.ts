import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { HlmCheckbox } from '@nova/ui/checkbox';
import { HlmLabel } from '@nova/ui/label';
import { HlmSwitch } from '@nova/ui/switch';
import { AppControlBase } from './control-base';

/**
 * Casilla con su etiqueta al lado. Implementa `FormCheckboxControl`:
 * `<app-checkbox label="Activo" [formField]="f.activo" />`.
 */
@Component({
  selector: 'app-checkbox',
  imports: [HlmCheckbox, HlmLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-start gap-3' },
  template: `
    <hlm-checkbox
      [inputId]="controlId()"
      [checked]="checked()"
      [disabled]="disabled() || readonly()"
      [required]="required()"
      [forceInvalid]="showInvalid()"
      [aria-label]="label() ? null : (ariaLabel() ?? null)"
      (checkedChange)="checked.set($event); touch.emit()"
    />
    @if (label()) {
      <div class="flex flex-col gap-1">
        <label hlmLabel [for]="controlId()" class="font-normal">{{ label() }}</label>
        @if (description()) {
          <p class="text-muted-foreground text-sm">{{ description() }}</p>
        }
      </div>
    }
  `,
})
export class AppCheckbox extends AppControlBase implements FormCheckboxControl {
  readonly checked = model(false);
  readonly label = input<string>();
  readonly description = input<string>();
  /** Solo si no hay `label` (p. ej. selección de filas). */
  readonly ariaLabel = input<string>();
}

/** Interruptor on/off (preferencias, activar módulos). Mismo contrato que `app-checkbox`. */
@Component({
  selector: 'app-switch',
  imports: [HlmSwitch, HlmLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-between gap-4' },
  template: `
    @if (label()) {
      <div class="flex flex-col gap-1">
        <label hlmLabel [for]="controlId()" class="font-normal">{{ label() }}</label>
        @if (description()) {
          <p class="text-muted-foreground text-sm">{{ description() }}</p>
        }
      </div>
    }
    <hlm-switch
      [inputId]="controlId()"
      [checked]="checked()"
      [disabled]="disabled() || readonly()"
      [forceInvalid]="showInvalid()"
      [aria-label]="label() ? null : (ariaLabel() ?? null)"
      (checkedChange)="checked.set($event); touch.emit()"
    />
  `,
})
export class AppSwitch extends AppControlBase implements FormCheckboxControl {
  readonly checked = model(false);
  readonly label = input<string>();
  readonly description = input<string>();
  readonly ariaLabel = input<string>();
}
