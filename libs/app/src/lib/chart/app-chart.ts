import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { ThemeService } from '@nova/core/theme';
import { AppSkeleton } from '../feedback/app-loader';

export type AppChartOptions = EChartsCoreOption;

/** Lee un token `--app-*` (tripleta HSL) como color que entiende ECharts. */
function token(doc: Document, name: string, alpha = 1): string {
  const raw = getComputedStyle(doc.documentElement).getPropertyValue(`--app-${name}`).trim();
  const [h, s, l] = raw.split(/\s+/);
  return h && s && l ? `hsla(${h}, ${s}, ${l}, ${alpha})` : '';
}

/** Tema derivado de los tokens: cambia con el acento, el modo oscuro y la escala. */
function themeFromTokens(doc: Document) {
  const fg = token(doc, 'foreground');
  const muted = token(doc, 'muted-foreground');
  const border = token(doc, 'border');
  const font = getComputedStyle(doc.body).fontFamily;
  const fontSize = parseFloat(getComputedStyle(doc.documentElement).fontSize) * 0.75;
  const axis = {
    axisLine: { lineStyle: { color: border } },
    axisTick: { lineStyle: { color: border } },
    axisLabel: { color: muted, fontSize },
    splitLine: { lineStyle: { color: border, type: 'dashed' } },
  };
  return {
    color: ['primary', 'info', 'warning', 'danger', 'success', 'muted-foreground'].map((t) => token(doc, t)),
    backgroundColor: 'transparent',
    textStyle: { fontFamily: font, color: fg, fontSize },
    legend: { textStyle: { color: muted } },
    tooltip: {
      backgroundColor: token(doc, 'popover'),
      borderColor: border,
      textStyle: { color: token(doc, 'popover-foreground'), fontSize },
    },
    categoryAxis: axis,
    valueAxis: axis,
    timeAxis: axis,
  };
}

/**
 * Gráfica ECharts (guía §16: librería única). Recibe `options` de ECharts;
 * colores, tipografía y modo oscuro salen de los tokens. Se carga diferido:
 * envuélvela en `@defer (on viewport)` dentro de dashboards largos.
 */
@Component({
  selector: 'app-chart',
  imports: [AppSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block w-full',
    role: 'img',
    '[attr.aria-label]': 'ariaLabel()',
    '[style.height]': 'height()',
  },
  template: `
    <div #canvas class="absolute inset-0"></div>
    @if (loading() || !ready()) {
      <div class="absolute inset-0 flex items-end gap-2 p-2"><app-skeleton shape="block" class="h-full" /></div>
    }
  `,
})
export class AppChart {
  private readonly doc = inject(DOCUMENT);
  private readonly theme = inject(ThemeService);

  readonly options = input.required<AppChartOptions>();
  readonly height = input('18rem');
  readonly loading = input(false);
  /** Descripción para lectores de pantalla ("Ingresos por mes, 2026"). */
  readonly ariaLabel = input.required<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>('canvas');
  protected readonly ready = signal(false);
  private chart?: EChartsType;
  private lib?: typeof import('echarts/core');

  constructor() {
    const destroyRef = inject(DestroyRef);
    let observer: ResizeObserver | undefined;

    afterNextRender(async () => {
      const { echarts } = await import('./echarts-setup');
      if (destroyRef.destroyed) return;
      this.lib = echarts;
      this.mount();
      observer = new ResizeObserver(() => this.chart?.resize());
      observer.observe(this.canvas().nativeElement);
    });

    // Re-crear al cambiar tema (claro/oscuro, acento, escala).
    effect(() => {
      this.theme.prefs();
      this.theme.isDark();
      untracked(() => queueMicrotask(() => this.mount()));
    });

    effect(() => {
      const opts = this.options();
      if (this.ready()) this.chart?.setOption(opts, { notMerge: true });
    });

    destroyRef.onDestroy(() => {
      observer?.disconnect();
      this.chart?.dispose();
    });
  }

  private mount(): void {
    if (!this.lib) return;
    this.chart?.dispose();
    this.chart = this.lib.init(this.canvas().nativeElement, themeFromTokens(this.doc), { renderer: 'canvas' });
    this.chart.setOption(untracked(this.options));
    this.ready.set(true);
  }
}
