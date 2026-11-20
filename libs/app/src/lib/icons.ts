import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowLeft,
  lucideArrowUp,
  lucideCalendar,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideChevronsUpDown,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCircleHelp,
  lucideColumns3,
  lucideDownload,
  lucideEllipsis,
  lucideFileText,
  lucideInbox,
  lucideInfo,
  lucidePlus,
  lucideRotateCcw,
  lucideRows3,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideTrendingDown,
  lucideTrendingUp,
  lucideTriangleAlert,
  lucideUpload,
  lucideX,
} from '@ng-icons/lucide';
import { provideSpartanHlm } from '@nova/ui/utils';

/** Iconos que usa el propio kit (las features registran los suyos). */
export const KIT_ICONS = {
  lucideArrowDown,
  lucideArrowLeft,
  lucideArrowUp,
  lucideCalendar,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideChevronsUpDown,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCircleHelp,
  lucideColumns3,
  lucideDownload,
  lucideEllipsis,
  lucideFileText,
  lucideInbox,
  lucideInfo,
  lucidePlus,
  lucideRotateCcw,
  lucideRows3,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideTrendingDown,
  lucideTrendingUp,
  lucideTriangleAlert,
  lucideUpload,
  lucideX,
};

/**
 * Configuración global del kit (se registra una vez en app.config):
 * defaults de overlays de spartan e iconos del kit. (El calendario en
 * español se provee en los propios date-pickers para no cargarlo al inicio.)
 * Así la app no importa `@nova/ui` directo (guía §3.1).
 */
export function provideAppKit(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideSpartanHlm(),
    provideIcons(KIT_ICONS),
  ]);
}
