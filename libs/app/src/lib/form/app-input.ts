import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmInput } from '@nova/ui/input';
import { AppControlBase } from './control-base';

export type AppInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

/**
 * Input de texto del kit. Implementa `FormValueControl<string>`, así que se
 * enlaza con `[formField]` igual que un input nativo.
 */
@Component({
  selector: 'app-input',
  imports: [HlmInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <input
      hlmInput
      [id]="controlId()"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder()"
      [attr.autocomplete]="autocomplete()"
      [attr.maxlength]="maxLength() ?? null"
      [attr.name]="name() || null"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [required]="required()"
      [forceInvalid]="showInvalid()"
      [attr.aria-invalid]="showInvalid() || null"
      (input)="value.set($any($event.target).value)"
      (blur)="touch.emit()"
    />
  `,
})
export class AppInput extends AppControlBase implements FormValueControl<string> {
  readonly value = model('');
  readonly type = input<AppInputType>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string>();
  readonly maxLength = input<number>();
}
