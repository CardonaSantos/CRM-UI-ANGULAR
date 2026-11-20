export type Appearance = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type UiScale = 0.875 | 1 | 1.125 | 1.25;
export type UiRadius = 'none' | 'sm' | 'md' | 'lg';

export interface UiPreferences {
  appearance: Appearance;
  /** Color de acento en hex (#rrggbb). */
  accent: string;
  density: Density;
  scale: UiScale;
  radius: UiRadius;
}

export interface AccentPreset {
  label: string;
  hex: string;
}

/** Teal del logo NOVA (equivale a --app-brand-teal: 163 72% 45%). */
export const NOVA_ACCENT = '#20c497';

export const ACCENT_PRESETS: readonly AccentPreset[] = [
  { label: 'NOVA', hex: NOVA_ACCENT },
  { label: 'Azul', hex: '#2f7bf5' },
  { label: 'Morado', hex: '#7c4ddb' },
  { label: 'Rosa', hex: '#d9467a' },
  { label: 'Naranja', hex: '#ea7a1f' },
  { label: 'Grafito', hex: '#4b5866' },
];

export const APPEARANCE_OPTIONS: readonly { label: string; value: Appearance }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Sistema', value: 'system' },
];

export const SCALE_OPTIONS: readonly { label: string; value: UiScale }[] = [
  { label: 'S', value: 0.875 },
  { label: 'M', value: 1 },
  { label: 'L', value: 1.125 },
  { label: 'XL', value: 1.25 },
];

export const DENSITY_OPTIONS: readonly { label: string; value: Density }[] = [
  { label: 'Compacta', value: 'compact' },
  { label: 'Cómoda', value: 'comfortable' },
  { label: 'Amplia', value: 'spacious' },
];

export const RADIUS_OPTIONS: readonly { label: string; value: UiRadius }[] = [
  { label: 'Ninguno', value: 'none' },
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'md' },
  { label: 'L', value: 'lg' },
];

export const DEFAULT_PREFS: UiPreferences = {
  appearance: 'system',
  accent: NOVA_ACCENT,
  density: 'comfortable',
  scale: 1,
  radius: 'md',
};
