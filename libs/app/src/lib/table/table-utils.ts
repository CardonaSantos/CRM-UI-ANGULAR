import { type Row, type Updater, functionalUpdate } from '@tanstack/angular-table';
import type { AppTableDensity } from './app-table-controls';
import type { AppTableFeatures } from './table-features';

/** Clases por densidad de fila (encabezado y celda). */
export const DENSITY: Record<AppTableDensity, { cell: string; head: string }> = {
  xs: { cell: 'px-3 py-1.5 text-xs', head: 'h-8 px-3 text-xs' },
  sm: { cell: 'px-3 py-2.5 text-sm', head: 'h-10 px-3 text-xs' },
  md: { cell: 'px-4 py-3.5 text-sm', head: 'h-11 px-4 text-sm' },
};

export const ALIGN = { start: 'text-start', center: 'text-center', end: 'text-end' } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRow = Row<AppTableFeatures, any>;

/** Aplica un `Updater` de TanStack sobre una señal o `model()`. */
export function apply<S>(target: { update(fn: (v: S) => S): void }) {
  return (updater: Updater<S>) => target.update((old) => functionalUpdate(updater, old));
}
