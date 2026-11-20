import { Directive, computed, input, output } from '@angular/core';

let nextId = 0;

/** Opción de select, combobox y radio group. */
export interface AppOption<T> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Entradas opcionales del contrato de Signal Forms (`FormUiControl`) que
 * comparten todos los controles del kit. `[formField]` las enlaza solo.
 */
@Directive()
export abstract class AppControlBase {
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly name = input('');
  /** id del elemento enfocable; enlázalo con `app-field [for]`. */
  readonly inputId = input<string>();
  readonly touch = output<void>();

  private readonly autoId = `app-control-${++nextId}`;
  protected readonly controlId = computed(() => this.inputId() ?? this.autoId);
  /** El error se marca solo cuando el usuario ya pasó por el campo. */
  protected readonly showInvalid = computed(() => this.invalid() && this.touched());
}
