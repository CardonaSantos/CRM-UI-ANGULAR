import { Injectable } from '@angular/core';
import { DEFAULT_PREFS, type UiPreferences } from './ui-preferences';

/** Debe coincidir con el script anti-parpadeo de apps/crm/src/index.html. */
export const UI_PREFERENCES_STORAGE_KEY = 'nova:ui-preferences';

/**
 * Persistencia de preferencias de UI. Hoy usa localStorage. Para guardarlas
 * por usuario en el backend (decisión abierta §16) basta con reemplazar este
 * provider.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesStorage {
  load(): UiPreferences | null {
    try {
      const raw = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
      return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<UiPreferences>) } : null;
    } catch {
      return null;
    }
  }

  save(prefs: UiPreferences): void {
    try {
      localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Storage bloqueado (modo privado, cuota): las preferencias viven solo en memoria.
    }
  }
}
