import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, computed, contentChild, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmBreadcrumbImports } from '@nova/ui/breadcrumb';
import { Breakpoints } from '../core/breakpoints';
import { AppDrawer } from '../overlay/app-drawer';
import { AppButton, type AppButtonVariant } from '../primitives/app-button';
import { AppDropdownMenu, type AppMenuItem } from '../primitives/app-dropdown-menu';

export interface AppBreadcrumb {
  label: string;
  /** Sin link = página actual. */
  link?: string;
}

/** Acción de cabecera. En móvil solo la `primary` queda visible; el resto va al menú "⋯". */
export interface AppPageAction extends AppMenuItem {
  variant?: AppButtonVariant;
  primary?: boolean;
}

/** Marca el bloque de filtros: `<nv-cliente-filters appPageFilters />`. */
@Directive({ selector: '[appPageFilters]' })
export class AppPageFilters {}

/**
 * Estructura estándar de una vista (guía §5.2 y §7.2): breadcrumbs, título,
 * acciones, filtros y contenido. Slots: `[appPageActions]` (contenido libre
 * extra), `[appPageFilters]` y el contenido por defecto.
 */
@Component({
  selector: 'app-page',
  imports: [HlmBreadcrumbImports, RouterLink, NgIcon, NgTemplateOutlet, AppButton, AppDropdownMenu, AppDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 p-4 md:gap-6 md:p-6' },
  templateUrl: './app-page.html',
})
export class AppPage {
  protected readonly bp = inject(Breakpoints);

  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly breadcrumbs = input<readonly AppBreadcrumb[]>([]);
  /** Muestra "←" hacia esta ruta (detalle, formularios). */
  readonly backLink = input<string>();
  readonly actions = input<readonly AppPageAction[]>([]);
  /** Filtros activos: se muestra como contador en el botón móvil. */
  readonly activeFilters = input(0);

  protected readonly filters = contentChild(AppPageFilters);
  protected readonly filtersOpen = signal(false);

  private readonly visibleActions = computed(() => this.actions().filter((a) => !a.hidden));
  protected readonly inlineActions = computed(() => {
    const all = this.visibleActions();
    if (!this.bp.isMobile()) return all;
    const primary = all.find((a) => a.primary);
    return primary ? [primary] : [];
  });
  protected readonly menuActions = computed(() => {
    if (!this.bp.isMobile()) return [];
    return this.visibleActions().filter((a) => !this.inlineActions().includes(a));
  });
  protected readonly filtersLabel = computed(() =>
    this.activeFilters() ? `Filtros (${this.activeFilters()})` : 'Filtros',
  );
}
