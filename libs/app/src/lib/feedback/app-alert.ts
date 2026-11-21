import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@nova/ui/button';

export type AppAlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE: Record<AppAlertTone, { box: string; icon: string; defaultIcon: string }> = {
  neutral: {
    box: 'bg-alert-neutral border-alert-neutral-border text-alert-neutral-foreground',
    icon: 'text-muted-foreground',
    defaultIcon: 'lucideInfo',
  },
  info: {
    box: 'bg-alert-info border-alert-info-border text-alert-info-foreground',
    icon: 'text-info',
    defaultIcon: 'lucideInfo',
  },
  success: {
    box: 'bg-alert-success border-alert-success-border text-alert-success-foreground',
    icon: 'text-success',
    defaultIcon: 'lucideCircleCheck',
  },
  warning: {
    box: 'bg-alert-warning border-alert-warning-border text-alert-warning-foreground',
    icon: 'text-warning',
    defaultIcon: 'lucideTriangleAlert',
  },
  danger: {
    box: 'bg-alert-danger border-alert-danger-border text-alert-danger-foreground',
    icon: 'text-danger',
    defaultIcon: 'lucideCircleAlert',
  },
};

/**
 * Mensaje en línea. Slot `[appAlertActions]` para botones.
 * Con `dismissible` muestra la X y emite `dismissed`; ocultarlo es del padre.
 */
@Component({
  selector: 'app-alert',
  imports: [NgIcon, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // `title` es un input: sin esto queda como atributo y el navegador
    // muestra un tooltip nativo sobre todo el componente.
    '[attr.title]': 'null',
    '[class]': 'boxClass()',
    '[attr.role]': "tone() === 'danger' || tone() === 'warning' ? 'alert' : 'status'",
  },
  template: `
    <ng-icon [name]="iconName()" class="mt-0.5 shrink-0" [class]="iconClass()" size="1.125rem" aria-hidden="true" />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      @if (title()) {
        <p class="leading-tight font-semibold">{{ title() }}</p>
      }
      <div class="text-sm leading-snug opacity-90"><ng-content /></div>
      <div class="flex flex-wrap gap-2 empty:hidden"><ng-content select="[appAlertActions]" /></div>
    </div>
    @if (dismissible()) {
      <button hlmBtn variant="ghost" size="icon-xs" type="button" aria-label="Cerrar" (click)="dismissed.emit()">
        <ng-icon name="lucideX" />
      </button>
    }
  `,
})
export class AppAlert {
  readonly tone = input<AppAlertTone>('neutral');
  readonly title = input<string>();
  readonly icon = input<string>();
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected readonly boxClass = computed(
    () => `flex w-full min-w-0 items-start gap-3 rounded-lg border p-3 ${TONE[this.tone()].box}`,
  );
  protected readonly iconClass = computed(() => TONE[this.tone()].icon);
  protected readonly iconName = computed(() => this.icon() ?? TONE[this.tone()].defaultIcon);
}
