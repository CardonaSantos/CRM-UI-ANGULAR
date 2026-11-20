import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBan,
  lucideBanknote,
  lucideEye,
  lucideFilter,
  lucideLock,
  lucidePalette,
  lucidePanelRight,
  lucidePencil,
  lucidePrinter,
  lucideRefreshCw,
  lucideSend,
  lucideTicket,
  lucideTrash2,
  lucideUser,
  lucideUsers,
  lucideWifi,
} from '@ng-icons/lucide';
import {
  AppAppearancePanel,
  AppCard,
  AppDrawer,
  AppPage,
  type AppPageAction,
  AppSplit,
  AppTab,
  type AppTabItem,
  AppTabs,
} from '@nova/app';
import { CatalogActions } from '../ui/catalog-actions';
import { CatalogDisplay } from '../ui/catalog-display';
import { CatalogFeedback } from '../ui/catalog-feedback';
import { CatalogForms } from '../ui/catalog-forms';
import { CatalogLayout } from '../ui/catalog-layout';
import { CatalogOverlays } from '../ui/catalog-overlays';
import { CatalogTable } from '../ui/catalog-table';

const TABS: AppTabItem[] = [
  { id: 'tema', label: 'Tema', icon: 'lucidePalette' },
  { id: 'acciones', label: 'Acciones' },
  { id: 'formularios', label: 'Formularios' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'tabla', label: 'Tabla' },
  { id: 'datos', label: 'Datos y gráficas' },
  { id: 'layout', label: 'Layout' },
];

/**
 * Catálogo del kit NOVA (guía §5.2 y criterio de salida de la Fase 1).
 * Todo componente que entre a `@nova/app` se agrega aquí. La pestaña activa
 * va en la URL (`?tab=tabla`) para poder compartir el enlace.
 */
@Component({
  selector: 'nv-design-catalog-page',
  imports: [
    AppPage, AppTabs, AppTab, AppSplit, AppCard, AppDrawer, AppAppearancePanel, CatalogActions, CatalogForms,
    CatalogOverlays, CatalogFeedback, CatalogTable, CatalogDisplay, CatalogLayout,
  ],
  providers: [
    provideIcons({
      lucideArrowRight, lucideBan, lucideBanknote, lucideEye, lucideFilter, lucideLock, lucidePalette, lucidePanelRight,
      lucidePencil, lucidePrinter, lucideRefreshCw, lucideSend, lucideTicket, lucideTrash2, lucideUser, lucideUsers,
      lucideWifi,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './design-catalog.page.html',
})
export class DesignCatalogPage {
  private readonly router = inject(Router);

  /** Query param `?tab=` (withComponentInputBinding). */
  readonly tab = input<string>();
  protected readonly activeTab = linkedSignal(() => this.tab() ?? 'tema');
  protected readonly tabs = TABS;
  protected readonly appearanceOpen = signal(false);

  protected readonly actions: AppPageAction[] = [
    { label: 'Apariencia', icon: 'lucidePalette', primary: true, variant: 'outline', run: () => this.appearanceOpen.set(true) },
  ];

  protected selectTab(id: string | undefined): void {
    if (!id) return;
    this.activeTab.set(id);
    void this.router.navigate([], { queryParams: { tab: id }, replaceUrl: true });
  }
}
