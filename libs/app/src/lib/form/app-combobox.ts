import { ChangeDetectionStrategy, Component, Directive, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { HlmComboboxImports } from '@nova/ui/combobox';
import { HlmSpinner } from '@nova/ui/spinner';
import { type AppOption, AppControlBase } from './control-base';

/**
 * Base común: opciones, búsqueda y modo de filtrado.
 * `filterMode="server"`: el componente no filtra; la página escucha
 * `(searchChange)` y pasa las opciones que devuelve el backend.
 */
@Directive()
abstract class AppComboboxBase<T> extends AppControlBase {
  readonly options = input.required<readonly AppOption<T>[]>();
  readonly placeholder = input('Buscar…');
  readonly emptyText = input('Sin coincidencias');
  readonly filterMode = input<'client' | 'server'>('client');
  readonly loading = input(false);
  readonly search = model('');

  protected readonly toLabel = (v: T): string => this.options().find((o) => Object.is(o.value, v))?.label ?? '';
  private readonly matchAll = () => true;
  private readonly matchLabel = (v: T, search: string, collator: Intl.Collator): boolean => {
    const label = this.toLabel(v);
    const q = search.trim();
    if (!q) return true;
    // Búsqueda sin acentos ni mayúsculas ("jose" encuentra "José").
    for (let i = 0; i + q.length <= label.length; i++) {
      if (collator.compare(label.slice(i, i + q.length), q) === 0) return true;
    }
    return false;
  };
  protected readonly filterFn = computed(() => (this.filterMode() === 'server' ? this.matchAll : this.matchLabel));
}

/** Selección única con búsqueda (reemplaza react-select). */
@Component({
  selector: 'app-combobox',
  imports: [HlmComboboxImports, HlmSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <hlm-combobox
      [value]="value()"
      [itemToString]="toLabel"
      [filter]="filterFn()"
      [disabled]="disabled() || readonly()"
      [search]="search()"
      (searchChange)="search.set($event)"
      (valueChange)="value.set($event ?? null)"
      (closed)="touch.emit()"
    >
      <hlm-combobox-input
        [inputId]="controlId()"
        [placeholder]="placeholder()"
        [forceInvalid]="showInvalid()"
        [showClear]="clearable() && value() !== null"
        triggerAriaLabel="Mostrar opciones"
        clearAriaLabel="Quitar selección"
      />
      <div *hlmComboboxPortal hlmComboboxContent>
        @if (loading()) {
          <div class="text-muted-foreground flex items-center gap-2 p-3 text-sm"><hlm-spinner class="size-4" /> Buscando…</div>
        } @else {
          <hlm-combobox-empty>{{ emptyText() }}</hlm-combobox-empty>
        }
        <div hlmComboboxList>
          @for (opt of options(); track $index) {
            <hlm-combobox-item [value]="opt.value" [disabled]="!!opt.disabled">
              <span class="flex flex-col">
                <span>{{ opt.label }}</span>
                @if (opt.description) {
                  <span class="text-muted-foreground text-xs">{{ opt.description }}</span>
                }
              </span>
            </hlm-combobox-item>
          }
        </div>
      </div>
    </hlm-combobox>
  `,
})
export class AppCombobox<T> extends AppComboboxBase<T> implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);
  readonly clearable = input(true);
}

/** Selección múltiple con chips. */
@Component({
  selector: 'app-combobox-multi',
  imports: [HlmComboboxImports, HlmSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <hlm-combobox-multiple
      [value]="value()"
      [itemToString]="toLabel"
      [filter]="filterFn()"
      [disabled]="disabled() || readonly()"
      [search]="search()"
      (searchChange)="search.set($event)"
      (valueChange)="value.set($event ?? [])"
      (closed)="touch.emit()"
    >
      <hlm-combobox-chips class="w-full" [forceInvalid]="showInvalid()">
        <ng-template hlmComboboxValues let-values>
          @for (v of values; track $index) {
            <hlm-combobox-chip [value]="v">{{ toLabel(v) }}</hlm-combobox-chip>
          }
        </ng-template>
        <input hlmComboboxChipInput [id]="controlId()" [placeholder]="value().length ? '' : placeholder()" />
      </hlm-combobox-chips>
      <div *hlmComboboxPortal hlmComboboxContent>
        @if (loading()) {
          <div class="text-muted-foreground flex items-center gap-2 p-3 text-sm"><hlm-spinner class="size-4" /> Buscando…</div>
        } @else {
          <hlm-combobox-empty>{{ emptyText() }}</hlm-combobox-empty>
        }
        <div hlmComboboxList>
          @for (opt of options(); track $index) {
            <hlm-combobox-item [value]="opt.value" [disabled]="!!opt.disabled">
              <span class="flex flex-col">
                <span>{{ opt.label }}</span>
                @if (opt.description) {
                  <span class="text-muted-foreground text-xs">{{ opt.description }}</span>
                }
              </span>
            </hlm-combobox-item>
          }
        </div>
      </div>
    </hlm-combobox-multiple>
  `,
})
export class AppComboboxMulti<T> extends AppComboboxBase<T> implements FormValueControl<T[]> {
  readonly value = model<T[]>([]);
}
