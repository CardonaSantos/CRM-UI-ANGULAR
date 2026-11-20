import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, inject, input, linkedSignal, model, output, signal, untracked } from '@angular/core';
import {
  type ColumnVisibilityState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type RowData,
  type Updater,
  FlexRender,
  functionalUpdate,
  injectTable,
} from '@tanstack/angular-table';
import { NgIcon } from '@ng-icons/core';
import { Breakpoints } from '../core/breakpoints';
import { AppAlert } from '../feedback/app-alert';
import { type AppQueryLike, errorMessage } from '../feedback/app-data-state';
import { AppEmptyState } from '../feedback/app-empty-state';
import { AppSkeleton } from '../feedback/app-loader';
import { AppToast } from '../feedback/app-toast';
import { AppCheckbox } from '../form/app-checkbox';
import { AppSearchInput } from '../form/app-special-inputs';
import { AppButton } from '../primitives/app-button';
import { type AppBulkAction, AppTableBulkActions } from './app-table-bulk-actions';
import { AppCellDef, AppTableCell } from './app-table-cell';
import { AppTableColumnVisibility, type AppTableDensity, AppTableDensityMenu, AppTableExport } from './app-table-controls';
import { AppTableCards } from './app-table-cards';
import { type AnyAppTable, AppTablePagination } from './app-table-pagination';
import { APP_TABLE_FEATURES, type AppColumnDef, type AppColumnMeta, type AppTableFeatures } from './table-features';
import { exportCsv } from './table-export';
import { loadTablePrefs, saveTablePrefs } from './table-prefs';
import { ALIGN, type AnyRow, DENSITY, apply } from './table-utils';

/**
 * Única forma de mostrar datos tabulares en el CRM (guía §10).
 * Integra carga/error/vacío, orden, búsqueda, paginación cliente o servidor,
 * selección con acciones masivas, columnas visibles, densidad, exportación
 * y cards en móvil (`responsiveMode="cards"`, con `meta.priority`).
 */
