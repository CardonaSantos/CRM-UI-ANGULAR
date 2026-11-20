/**
 * Color de acento en runtime.
 * Migrado desde POS-UI `components/app/config/app-theme-runtime.ts`.
 *
 * Diferencia con React: ya no se escriben los aliases shadcn (--primary,
 * --ring, --accent). En app-tokens.css esos aliases se derivan de --app-*
 * con hsl(), así que siguen al acento solos.
 */
interface Hsl {
  h: number;
  s: number;
  l: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const hsl = (h: number, s: number, l: number) => `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

export function normalizeHexColor(hex: string): string | null {
  const value = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

export function hexToHsl(hex: string): Hsl | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;

  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function softTones(h: number, isDark: boolean) {
  return isDark
    ? {
        mint: hsl(h, 55, 14),
        mintStrong: hsl(h, 44, 24),
        softFg: hsl(h, 70, 78),
        focused: hsl(h, 20, 17),
        rowBg: hsl(h, 34, 20),
        rowFg: '170 18% 96%',
        rowMuted: '170 14% 84%',
        rowLink: hsl(h, 76, 82),
        rowBorder: hsl(h, 36, 30),
        bulkBg: hsl(h, 55, 14),
        bulkBorder: hsl(h, 44, 24),
        multiBg: hsl(h, 55, 14),
        multiBorder: hsl(h, 44, 24),
      }
    : {
        mint: hsl(h, 62, 92),
        mintStrong: hsl(h, 50, 84),
        softFg: hsl(h, 72, 25),
        focused: hsl(h, 45, 94),
        rowBg: hsl(h, 52, 88),
        rowFg: '190 18% 13%',
        rowMuted: '190 10% 24%',
        rowLink: hsl(h, 72, 18),
        rowBorder: hsl(h, 42, 72),
        bulkBg: hsl(h, 62, 93),
        bulkBorder: hsl(h, 45, 82),
        multiBg: hsl(h, 45, 94),
        multiBorder: hsl(h, 40, 82),
      };
}

/** Variables --app-* que dependen del acento y del modo claro/oscuro. */
export function accentVariables(hex: string, isDark: boolean): Record<string, string> | null {
  const base = hexToHsl(hex);
  if (!base) return null;

  const { h } = base;
  const s = clamp(base.s, 45, 82);
  const l = clamp(base.l, 36, 62);
  const primary = hsl(h, s, l);
  const hover = hsl(h, s, clamp(l - 7, 24, 58));
  const active = hsl(h, s, clamp(l - 12, 18, 52));
  const onPrimary = isDark ? '195 18% 7%' : '0 0% 100%';
  const t = softTones(h, isDark);

  return {
    '--app-brand-teal': primary,
    '--app-brand-teal-hover': hover,
    '--app-brand-teal-active': active,
    '--app-primary': primary,
    '--app-primary-hover': hover,
    '--app-primary-active': active,
    '--app-primary-foreground': onPrimary,
    '--app-ring': primary,
    '--app-ring-soft': `${primary} / 0.22`,
    '--app-button-primary-bg': primary,
    '--app-button-primary-bg-hover': hover,
    '--app-button-primary-bg-active': active,
    '--app-button-primary-border': primary,
    '--app-button-primary-foreground': onPrimary,
    '--app-switch-bg-checked': primary,
    '--app-switch-bg-checked-hover': hover,
    '--app-checkbox-checked-bg': primary,
    '--app-checkbox-checked-bg-hover': hover,
    '--app-checkbox-indeterminate-bg': primary,
    '--app-loader-primary': primary,
    '--app-status-dot-primary': primary,
    '--app-status-dot-primary-ring': primary,
    '--app-card-selected-ring': primary,
    '--app-table-ring': primary,
    '--app-select-option-bg-selected': primary,
    '--app-select-option-bg-selected-hover': hover,
    '--app-brand-mint': t.mint,
    '--app-brand-mint-strong': t.mintStrong,
    '--app-badge-primary-soft-bg': t.mint,
    '--app-badge-primary-soft-foreground': t.softFg,
    '--app-select-option-bg-focused': t.focused,
    '--app-select-multi-value-bg': t.multiBg,
    '--app-select-multi-value-foreground': t.softFg,
    '--app-select-multi-value-border': t.multiBorder,
    '--app-table-row-selected-bg': t.rowBg,
    '--app-table-row-selected-foreground': t.rowFg,
    '--app-table-row-selected-muted': t.rowMuted,
    '--app-table-row-selected-link': t.rowLink,
    '--app-table-row-selected-border': t.rowBorder,
    '--app-table-bulk-bg': t.bulkBg,
    '--app-table-bulk-foreground': t.softFg,
    '--app-table-bulk-border': t.bulkBorder,
  };
}

/** Nombres que escribe `accentVariables`, para poder limpiarlos. */
export const ACCENT_VARIABLE_NAMES: readonly string[] = Object.keys(accentVariables('#000000', false) ?? {});
