import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AppAccordion,
  AppAccordionItem,
  AppAvatar,
  AppChart,
  type AppChartOptions,
  AppGrid,
  AppInline,
  AppKeyValue,
  AppSection,
  AppSkeleton,
  AppStack,
  AppStatCard,
  AppTab,
  type AppTabItem,
  AppTabs,
  AppTimeline,
  type AppTimelineItem,
} from '@nova/app';

const MESES = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];

/** Catálogo: KPIs, gráficas (ECharts), tabs, accordion, avatar, timeline y key-value. */
@Component({
  selector: 'nv-catalog-display',
  imports: [
    AppSection, AppStack, AppGrid, AppInline, AppStatCard, AppChart, AppTabs, AppTab, AppAccordion, AppAccordionItem,
    AppAvatar, AppTimeline, AppKeyValue, AppSkeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section title="app-stat-card" description="KPIs con variación">
        <app-grid [cols]="{ base: 1, sm: 2, xl: 4 }">
          <app-stat-card title="Cobrado este mes" [value]="184250.5" format="money" icon="lucideBanknote" [delta]="8.4" hint="vs. octubre" />
          <app-stat-card title="Clientes activos" [value]="3412" icon="lucideUsers" tone="info" [delta]="1.2" />
          <app-stat-card title="Tickets abiertos" [value]="27" icon="lucideTicket" tone="warning" [delta]="-12" [invertDelta]="true" hint="bajar es bueno" />
          <app-stat-card title="Morosidad" [value]="6.3" format="percent" icon="lucideTriangleAlert" tone="danger" [loading]="true" />
        </app-grid>
      </app-section>

      <app-section title="app-chart (ECharts)" description="Colores y tipografía desde los tokens; cambia con el acento y el modo oscuro">
        <app-grid [cols]="{ base: 1, lg: 2 }">
          @defer (on viewport) {
            <app-chart ariaLabel="Cobros por mes, junio a noviembre 2026" [options]="barras" />
          } @placeholder {
            <app-skeleton shape="block" />
          }
          @defer (on viewport) {
            <app-chart ariaLabel="Clientes por estado" [options]="dona" />
          } @placeholder {
            <app-skeleton shape="block" />
          }
        </app-grid>
      </app-section>

      <app-section title="app-tabs">
        <app-tabs [tabs]="tabs" [(value)]="tab">
          <ng-template appTab="resumen"><app-key-value [items]="datos" /></ng-template>
          <ng-template appTab="historial"><app-timeline [items]="historial" /></ng-template>
          <ng-template appTab="facturas">Las pestañas se crean solo al activarse.</ng-template>
        </app-tabs>
      </app-section>

      <app-section title="app-accordion">
        <app-accordion type="multiple">
          <app-accordion-item title="Datos de contacto" [opened]="true"><app-key-value [items]="datos" /></app-accordion-item>
          <app-accordion-item title="Equipo instalado">ONT Huawei HG8145V5 · Router TP-Link Archer C6</app-accordion-item>
          <app-accordion-item title="Observaciones">Casa esquinera, portón negro.</app-accordion-item>
        </app-accordion>
      </app-section>

      <app-section title="app-avatar">
        <app-inline gap="md">
          <app-avatar name="Ana López" size="sm" />
          <app-avatar name="Carlos Pérez" />
          <app-avatar name="María García" size="lg" />
        </app-inline>
      </app-section>
    </app-stack>
  `,
})
export class CatalogDisplay {
  protected readonly tab = signal('resumen');
  protected readonly tabs: AppTabItem[] = [
    { id: 'resumen', label: 'Resumen', icon: 'lucideUser' },
    { id: 'historial', label: 'Historial', badge: 4 },
    { id: 'facturas', label: 'Facturas' },
    { id: 'oculta', label: 'Sin permiso', hidden: true },
  ];

  protected readonly datos = [
    { label: 'Teléfono', value: '5555-1234' },
    { label: 'DPI', value: '2547 89632 0101' },
    { label: 'Plan', value: '50 Mbps' },
    { label: 'Mensualidad', value: 250, kind: 'money' as const },
    { label: 'Cliente desde', value: new Date(2023, 2, 14), kind: 'date' as const },
    { label: 'Dirección', value: '5a. avenida 10-20, zona 1', wide: true },
  ];

  protected readonly historial: AppTimelineItem[] = [
    { title: 'Ticket cerrado', description: 'Se cambió el conector de la ONT.', date: new Date(2026, 10, 12, 15, 30), tone: 'success', icon: 'lucideCircleCheck' },
    { title: 'Técnico asignado', description: 'Pedro Ramírez', date: new Date(2026, 10, 12, 9, 5), tone: 'info' },
    { title: 'Pago registrado', description: 'Q250.00 en efectivo', date: new Date(2026, 10, 3, 11, 0), tone: 'primary', icon: 'lucideBanknote' },
    { title: 'Ticket abierto', description: 'Sin internet desde ayer', date: new Date(2026, 10, 11, 18, 40), tone: 'warning' },
  ];

  protected readonly barras: AppChartOptions = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 8, right: 8, top: 16, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: MESES },
    yAxis: { type: 'value' },
    series: [
      { name: 'Cobrado', type: 'bar', data: [152000, 158300, 161900, 170100, 169800, 184250], barMaxWidth: 28 },
      { name: 'Meta', type: 'line', smooth: true, data: [160000, 160000, 165000, 165000, 175000, 180000] },
    ],
  };

  protected readonly dona: AppChartOptions = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        label: { show: false },
        data: [
          { name: 'Activos', value: 3412 },
          { name: 'Pendientes', value: 210 },
          { name: 'Morosos', value: 245 },
          { name: 'Suspendidos', value: 98 },
        ],
      },
    ],
  };
}
