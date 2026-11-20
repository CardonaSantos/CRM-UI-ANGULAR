import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, linkedSignal, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { HlmInputGroupImports } from '@nova/ui/input-group';
import { AppControlBase } from './control-base';

/**
 * Búsqueda con debounce. `[(value)]` se actualiza al escribir (para mostrar
 * el texto) y `(searched)` se emite cuando el usuario deja de escribir.
 */
@Component({
  selector: 'app-search-input',
  imports: [HlmInputGroupImports, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div hlmInputGroup>
      <div hlmInputGroupAddon><ng-icon name="lucideSearch" /></div>
      <input
        hlmInputGroupInput
        type="search"
        [id]="controlId()"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel()"
        [disabled]="disabled()"
        (input)="onInput($any($event.target).value)"
        (keydown.enter)="flush()"
        (blur)="touch.emit()"
      />
      @if (value()) {
        <div hlmInputGroupAddon align="inline-end">
          <button hlmInputGroupButton size="icon-xs" variant="ghost" type="button" aria-label="Limpiar búsqueda" (click)="clear()">
            <ng-icon name="lucideX" />
          </button>
        </div>
      }
    </div>
  `,
})
export class AppSearchInput extends AppControlBase implements FormValueControl<string> {
  readonly value = model('');
  readonly placeholder = input('Buscar…');
  readonly ariaLabel = input('Buscar');
  readonly debounce = input(350);
  /** Texto final, después del debounce. */
  readonly searched = output<string>();

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onInput(text: string): void {
    this.value.set(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.searched.emit(text.trim()), this.debounce());
  }

  protected flush(): void {
    clearTimeout(this.timer);
    this.searched.emit(this.value().trim());
  }

  protected clear(): void {
    this.value.set('');
    this.flush();
  }
}

const money = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Monto en quetzales. Valor `number | null`; se muestra con separadores al salir. */
@Component({
  selector: 'app-money-input',
  imports: [HlmInputGroupImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div hlmInputGroup [attr.data-invalid]="showInvalid() || null">
      <div hlmInputGroupAddon><span hlmInputGroupText>Q</span></div>
      <input
        hlmInputGroupInput
        inputmode="decimal"
        class="text-end tabular-nums"
        [id]="controlId()"
        [value]="text()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [attr.aria-invalid]="showInvalid() || null"
        (focus)="text.set(value() === null ? '' : String(value()))"
        (input)="onInput($any($event.target).value)"
        (blur)="text.set(display(value())); touch.emit()"
      />
    </div>
  `,
})
export class AppMoneyInput extends AppControlBase implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  readonly placeholder = input('0.00');
  protected readonly String = String;

  protected readonly text = linkedSignal(() => this.display(this.value()));

  protected display(v: number | null): string {
    return v === null ? '' : money.format(v);
  }

  protected onInput(raw: string): void {
    const clean = raw.replace(/[^\d.]/g, '');
    this.text.set(clean);
    const n = clean === '' ? null : Number(clean);
    this.value.set(n === null || Number.isNaN(n) ? null : Math.round(n * 100) / 100);
  }
}

/** Teléfono de Guatemala: 8 dígitos, se muestra "5555-1234". Valor solo dígitos. */
@Component({
  selector: 'app-phone-input',
  imports: [HlmInputGroupImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div hlmInputGroup [attr.data-invalid]="showInvalid() || null">
      <div hlmInputGroupAddon><span hlmInputGroupText>{{ prefix() }}</span></div>
      <input
        hlmInputGroupInput
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        [id]="controlId()"
        [value]="formatted(value())"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [attr.aria-invalid]="showInvalid() || null"
        (input)="onInput($event)"
        (blur)="touch.emit()"
      />
    </div>
  `,
})
export class AppPhoneInput extends AppControlBase implements FormValueControl<string> {
  readonly value = model('');
  readonly prefix = input('+502');
  readonly placeholder = input('5555-1234');
  readonly maxDigits = input(8);

  protected formatted(digits: string): string {
    return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, this.maxDigits());
    this.value.set(digits);
    el.value = this.formatted(digits);
  }
}
