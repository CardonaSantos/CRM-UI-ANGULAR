import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmDatePicker, HlmDatePickerTrigger, HlmDateRangePicker, HlmMonthYearPicker } from '@nova/ui/date-picker';
import { formatDate, formatMonthYear } from '../core/format';
import { provideCalendarEs } from './calendar-i18n';
import { AppControlBase } from './control-base';

/**
 * El calendario vive en un overlay: si el foco se va hacia él (al abrirlo)
 * el campo todavía no cuenta como "tocado".
 */
function leftToOutside(event: FocusEvent, host: HTMLElement): boolean {
  const next = event.relatedTarget as HTMLElement | null;
  return !next || (!host.contains(next) && !next.closest('.cdk-overlay-container'));
}

export type AppDateRangeValue = [Date, Date] | null;

/** Fecha única (dd/MM/yyyy). Valor `Date | null`. */
@Component({
  selector: 'app-date-picker',
  imports: [HlmDatePicker, HlmDatePickerTrigger],
  providers: [provideCalendarEs()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full', '(focusout)': 'onFocusOut($event)' },
  template: `
    <hlm-date-picker
      [date]="value() ?? undefined"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [disabled]="disabled() || readonly()"
      [formatDate]="format"
      [autoCloseOnSelect]="true"
      captionLayout="dropdown"
      align="start"
      (dateChange)="value.set($event); touch.emit()"
    >
      <hlm-date-picker-trigger [buttonId]="controlId()" [forceInvalid]="showInvalid()" class="w-full font-normal">
        {{ placeholder() }}
      </hlm-date-picker-trigger>
    </hlm-date-picker>
  `,
})
export class AppDatePicker extends AppControlBase implements FormValueControl<Date | null> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected onFocusOut(event: FocusEvent): void {
    if (leftToOutside(event, this.host)) this.touch.emit();
  }

  readonly value = model<Date | null>(null);
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();
  readonly placeholder = input('Seleccionar fecha');
  protected readonly format = (d: Date) => formatDate(d);
}

/** Rango de fechas (reportes, filtros). Valor `[desde, hasta] | null`. */
@Component({
  selector: 'app-date-range',
  imports: [HlmDateRangePicker, HlmDatePickerTrigger],
  providers: [provideCalendarEs()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full', '(focusout)': 'onFocusOut($event)' },
  template: `
    <hlm-date-range-picker
      [date]="value() ?? undefined"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [disabled]="disabled() || readonly()"
      [formatDates]="format"
      [autoCloseOnEndSelection]="true"
      captionLayout="dropdown"
      align="start"
      (dateChange)="value.set($event); touch.emit()"
    >
      <hlm-date-picker-trigger [buttonId]="controlId()" [forceInvalid]="showInvalid()" class="w-full font-normal">
        {{ placeholder() }}
      </hlm-date-picker-trigger>
    </hlm-date-range-picker>
  `,
})
export class AppDateRange extends AppControlBase implements FormValueControl<AppDateRangeValue> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected onFocusOut(event: FocusEvent): void {
    if (leftToOutside(event, this.host)) this.touch.emit();
  }

  readonly value = model<AppDateRangeValue>(null);
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();
  readonly placeholder = input('Desde – hasta');
  protected readonly format = ([a, b]: [Date | null, Date | null]) =>
    `${a ? formatDate(a) : '…'} – ${b ? formatDate(b) : '…'}`;
}

/** Mes y año (facturación, metas). Valor: el día 1 del mes elegido. */
@Component({
  selector: 'app-month-picker',
  imports: [HlmMonthYearPicker, HlmDatePickerTrigger],
  providers: [provideCalendarEs()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full', '(focusout)': 'onFocusOut($event)' },
  template: `
    <hlm-month-year-picker
      [date]="value() ?? undefined"
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [disabled]="disabled() || readonly()"
      [formatDate]="format"
      [autoCloseOnSelect]="true"
      align="start"
      (dateChange)="value.set($event); touch.emit()"
    >
      <hlm-date-picker-trigger [buttonId]="controlId()" [forceInvalid]="showInvalid()" class="w-full font-normal">
        {{ placeholder() }}
      </hlm-date-picker-trigger>
    </hlm-month-year-picker>
  `,
})
export class AppMonthPicker extends AppControlBase implements FormValueControl<Date | null> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected onFocusOut(event: FocusEvent): void {
    if (leftToOutside(event, this.host)) this.touch.emit();
  }

  readonly value = model<Date | null>(null);
  readonly minDate = input<Date>();
  readonly maxDate = input<Date>();
  readonly placeholder = input('Seleccionar mes');
  protected readonly format = (d: Date) => formatMonthYear(d);
}
