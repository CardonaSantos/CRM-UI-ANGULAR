import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ACCENT_PRESETS,
  APPEARANCE_OPTIONS,
  DENSITY_OPTIONS,
  RADIUS_OPTIONS,
  SCALE_OPTIONS,
  ThemeService,
  type UiPreferences,
} from '@nova/core/theme';
import { HlmToggleGroupImports } from '@nova/ui/toggle-group';
import { AppButton } from '../primitives/app-button';

/**
 * Panel "Apariencia": acento, claro/oscuro/sistema, tamaño, densidad y radio.
 * Se usa en el perfil y en /_design. Los cambios se aplican en vivo.
 */
@Component({
  selector: 'app-appearance-panel',
  imports: [HlmToggleGroupImports, AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-5' },
  templateUrl: './app-appearance-panel.html',
})
export class AppAppearancePanel {
  protected readonly theme = inject(ThemeService);

  protected readonly accents = ACCENT_PRESETS;
  protected readonly appearances = APPEARANCE_OPTIONS;
  protected readonly scales = SCALE_OPTIONS;
  protected readonly densities = DENSITY_OPTIONS;
  protected readonly radii = RADIUS_OPTIONS;

  protected set<K extends keyof UiPreferences>(key: K, value: UiPreferences[K] | null | undefined): void {
    // El toggle-group emite null/undefined al deseleccionar: se ignora para no dejar el valor vacío.
    if (value !== null && value !== undefined) this.theme.update({ [key]: value } as Partial<UiPreferences>);
  }
}
