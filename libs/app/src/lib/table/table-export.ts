import { formatDate, formatDateTime } from '../core/format';
import type { AppColumnMeta } from './table-features';

/** Lo que la exportación lee de una columna (estructural, sirve para cualquier T). */
export interface AnyColumn {
  id: string;
  columnDef: { header?: unknown; meta?: unknown };
}

interface ColumnDefShape {
  header?: unknown;
  meta?: AppColumnMeta;
  accessorFn?: (row: unknown, index: number) => unknown;
  accessorKey?: string;
}

export function columnLabel(column: AnyColumn): string {
  const h = column.columnDef.header;
  return typeof h === 'string' && h ? h : column.id;
}

export function isExportable(column: AnyColumn): boolean {
  const meta = column.columnDef.meta as AppColumnMeta | undefined;
  return meta?.kind !== 'actions' && meta?.exportable !== false;
}

/** Valor exportado de un registro: crudo para números (Excel suma), fechas dd/MM/yyyy. */
export function exportValue(item: unknown, index: number, column: AnyColumn): unknown {
  const def = column.columnDef as ColumnDefShape;
  const meta = def.meta;
  if (meta?.exportValue) return (meta.exportValue as (r: unknown) => unknown)(item);
  const v = def.accessorFn
    ? def.accessorFn(item, index)
    : def.accessorKey
      ? (item as Record<string, unknown>)[def.accessorKey]
      : '';
  if (meta?.kind === 'date') return v ? formatDate(v as Date) : '';
  if (meta?.kind === 'datetime') return v ? formatDateTime(v as Date) : '';
  return v;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text =
    value instanceof Date ? formatDate(value) : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV con BOM UTF-8: Excel lo abre con tildes y ñ correctas. */
export function toCsv(columns: readonly AnyColumn[], items: readonly unknown[]): string {
  const header = columns.map((c) => csvCell(columnLabel(c))).join(',');
  const body = items.map((item, i) => columns.map((c) => csvCell(exportValue(item, i, c))).join(','));
  return '﻿' + [header, ...body].join('\r\n');
}

export function downloadText(filename: string, content: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Exporta las columnas exportables a CSV. Devuelve false si falló. */
export async function exportCsv(
  columns: readonly AnyColumn[],
  fileName: string,
  items: () => Promise<readonly unknown[]> | readonly unknown[],
): Promise<boolean> {
  try {
    const rows = await items();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`${fileName}-${stamp}.csv`, toCsv(columns.filter(isExportable), rows));
    return true;
  } catch {
    return false;
  }
}
