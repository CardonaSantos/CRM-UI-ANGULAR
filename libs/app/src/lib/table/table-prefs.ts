import type { ColumnVisibilityState } from '@tanstack/angular-table';
import type { AppTableDensity } from './app-table-controls';

export interface AppTablePrefs {
  columnVisibility?: ColumnVisibilityState;
  density?: AppTableDensity;
}

const key = (id: string) => `nova:table:${id}`;

/** Preferencias de una tabla en localStorage (falla en silencio en modo privado). */
export function loadTablePrefs(id: string): AppTablePrefs {
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as AppTablePrefs) : {};
  } catch {
    return {};
  }
}

export function saveTablePrefs(id: string, prefs: AppTablePrefs): void {
  try {
    localStorage.setItem(key(id), JSON.stringify(prefs));
  } catch {
    /* almacenamiento no disponible */
  }
}
