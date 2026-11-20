import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmSkeleton } from '@nova/ui/skeleton';
import { formatMoney, formatNumber } from '../core/format';
import { TONE_SOFT, type AppTone } from '../core/tone';

export type AppStatFormat = 'number' | 'money' | 'percent' | 'text';

/**
 * Tarjeta KPI. `delta` es la variación en % (positiva = mejora, salvo que
 * `invertDelta` diga que bajar es bueno, p. ej. tickets abiertos).
 */
@Component({
  selector: 'app-stat-card',
  imports: [NgIcon, HlmSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block min-w-0 rounded-xl border bg-card p-4 text-card-foreground shadow-xs' },
  template: `
    <div class="flex items-start justify-between gap-3">
      <p class="text-muted-foreground text-sm font-medium">{{ title() }}</p>
      @if (icon()) {
        <span class="flex size-9 shrink-0 items-center justify-center rounded-lg" [class]="iconClass()">
          <ng-icon [name]="icon()!" size="1.125rem" aria-hidden="true" />
        </span>
      }
    </div>
    @if (loading()) {
      <hlm-skeleton class="bg-skeleton mt-2 h-8 w-2/3" />
    } @else {
      <p class="font-heading mt-1 text-2xl font-semibold tabular-nums @xs:text-3xl">{{ display() }}</p>
    }
    @if (delta() !== undefined || hint()) {
      <p class="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        @if (delta() !== undefined && !loading()) {
          <span class="inline-flex items-center gap-0.5 font-medium" [class]="deltaClass()">
            <ng-icon [name]="delta()! >= 0 ? 'lucideTrendingUp' : 'lucideTrendingDown'" aria-hidden="true" />
            {{ deltaText() }}
          </span>
        }
        @if (hint()) {
          <span>{{ hint() }}</span>
        }
      </p>
    }
  `,
})
export class AppStatCard {
  readonly title = input.required<string>();
  readonly value = input<number | string | null>(null);
  readonly format = input<AppStatFormat>('number');
  readonly icon = input<string>();
  readonly tone = input<AppTone>('primary');
  readonly delta = input<number>();
  readonly invertDelta = input(false);
  /** Texto bajo el valor: "vs. mes anterior". */
  readonly hint = input<string>();
  readonly loading = input(false);

  protected readonly iconClass = computed(() => TONE_SOFT[this.tone()]);

  protected readonly display = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string' || this.format() === 'text') return String(v);
    if (this.format() === 'money') return formatMoney(v);
    if (this.format() === 'percent') return `${formatNumber(v)}%`;
    return formatNumber(v);
  });

  protected readonly deltaText = computed(() => {
    const d = this.delta() ?? 0;
    return `${d > 0 ? '+' : ''}${formatNumber(d)}%`;
  });

  protected readonly deltaClass = computed(() => {
    const d = this.delta() ?? 0;
    if (d === 0) return 'text-muted-foreground';
    const good = this.invertDelta() ? d < 0 : d > 0;
    return good ? 'text-success' : 'text-danger';
  });
}
