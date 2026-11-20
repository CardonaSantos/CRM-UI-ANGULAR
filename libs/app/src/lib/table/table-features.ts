import {
  type ColumnDef,
  type RowData,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/angular-table';
import type { AppTone } from '../core/tone';
import type { AppMenuItem } from '../primitives/app-dropdown-menu';

export type AppCellKind = 'text' | 'number' | 'money' | 'date' | 'datetime' | 'status' | 'actions';

export interface AppStatusStyle {
  label?: string;
  tone: AppTone;
}

/** Metadatos de columna que entiende `app-data-table`. */
export interface AppColumnMeta {
  kind?: AppCellKind;
  align?: 'start' | 'center' | 'end';
  /**
   * Prioridad en las cards móviles: 1 = título de la card, 2 = se muestra
   * (por defecto), 3 = solo en escritorio.
   */
  priority?: 1 | 2 | 3;
  /** Ancho CSS de la columna (`'8rem'`). */
  width?: string;
  /** `status`: valor → etiqueta y tono del badge. */
  status?: Record<string, AppStatusStyle>;
  /** `actions`: acciones de la fila (se filtran por `hidden`). */
  actions?: (row: never) => readonly AppMenuItem[];
  /** Excluir de la exportación o dar el valor exportado. */
  exportable?: boolean;
  exportValue?: (row: never) => unknown;
}

/**
 * Registro único de features de las tablas del CRM. Estable a nivel de
 * módulo (TanStack v9 lo exige) y compartido por todas las tablas.
 */
export const APP_TABLE_FEATURES = tableFeatures({
  columnMeta: metaHelper<AppColumnMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime, basic: sortFn_basic },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
});

export type AppTableFeatures = typeof APP_TABLE_FEATURES;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppColumnDef<T extends RowData> = ColumnDef<AppTableFeatures, T, any>;

/** Helper tipado para `*.columns.ts`: `const col = appColumns<Cliente>()`. */
export function appColumns<T extends RowData>() {
  return createColumnHelper<AppTableFeatures, T>();
}

interface ColumnOptions {
  priority?: 1 | 2 | 3;
  width?: string;
  sortable?: boolean;
}

function base<T extends RowData>(id: string, header: string, accessor: (row: T) => unknown, meta: AppColumnMeta, o: ColumnOptions = {}) {
  return {
    id,
    header,
    accessorFn: accessor,
    enableSorting: o.sortable ?? true,
    meta: { priority: o.priority, width: o.width, ...meta },
  } as AppColumnDef<T>;
}

/** Monto en GTQ alineado a la derecha. */
export function moneyColumn<T extends RowData>(id: string, header: string, value: (row: T) => number | string | null | undefined, o?: ColumnOptions) {
  return { ...base(id, header, (r: T) => (value(r) === null || value(r) === undefined ? null : Number(value(r))), { kind: 'money', align: 'end' }, o), sortFn: 'basic' } as AppColumnDef<T>;
}

/** Número con separadores, alineado a la derecha. */
export function numberColumn<T extends RowData>(id: string, header: string, value: (row: T) => number | null | undefined, o?: ColumnOptions) {
  return { ...base(id, header, value, { kind: 'number', align: 'end' }, o), sortFn: 'basic' } as AppColumnDef<T>;
}

/** Fecha dd/MM/yyyy (o con hora si `withTime`). Ordena por fecha real. */
export function dateColumn<T extends RowData>(
  id: string,
  header: string,
  value: (row: T) => Date | string | null | undefined,
  o?: ColumnOptions & { withTime?: boolean },
) {
  const toTime = (r: T) => {
    const v = value(r);
    return v ? new Date(v) : null;
  };
  return { ...base(id, header, toTime, { kind: o?.withTime ? 'datetime' : 'date' }, o), sortFn: 'datetime' } as AppColumnDef<T>;
}

/** Estado como badge. `styles` traduce cada valor del backend a etiqueta y tono. */
export function statusColumn<T extends RowData>(
  id: string,
  header: string,
  value: (row: T) => string | null | undefined,
  styles: Record<string, AppStatusStyle>,
  o?: ColumnOptions,
) {
  return base(id, header, value, { kind: 'status', status: styles, exportValue: ((r: T) => {
    const v = value(r);
    return v ? (styles[v]?.label ?? v) : '';
  }) as AppColumnMeta['exportValue'] }, o);
}

/** Menú "⋯" por fila. Los permisos se resuelven con `hidden` en cada acción. */
export function actionsColumn<T extends RowData>(actions: (row: T) => readonly AppMenuItem[]) {
  return {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    meta: { kind: 'actions', align: 'end', width: '3.5rem', exportable: false, actions: actions as AppColumnMeta['actions'] },
  } as AppColumnDef<T>;
}
