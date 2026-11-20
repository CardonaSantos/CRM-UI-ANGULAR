import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmTextarea } from '@nova/ui/textarea';
import { AppControlBase } from './control-base';

/** Texto largo. Con `maxLength` muestra el contador. */
@Component({
  selector: 'app-textarea',
  imports: [HlmTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full flex-col gap-1' },
  template: `
    <textarea
      hlmTextarea
      [id]="controlId()"
      [value]="value()"
      [rows]="rows()"
      [placeholder]="placeholder()"
      [attr.maxlength]="maxLength() ?? null"
      [attr.name]="name() || null"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [required]="required()"
      [forceInvalid]="showInvalid()"
      [attr.aria-invalid]="showInvalid() || null"
      (input)="value.set($any($event.target).value)"
      (blur)="touch.emit()"
    ></textarea>
    @if (maxLength()) {
      <span class="text-muted-foreground self-end text-xs tabular-nums">{{ count() }}</span>
    }
  `,
})
export class AppTextarea extends AppControlBase implements FormValueControl<string> {
  readonly value = model('');
  readonly rows = input(3);
  readonly placeholder = input('');
  readonly maxLength = input<number>();

  protected readonly count = computed(() => `${this.value().length}/${this.maxLength()}`);
}
