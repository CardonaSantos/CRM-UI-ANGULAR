import { provideBrnCalendarI18n } from '@spartan-ng/brain/calendar';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;
const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Calendario en español de Guatemala; la semana empieza en lunes. */
const CALENDAR_ES_CONFIG = {
  formatWeekdayName: (i: number) => WEEKDAYS[i].slice(0, 2),
  formatHeader: (month: number, year: number) => `${MONTHS[month]} ${year}`,
  formatYear: (year: number) => String(year),
  formatMonth: (month: number) => MONTHS[month],
  labelPrevious: () => 'Mes anterior',
  labelNext: () => 'Mes siguiente',
  labelWeekday: (i: number) => WEEKDAYS[i],
  months: () => [...MONTHS] as unknown as typeof MONTHS & string[],
  firstDayOfWeek: () => 1 as const,
};

/** Calendario en español para los date-pickers del kit. */
export const provideCalendarEs = () =>
  provideBrnCalendarI18n(CALENDAR_ES_CONFIG as Parameters<typeof provideBrnCalendarI18n>[0]);
