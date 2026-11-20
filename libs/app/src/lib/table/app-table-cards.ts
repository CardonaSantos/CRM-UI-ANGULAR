import { ChangeDetectionStrategy, Component, type TemplateRef, input, output } from '@angular/core';
import type { Row } from '@tanstack/angular-table';
import { AppCheckbox } from '../form/app-checkbox';
import type { AppCellContext } from './app-table-cell';
import { AppTableCell } from './app-table-cell';
import type { AppColumnMeta, AppTableFeatures } from './table-features';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Row<AppTableFeatures, any>;

/**
 * Vista móvil de `app-data-table` (guía §7.2): una card por fila. Las
 * columnas con `meta.priority = 1` forman el título, las de prioridad 3 se
 * ocultan y las acciones quedan en la esquina.
 */
@Component({
  selector: 'app-table-cards',
  imports: [AppTableCell, AppCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ul class="flex flex-col gap-3" [attr.aria-label]="ariaLabel()">
      @for (row of rows(); track row.id) {
        <li
          class="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs"
          [class.ring-2]="row.getIsSelected()"
          [class.ring-primary]="row.getIsSelected()"
        >
          <div class="flex items-start gap-3">
            @if (selectable()) {
              <app-checkbox ariaLabel="Seleccionar fila" [checked]="row.getIsSelected()" (checkedChange)="row.toggleSelected($event)" />
            }
            <div
              class="flex min-w-0 flex-1 flex-col gap-0.5 font-medium"
              [attr.role]="clickable() ? 'button' : null"
              [attr.tabindex]="clickable() ? 0 : null"
              (click)="clickable() && rowClick.emit(row.original)"
              (keydown.enter)="clickable() && rowClick.emit(row.original)"
            >
              @for (cell of row.getVisibleCells(); track cell.id) {
                @if (meta(cell.column).priority === 1) {
                  <app-table-cell [cell]="cell" [template]="templateFor()(cell.column.id)" />
                }
              }
            </div>
            @for (cell of row.getVisibleCells(); track cell.id) {
              @if (meta(cell.column).kind === 'actions') {
                <app-table-cell [cell]="cell" />
              }
            }
          </div>
          <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            @for (cell of row.getVisibleCells(); track cell.id) {
              @let m = meta(cell.column);
              @if (m.kind !== 'actions' && m.priority !== 1 && m.priority !== 3) {
                <div class="flex min-w-0 flex-col">
                  <dt class="text-muted-foreground text-xs">{{ header(cell.column) }}</dt>
                  <dd class="min-w-0 break-words">
                    <app-table-cell [cell]="cell" [template]="templateFor()(cell.column.id)" />
                  </dd>
                </div>
              }
            }
          </dl>
        </li>
      }
    </ul>
  `,
})
export class AppTableCards {
  readonly rows = input.required<readonly AnyRow[]>();
  readonly selectable = input(false);
  /** El título de la card abre el detalle. */
  readonly clickable = input(false);
  readonly ariaLabel = input<string>();
  readonly templateFor = input.required<(columnId: string) => TemplateRef<AppCellContext<unknown>> | undefined>();
  readonly rowClick = output<unknown>();

  protected meta(column: { columnDef: { meta?: unknown } }): AppColumnMeta {
    return (column.columnDef.meta ?? {}) as AppColumnMeta;
  }

  protected header(column: { id: string; columnDef: { header?: unknown } }): string {
    const h = column.columnDef.header;
    return typeof h === 'string' ? h : column.id;
  }
}
