import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AppAlert,
  AppAvatar,
  AppBadge,
  AppCard,
  AppDetailLayout,
  AppGrid,
  AppInline,
  AppKeyValue,
  AppSection,
  AppSeparator,
  AppSplit,
  AppStack,
  AppTab,
  type AppTabItem,
  AppTimeline,
} from '@nova/app';

/** Catálogo: primitivas de layout y estructuras de página. */
@Component({
  selector: 'nv-catalog-layout',
  imports: [
    AppSection, AppStack, AppInline, AppGrid, AppSplit, AppSeparator, AppCard, AppAlert, AppDetailLayout, AppTab,
    AppKeyValue, AppTimeline, AppAvatar, AppBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section title="app-grid" description="Mobile-first: [cols]=&quot;{ base: 1, md: 2, xl: 4 }&quot;">
        <app-grid [cols]="{ base: 1, md: 2, xl: 4 }">
          @for (n of [1, 2, 3, 4]; track n) {
            <app-card size="sm" [title]="'Celda ' + n" description="Se reacomoda según el ancho" />
          }
        </app-grid>
      </app-section>

      <app-section title="app-split" description="Lateral + principal; en móvil se apila">
        <app-split>
          <app-alert appSplitAside tone="info" title="Lateral">Resumen, filtros o navegación secundaria.</app-alert>
          <app-alert tone="neutral" title="Principal">Contenido de la vista.</app-alert>
        </app-split>
      </app-section>

      <app-section title="app-stack, app-inline y app-separator">
        <app-inline>
          <app-badge>Uno</app-badge>
          <app-badge>Dos</app-badge>
          <app-badge>Tres</app-badge>
        </app-inline>
        <app-separator label="o" />
        <app-stack gap="xs">
          <app-badge tone="primary">Arriba</app-badge>
          <app-badge tone="primary">Abajo</app-badge>
        </app-stack>
      </app-section>

      <app-section title="app-detail-layout" description="Ficha de detalle: resumen + pestañas (perfil de cliente, ticket)" appearance="plain">
        <app-detail-layout [tabs]="tabs">
          <app-card appDetailSummary>
            <app-stack gap="md">
              <app-inline gap="md">
                <app-avatar name="Ana López" size="lg" />
                <app-stack gap="xs">
                  <strong>Ana López</strong>
                  <app-badge tone="success" [dot]="true">Activo</app-badge>
                </app-stack>
              </app-inline>
              <app-key-value [columns]="1" [items]="resumen" />
            </app-stack>
          </app-card>
          <ng-template appTab="datos"><app-key-value [items]="resumen" /></ng-template>
          <ng-template appTab="historial"><app-timeline [items]="historial" /></ng-template>
        </app-detail-layout>
      </app-section>
    </app-stack>
  `,
})
export class CatalogLayout {
  protected readonly tabs: AppTabItem[] = [
    { id: 'datos', label: 'Datos generales' },
    { id: 'historial', label: 'Historial', badge: 2 },
  ];
  protected readonly resumen = [
    { label: 'Teléfono', value: '5555-1234' },
    { label: 'Sector', value: 'Zona 1' },
    { label: 'Saldo', value: 0, kind: 'money' as const },
  ];
  protected readonly historial = [
    { title: 'Instalación completada', date: new Date(2026, 9, 2, 10, 0), tone: 'success' as const },
    { title: 'Contrato firmado', date: new Date(2026, 9, 1, 16, 20), tone: 'info' as const },
  ];
}
