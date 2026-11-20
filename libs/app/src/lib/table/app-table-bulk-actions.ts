import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatNumber } from '../core/format';
import { AppButton } from '../primitives/app-button';

/** Acción sobre las filas seleccionadas. Recibe los registros cargados y sus ids. */
export interface AppBulkAction<T> {
  label: string;
  icon?: string;
  tone?: 'default' | 'danger';
  hidden?: boolean;
  run: (rows: T[], ids: string[]) => void;
}

export interface AppBulkActionView {
  label: string;
  icon?: string;
  tone?: 'default' | 'danger';
  run: () => void;
}

/** Barra que aparece al seleccionar filas. */
@Component({
  selector: 'app-table-bulk-actions',
  imports: [AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bg-table-selected flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm',
    role: 'region',
    'aria-label': 'Acciones sobre la selección',
  },
  template: `
    <span class="me-auto font-medium tabular-nums">{{ label() }}</span>
    @for (action of actions(); track action.label) {
      <app-button
        size="sm"
        [variant]="action.tone === 'danger' ? 'danger' : 'outline'"
        [leftIcon]="action.icon"
        (click)="action.run()"
      >
        {{ action.label }}
      </app-button>
    }
    <app-button size="sm" variant="ghost" leftIcon="lucideX" (click)="clear.emit()">Limpiar</app-button>
  `,
})
export class AppTableBulkActions {
  readonly count = input.required<number>();
  readonly actions = input<readonly AppBulkActionView[]>([]);
  readonly clear = output<void>();

  protected readonly label = computed(() => {
    const n = this.count();
    return n === 1 ? '1 seleccionado' : `${formatNumber(n)} seleccionados`;
  });
}
