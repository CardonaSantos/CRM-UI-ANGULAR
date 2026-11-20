import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmSkeleton } from '@nova/ui/skeleton';
import { HlmSpinner } from '@nova/ui/spinner';
import { HlmProgress, HlmProgressIndicator } from '@nova/ui/progress';

/** Spinner con texto opcional. `block` lo centra en su contenedor. */
@Component({
  selector: 'app-loader',
  imports: [HlmSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[attr.aria-label]': 'label() || "Cargando"',
    '[class]': "block() ? 'flex w-full flex-col items-center justify-center gap-3 py-10 text-muted-foreground' : 'inline-flex items-center gap-2 text-muted-foreground'",
  },
  template: `
    <hlm-spinner [class]="spinnerClass()" />
    @if (label()) {
      <span class="text-sm">{{ label() }}</span>
    }
  `,
})
export class AppLoader {
  readonly label = input<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly block = input(false);

  protected readonly spinnerClass = computed(() => ({ sm: 'size-4', md: 'size-6', lg: 'size-10' })[this.size()]);
}

export type AppSkeletonShape = 'text' | 'title' | 'avatar' | 'block' | 'button';

const SHAPE: Record<AppSkeletonShape, string> = {
  text: 'h-4 w-full',
  title: 'h-6 w-2/3',
  avatar: 'size-10 rounded-full',
  block: 'h-24 w-full',
  button: 'h-9 w-24',
};

/** Marcador de carga. `lines` repite la forma (útil para párrafos). */
@Component({
  selector: 'app-skeleton',
  imports: [HlmSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full flex-col gap-2', 'aria-hidden': 'true' },
  template: `
    @for (i of items(); track i) {
      <hlm-skeleton class="bg-skeleton" [class]="shapeClass()" [class.w-4/5]="shape() === 'text' && $last && $count > 1" />
    }
  `,
})
export class AppSkeleton {
  readonly shape = input<AppSkeletonShape>('text');
  readonly lines = input(1);

  protected readonly items = computed(() => Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i));
  protected readonly shapeClass = computed(() => SHAPE[this.shape()]);
}

/** Barra de progreso (0–100) con etiqueta opcional. */
@Component({
  selector: 'app-progress',
  imports: [HlmProgress, HlmProgressIndicator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex w-full flex-col gap-1.5' },
  template: `
    @if (label()) {
      <div class="flex justify-between text-sm">
        <span>{{ label() }}</span>
        <span class="text-muted-foreground tabular-nums">{{ clamped() }}%</span>
      </div>
    }
    <hlm-progress [value]="clamped()" [attr.aria-label]="label() || 'Progreso'">
      <hlm-progress-indicator />
    </hlm-progress>
  `,
})
export class AppProgress {
  readonly value = input(0);
  readonly label = input<string>();

  protected readonly clamped = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}
