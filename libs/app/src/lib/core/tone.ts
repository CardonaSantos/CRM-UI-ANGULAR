/** Tonos semánticos del kit. Cada componente traduce el tono a sus tokens. */
export type AppTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** Clases literales (Tailwind las detecta) por tono. */
export const TONE_SOFT: Record<AppTone, string> = {
  neutral: 'bg-neutral-soft text-neutral-soft-foreground',
  primary: 'bg-primary-soft text-primary-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  danger: 'bg-danger-soft text-danger-soft-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
};

export const TONE_SOLID: Record<AppTone, string> = {
  neutral: 'bg-muted-foreground text-background',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  info: 'bg-info text-info-foreground',
};

export const TONE_OUTLINE: Record<AppTone, string> = {
  neutral: 'border-border text-muted-foreground',
  primary: 'border-primary text-primary',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  danger: 'border-danger text-danger',
  info: 'border-info text-info',
};

export const TONE_DOT: Record<AppTone, string> = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export const TONE_TEXT: Record<AppTone, string> = {
  neutral: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};
