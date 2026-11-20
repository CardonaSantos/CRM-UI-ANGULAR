import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@nova/ui/avatar';
import { type DateInput, EMPTY_VALUE, formatDate, formatDateTime, formatMoney, initials } from '../core/format';
import { TONE_DOT, TONE_SOFT, type AppTone } from '../core/tone';

/** Avatar con foto o iniciales. */
@Component({
  selector: 'app-avatar',
  imports: [HlmAvatarImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <hlm-avatar [size]="hlmSize()">
      @if (src()) {
        <img hlmAvatarImage [src]="src()" [alt]="name()" />
      }
      <span hlmAvatarFallback class="bg-primary-soft text-primary-soft-foreground font-medium">{{ letters() }}</span>
    </hlm-avatar>
  `,
})
export class AppAvatar {
  readonly name = input.required<string>();
  readonly src = input<string | null>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly letters = computed(() => initials(this.name()));
  protected readonly hlmSize = computed(() => (({ sm: 'sm', md: 'default', lg: 'lg' }) as const)[this.size()]);
}

export interface AppTimelineItem {
  title: string;
  description?: string;
  date?: DateInput;
  tone?: AppTone;
  icon?: string;
}

/** Historial vertical (seguimiento de ticket, bitácora de cliente). */
@Component({
  selector: 'app-timeline',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ol class="relative flex flex-col gap-5 ps-1">
      @for (item of items(); track $index) {
        <li class="relative flex gap-3">
          @if (!$last) {
            <span class="bg-border absolute start-3.5 top-8 -bottom-5 w-px" aria-hidden="true"></span>
          }
          @if (item.icon) {
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full" [class]="soft(item.tone)">
              <ng-icon [name]="item.icon" size="0.875rem" aria-hidden="true" />
            </span>
          } @else {
            <span class="flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
              <span class="size-2.5 rounded-full" [class]="dot(item.tone)"></span>
            </span>
          }
          <div class="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
              <p class="text-sm font-medium">{{ item.title }}</p>
              @if (item.date) {
                <time class="text-muted-foreground text-xs tabular-nums">{{ when(item.date) }}</time>
              }
            </div>
            @if (item.description) {
              <p class="text-muted-foreground text-sm">{{ item.description }}</p>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class AppTimeline {
  readonly items = input.required<readonly AppTimelineItem[]>();

  protected soft(tone: AppTone = 'neutral') {
    return TONE_SOFT[tone];
  }
  protected dot(tone: AppTone = 'neutral') {
    return TONE_DOT[tone];
  }
  protected readonly when = formatDateTime;
}

export type AppKeyValueKind = 'text' | 'money' | 'date' | 'datetime';

export interface AppKeyValueItem {
  label: string;
  value: string | number | Date | null | undefined;
  kind?: AppKeyValueKind;
  /** Ocupa toda la fila (direcciones, observaciones). */
  wide?: boolean;
}

/** Lista de datos etiqueta → valor (ficha de cliente, detalle de factura). */
@Component({
  selector: 'app-key-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block' },
  template: `
    <dl class="grid grid-cols-1 gap-x-6 gap-y-4" [class]="colsClass()">
      @for (item of items(); track item.label) {
        <div class="flex min-w-0 flex-col gap-0.5" [class.col-span-full]="item.wide">
          <dt class="text-muted-foreground text-xs font-medium tracking-wide uppercase">{{ item.label }}</dt>
          <dd class="text-sm break-words" [class.tabular-nums]="item.kind && item.kind !== 'text'">{{ show(item) }}</dd>
        </div>
      }
    </dl>
  `,
})
export class AppKeyValue {
  readonly items = input.required<readonly AppKeyValueItem[]>();
  readonly columns = input<1 | 2 | 3>(2);

  protected readonly colsClass = computed(
    () => ({ 1: '', 2: '@md:grid-cols-2', 3: '@md:grid-cols-2 @3xl:grid-cols-3' })[this.columns()],
  );

  protected show(item: AppKeyValueItem): string {
    const v = item.value;
    if (v === null || v === undefined || v === '') return EMPTY_VALUE;
    switch (item.kind) {
      case 'money':
        return formatMoney(v as number);
      case 'date':
        return formatDate(v as DateInput);
      case 'datetime':
        return formatDateTime(v as DateInput);
      default:
        return v instanceof Date ? formatDate(v) : String(v);
    }
  }
}

/** Bloque monoespaciado (JSON, logs de MikroTik/OLT, respuestas de API). */
@Component({
  selector: 'app-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `<pre class="bg-muted max-h-96 overflow-auto rounded-lg p-3 font-mono text-xs leading-relaxed">{{ text() }}</pre>`,
})
export class AppCode {
  /** Texto u objeto (se serializa como JSON con sangría). */
  readonly value = input<unknown>('');

  protected readonly text = computed(() => {
    const v = this.value();
    return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  });
}
