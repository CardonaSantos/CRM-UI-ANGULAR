import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ACCENT_VARIABLE_NAMES, accentVariables } from './accent';
import { PreferencesStorage } from './preferences-storage';
import { DEFAULT_PREFS, type UiPreferences } from './ui-preferences';

/**
 * Único servicio de tema del CRM (en React había tres providers).
 * Aplica apariencia, acento, densidad, escala y radio sobre <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(PreferencesStorage);
  private readonly systemDark = signal(false);

  readonly prefs = signal<UiPreferences>(this.storage.load() ?? DEFAULT_PREFS);

  /** Modo efectivo después de resolver 'system'. */
  readonly isDark = computed(() => {
    const appearance = this.prefs().appearance;
    return appearance === 'dark' || (appearance === 'system' && this.systemDark());
  });

  constructor() {
    this.watchSystemAppearance();

    effect(() => {
      const p = this.prefs();
      const dark = this.isDark();
      const root = this.doc.documentElement;

      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
      root.dataset['density'] = p.density;
      root.dataset['radius'] = p.radius;
      root.style.setProperty('--app-scale', String(p.scale));
      this.applyAccent(root, p.accent, dark);

      this.storage.save(p);
    });
  }

  update(patch: Partial<UiPreferences>): void {
    this.prefs.update((p) => ({ ...p, ...patch }));
  }

  reset(): void {
    this.prefs.set(DEFAULT_PREFS);
  }

  private applyAccent(root: HTMLElement, hex: string, dark: boolean): void {
    for (const name of ACCENT_VARIABLE_NAMES) root.style.removeProperty(name);
    // El teal NOVA ya es el valor por defecto de app-theme.css.
    if (hex.toLowerCase() === DEFAULT_PREFS.accent) return;

    const vars = accentVariables(hex, dark);
    if (!vars) return;
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  }

  private watchSystemAppearance(): void {
    const media = this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;

    this.systemDark.set(media.matches);
    const listener = (e: MediaQueryListEvent) => this.systemDark.set(e.matches);
    media.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
  }
}
