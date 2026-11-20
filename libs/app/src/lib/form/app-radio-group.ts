import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmLabel } from '@nova/ui/label';
import { HlmRadioGroupImports } from '@nova/ui/radio-group';
import { type AppOption, AppControlBase } from './control-base';

/** Opciones excluyentes (pocas, visibles). Para muchas usa `app-select`. */
@Component({
  selector: 'app-radio-group',
  imports: [HlmRadioGroupImports, HlmLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <hlm-radio-group
      [value]="value()"
      [name]="name() || controlId()"
      [disabled]="disabled() || readonly()"
      [required]="required()"
      [class]="direction() === 'row' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'grid gap-3'"
      (valueChange)="value.set($event); touch.emit()"
    >
      @for (opt of options(); track $index) {
        <div class="flex items-start gap-3">
          <hlm-radio [value]="opt.value" [inputId]="controlId() + '-' + $index" [disabled]="!!opt.disabled">
            <hlm-radio-indicator indicator />
          </hlm-radio>
          <div class="flex flex-col gap-1">
            <label hlmLabel [for]="controlId() + '-' + $index" class="font-normal">{{ opt.label }}</label>
            @if (opt.description) {
              <p class="text-muted-foreground text-sm">{{ opt.description }}</p>
            }
          </div>
        </div>
      }
    </hlm-radio-group>
  `,
})
export class AppRadioGroup<T> extends AppControlBase implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);
  readonly options = input.required<readonly AppOption<T>[]>();
  readonly direction = input<'column' | 'row'>('column');
}