@Component({
  selector: 'app-data-table',
  imports: [
    FlexRender, NgIcon, AppTableCell, AppCheckbox, AppSearchInput, AppSkeleton, AppAlert, AppEmptyState, AppButton,
    AppTablePagination, AppTableCards, AppTableColumnVisibility, AppTableDensityMenu, AppTableExport, AppTableBulkActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-w-0 flex-col gap-3' },
  templateUrl: './app-data-table.html',
})
export class AppDataTable<T extends RowData> {
  private readonly bp = inject(Breakpoints);
  private readonly toast = inject(AppToast);

  // Datos y estado de carga
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly AppColumnDef<T>[]>();
  readonly getRowId = input<(row: T, index: number) => string>();
  readonly query = input<AppQueryLike & { isFetching?: () => boolean }>();
  readonly loading = input(false);
  readonly error = input<unknown>(null);
  readonly emptyTitle = input('Sin registros');
  readonly emptyDescription = input<string>();
  readonly emptyIcon = input('lucideInbox');
  readonly ariaLabel = input<string>();

  // Paginación, orden y búsqueda (cliente o servidor)
  readonly paginationMode = input<'client' | 'server' | 'none'>('client');
  readonly pagination = model<PaginationState>({ pageIndex: 0, pageSize: 10 });
  readonly pageSizes = input<readonly number[]>([10, 25, 50, 100]);
  readonly totalRows = input<number>();
  readonly sortingMode = input<'client' | 'server'>('client');
  readonly sorting = model<SortingState>([]);
  readonly searchable = input(false);
  readonly searchMode = input<'client' | 'server'>('client');
  readonly searchPlaceholder = input('Buscar…');
  readonly search = model('');

  // Selección y acciones masivas
  readonly selectable = input(false);
  readonly rowSelection = model<RowSelectionState>({});
  readonly bulkActions = input<readonly AppBulkAction<T>[]>([]);

  // Presentación
  readonly density = input<AppTableDensity>();
  readonly responsiveMode = input<'cards' | 'scroll'>('cards');
  /** Persiste columnas visibles y densidad por tabla. */
  readonly tableId = input<string>();
  readonly exportable = input(false);
  readonly exportFileName = input('exportacion');
  /** Server: trae TODOS los registros para exportar (si no, se exporta lo cargado). */
  readonly exportRows = input<() => Promise<readonly T[]>>();
  /** Las filas abren un detalle: cursor de mano y `(rowClick)`. */
  readonly clickableRows = input(false);
  readonly rowClick = output<T>();
  /** Celdas declaradas fuera (las reenvía `app-crud-page`). */
  readonly extraCells = input<readonly AppCellDef[]>([]);

  private readonly ownCells = contentChildren(AppCellDef);
  protected readonly columnVisibility = signal<ColumnVisibilityState>({});
  protected readonly densityValue = linkedSignal<AppTableDensity>(() => this.density() ?? 'sm');
  protected readonly exporting = signal(false);

  readonly table = injectTable<AppTableFeatures, T>(() => ({
    features: APP_TABLE_FEATURES,
    columns: this.columns() as AppColumnDef<T>[],
    data: this.data() as T[],
    ...(this.getRowId() ? { getRowId: this.getRowId() } : {}),
    state: {
      pagination: this.pagination(),
      sorting: this.sorting(),
      rowSelection: this.rowSelection(),
      columnVisibility: this.columnVisibility(),
      globalFilter: this.searchMode() === 'client' ? this.search() : '',
    },
    onPaginationChange: apply(this.pagination),
    onSortingChange: apply(this.sorting),
    onRowSelectionChange: apply(this.rowSelection),
    onColumnVisibilityChange: apply(this.columnVisibility),
    onGlobalFilterChange: (u: Updater<string>) => this.search.update((old) => functionalUpdate(u, old)),
    globalFilterFn: 'includesString',
    manualPagination: this.paginationMode() !== 'client',
    ...(this.paginationMode() === 'server' ? { rowCount: this.totalRows() ?? this.data().length } : {}),
    manualSorting: this.sortingMode() === 'server',
    manualFiltering: this.searchMode() === 'server',
    enableRowSelection: this.selectable(),
  }));

  constructor() {
    // Preferencias por tabla: se leen al conocer el id y se guardan al cambiar.
    effect(() => {
      const id = this.tableId();
      if (!id) return;
      const prefs = loadTablePrefs(id);
      untracked(() => {
        if (prefs.columnVisibility) this.columnVisibility.set(prefs.columnVisibility);
        if (prefs.density && !this.density()) this.densityValue.set(prefs.density);
      });
    });
    effect(() => {
      const id = this.tableId();
      if (id) saveTablePrefs(id, { columnVisibility: this.columnVisibility(), density: this.densityValue() });
    });
  }

  /** El tipo genérico T no encaja con los subcomponentes (varianza de TanStack). */
  protected readonly anyTable = this.table as unknown as AnyAppTable;
  protected readonly anyRows = computed(() => this.rows() as unknown as AnyRow[]);

  protected readonly cards = computed(() => this.responsiveMode() === 'cards' && this.bp.isMobile());
  protected readonly densityClass = computed(() => DENSITY[this.densityValue()]);
  protected readonly isFetching = computed(() => !!this.query()?.isFetching?.() && !this.query()?.isPending());

  private readonly errorValue = computed(() => {
    const q = this.query();
    return q ? (q.isError() ? (q.error() ?? true) : null) : this.error();
  });
  protected readonly errorText = computed(() => errorMessage(this.errorValue()));

  protected readonly status = computed<'loading' | 'error' | 'empty' | 'ready'>(() => {
    const q = this.query();
    if (q ? q.isPending() : this.loading()) return 'loading';
    if (this.errorValue()) return 'error';
    return this.rows().length ? 'ready' : 'empty';
  });

  protected readonly rows = computed(() => {
    this.track();
    return this.table.getRowModel().rows;
  });
  protected readonly headerGroups = computed(() => {
    this.track();
    return this.table.getHeaderGroups();
  });
  protected readonly selectedCount = computed(() => Object.keys(this.rowSelection()).length);
  protected readonly showPagination = computed(() => this.paginationMode() !== 'none' && this.status() === 'ready');
  protected readonly loadingLines = computed(() => Math.min(this.pagination().pageSize, 8));

  protected readonly bulkViews = computed(() =>
    this.bulkActions()
      .filter((a) => !a.hidden)
      .map((a) => ({ ...a, run: () => a.run(this.selectedRows(), Object.keys(this.rowSelection())) })),
  );

  /** Lee las señales que alimentan el modelo de filas para recalcular. */
  private track(): void {
    this.data();
    this.columns();
    this.pagination();
    this.sorting();
    this.search();
    this.columnVisibility();
    this.rowSelection();
  }

  private selectedRows(): T[] {
    return this.table.getSelectedRowModel().rows.map((r) => r.original);
  }

  protected meta(column: { columnDef: { meta?: unknown } }): AppColumnMeta {
    return (column.columnDef.meta ?? {}) as AppColumnMeta;
  }

  protected alignClass(column: { columnDef: { meta?: unknown } }): string {
    return ALIGN[this.meta(column).align ?? 'start'];
  }

  protected templateFor(columnId: string) {
    return [...this.ownCells(), ...this.extraCells()].find((d) => d.column() === columnId)?.template;
  }
  protected readonly templateFn = (columnId: string) => this.templateFor(columnId);

  protected onSearch(text: string): void {
    this.search.set(text);
    if (this.paginationMode() !== 'none') this.pagination.update((p) => ({ ...p, pageIndex: 0 }));
  }

  protected toggleAll(checked: boolean): void {
    this.table.toggleAllPageRowsSelected(checked);
  }

  protected clearSelection(): void {
    this.rowSelection.set({});
  }

  protected async onExport(): Promise<void> {
    this.exporting.set(true);
    const fetchAll = this.exportRows();
    const ok = await exportCsv(this.table.getVisibleLeafColumns(), this.exportFileName(), async () =>
      fetchAll
        ? fetchAll()
        : this.paginationMode() === 'client'
          ? this.table.getPrePaginatedRowModel().rows.map((r) => r.original)
          : this.data(),
    );
    this.exporting.set(false);
    if (!ok) this.toast.error('No se pudo exportar', 'Intenta de nuevo en unos segundos.');
  }

  protected retry(): void {
    this.query()?.refetch?.();
  }
}
