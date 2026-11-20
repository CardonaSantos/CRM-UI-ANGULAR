/**
 * Formato único del CRM (guía §10): moneda en GTQ y fechas dd/MM/yyyy, igual
 * que la UI React (dayjs 'DD/MM/YYYY'). Úsalos también fuera de tablas.
 */
const LOCALE = 'es-GT';

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });

export const EMPTY_VALUE = '—';

export type DateInput = Date | string | number | null | undefined;

/** Convierte a Date; null si no es una fecha válida. */
export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? money.format(n) : EMPTY_VALUE;
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? EMPTY_VALUE : number.format(value);
}

export function formatDate(value: DateInput): string {
  const d = toDate(value);
  return d ? date.format(d) : EMPTY_VALUE;
}

export function formatDateTime(value: DateInput): string {
  const d = toDate(value);
  return d ? dateTime.format(d) : EMPTY_VALUE;
}

export function formatMonthYear(value: DateInput): string {
  const d = toDate(value);
  if (!d) return EMPTY_VALUE;
  const text = monthYear.format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Parsea dd/MM/yyyy (lo que escribe un usuario en GT). */
export function parseDate(text: string): Date | null {
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null;
}

/** Iniciales para avatares: "Ana López" → "AL". */
export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}
