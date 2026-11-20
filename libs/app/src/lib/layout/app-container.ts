import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmSeparator } from '@nova/ui/separator';

export type AppContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const MAX: Record<AppContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

/** Ancho máximo centrado con padding lateral responsive. */
@Component({
  selector: 'app-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class AppContainer {
  readonly size = input<AppContainerSize>('xl');
  readonly padded = input(true);

  protected readonly classes = computed(
    () => `mx-auto block w-full ${MAX[this.size()]} ${this.padded() ? 'px-4 md:px-6' : ''}`,
  );
}

/** Separador horizontal o vertical, con etiqueta opcional ("o"). */
@Component({
  selector: 'app-separator',
  imports: [HlmSeparator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "orientation() === 'vertical' ? 'flex self-stretch' : 'flex w-full items-center gap-3'",
  },
  template: `
    @if (label() && orientation() === 'horizontal') {
      <hlm-separator class="flex-1" />
      <span class="text-muted-foreground text-xs uppercase">{{ label() }}</span>
      <hlm-separator class="flex-1" />
    } @else {
      <hlm-separator [orientation]="orientation()" />
    }
  `,
})
export class AppSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly label = input<string>();
}

/** Agrupa `app-button` / `app-icon-button` pegados (segmentos, acciones compactas). */
@Component({
  selector: 'app-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    class:
      'flex w-fit items-stretch [&>*:not(:first-child)>button]:rounded-s-none [&>*:not(:first-child)>button]:border-s-0 [&>*:not(:last-child)>button]:rounded-e-none',
  },
  template: `<ng-content />`,
})
export class AppButtonGroup {
  readonly ariaLabel = input<string>();
}
