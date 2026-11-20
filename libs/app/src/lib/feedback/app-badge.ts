import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { cva } from 'class-variance-authority';
import { TONE_DOT, TONE_OUTLINE, TONE_SOFT, TONE_SOLID, TONE_TEXT, type AppTone } from '../core/tone';

export type AppBadgeAppearance = 'soft' | 'solid' | 'outline';
export type AppBadgeSize = 'sm' | 'md';

const badge = cva('inline-flex w-fit shrink-0 items-center gap-1 rounded-full border font-medium whitespace-nowrap', {
  variants: {
    size: { sm: 'h-5 px-2 text-xs', md: 'h-6 px-2.5 text-sm' },
    appearance: { soft: 'border-transparent', solid: 'border-transparent', outline: 'bg-transparent' },
  },
});

const APPEARANCE: Record<AppBadgeAppearance, Record<AppTone, string>> = {
  soft: TONE_SOFT,
  solid: TONE_SOLID,
  outline: TONE_OUTLINE,
};

/** Etiqueta de estado. `tone` da el significado; nunca colores sueltos. */
@Component({
  selector: 'app-badge',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `
    @if (dot()) {
      <span class="size-1.5 rounded-full" [class]="dotClass()" aria-hidden="true"></span>
    } @else if (icon()) {
      <ng-icon [name]="icon()!" size="0.875em" aria-hidden="true" />
    }
    <ng-content />
  `,
})
export class AppBadge {
  readonly tone = input<AppTone>('neutral');
  readonly appearance = input<AppBadgeAppearance>('soft');
  readonly size = input<AppBadgeSize>('sm');
  readonly icon = input<string>();
  /** Punto de color a la izquierda (estado en vivo). */
  readonly dot = input(false);

  protected readonly classes = computed(
    () => `${badge({ size: this.size(), appearance: this.appearance() })} ${APPEARANCE[this.appearance()][this.tone()]}`,
  );
  protected readonly dotClass = computed(() =>
    this.appearance() === 'solid' ? 'bg-current' : TONE_DOT[this.tone()],
  );
}

/** Punto de estado con etiqueta opcional ("En línea", "Pendiente"). */
@Component({
  selector: 'app-status-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-2 text-sm', role: 'status' },
  template: `
    <span class="relative flex size-2.5 shrink-0" aria-hidden="true">
      @if (pulse()) {
        <span class="absolute inline-flex size-full animate-ping rounded-full opacity-60" [class]="dot()"></span>
      }
      <span class="relative inline-flex size-2.5 rounded-full" [class]="dot()"></span>
    </span>
    @if (label()) {
      <span [class]="muted() ? textClass() : 'text-foreground'">{{ label() }}</span>
    }
  `,
})
export class AppStatusDot {
  readonly tone = input<AppTone>('neutral');
  readonly label = input<string>();
  readonly pulse = input(false);
  /** Colorea el texto con el tono en vez del color normal. */
  readonly muted = input(false);

  protected readonly dot = computed(() => TONE_DOT[this.tone()]);
  protected readonly textClass = computed(() => TONE_TEXT[this.tone()]);
}
