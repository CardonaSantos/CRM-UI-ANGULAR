import { ChangeDetectionStrategy, Component, computed, contentChildren, input, model, output } from '@angular/core';
import type { PaginationState, RowData } from '@tanstack/angular-table';
import type { AppQueryLike } from '../feedback/app-data-state';
import { AppDataTable } from '../table/app-data-table';
import { AppCellDef } from '../table/app-table-cell';
import type { AppColumnDef } from '../table/table-features';
import { type AppBreadcrumb, AppPage, type AppPageAction } from './app-page';

/**
 * Página CRUD estándar (catálogos de la Fase 2): cabecera con "Nuevo …",
 * búsqueda y tabla. El formulario de alta/edición (normalmente un
 * `app-dialog`) va como contenido. Celdas personalizadas con `appCell`.
 */
@Component({
  selector: 'app-crud-page',
  imports: [AppPage, AppDataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.title]': 'null', class: 'contents' },
  template: `
    <app-page [title]="title()" [description]="description()" [breadcrumbs]="breadcrumbs()" [actions]="pageActions()">
      <app-data-table
        [data]="data()"
        [columns]="columns()"
        [query]="query()"
        [getRowId]="getRowId()"
        [searchable]="true"
        [searchPlaceholder]="searchPlaceholder()"
        [searchMode]="serverSide() ? 'server' : 'client'"
        [(search)]="search"
        [paginationMode]="serverSide() ? 'server' : 'client'"
        [(pagination)]="pagination"
        [totalRows]="totalRows()"
        [tableId]="tableId()"
        [exportable]="exportable()"
        [exportFileName]="tableId() ?? 'exportacion'"
        [emptyTitle]="emptyTitle()"
        [emptyDescription]="emptyDescription()"
        [extraCells]="cells()"
        [ariaLabel]="title()"
        (rowClick)="rowClick.emit($any($event))"
      />
      <ng-content />
    </app-page>
  `,
})
export class AppCrudPage<T extends RowData> {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly breadcrumbs = input<readonly AppBreadcrumb[]>([]);

  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly AppColumnDef<T>[]>();
  readonly query = input<AppQueryLike>();
  readonly getRowId = input<(row: T, index: number) => string>();
  /** Búsqueda y paginación en el backend (listas grandes). */
  readonly serverSide = input(false);
  readonly totalRows = input<number>();
  readonly search = model('');
  readonly pagination = model<PaginationState>({ pageIndex: 0, pageSize: 10 });
  readonly searchPlaceholder = input('Buscar…');
  readonly tableId = input<string>();
  readonly exportable = input(true);
  readonly emptyTitle = input('Aún no hay registros');
  readonly emptyDescription = input<string>();

  /** Texto del botón principal; vacío o `canCreate=false` lo oculta. */
  readonly createLabel = input('Nuevo');
  readonly canCreate = input(true);
  readonly actions = input<readonly AppPageAction[]>([]);
  readonly create = output<void>();
  readonly rowClick = output<T>();

  protected readonly cells = contentChildren(AppCellDef);
  protected readonly pageActions = computed<readonly AppPageAction[]>(() => [
    {
      label: this.createLabel(),
      icon: 'lucidePlus',
      primary: true,
      hidden: !this.canCreate() || !this.createLabel(),
      run: () => this.create.emit(),
    },
    ...this.actions(),
  ]);
}
