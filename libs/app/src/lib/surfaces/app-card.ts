import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmCardImports } from '@nova/ui/card';

export type AppCardWidth = 'sm' | 'md' | 'lg' | 'full';

const WIDTH: Record<AppCardWidth, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-2xl',
  full: 'w-full',
};

/**
 * Tarjeta con título, descripción, contenido y nota al pie opcionales.
 * Slots: `[appCardActions]` (cabecera, a la derecha) y el contenido por defecto.
 */
@Component({
  selector: 'app-card',
  imports: [HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    <section hlmCard [size]="size() === 'sm' ? 'sm' : 'default'">
      @if (title() || description()) {
        <div hlmCardHeader>
          @if (title()) {
            <h2 hlmCardTitle>{{ title() }}</h2>
          }
          @if (description()) {
            <p hlmCardDescription>{{ description() }}</p>
          }
          <div hlmCardAction><ng-content select="[appCardActions]" /></div>
        </div>
      }
      <div hlmCardContent><ng-content /></div>
      @if (footnote()) {
        <p class="text-muted-foreground px-(--card-spacing) text-center text-sm">{{ footnote() }}</p>
      }
    </section>
  `,
})
export class AppCard {
  readonly title = input<string>();
  readonly description = input<string>();
  readonly footnote = input<string>();
  readonly size = input<'sm' | 'md'>('md');
  readonly width = input<AppCardWidth>('full');

  protected readonly hostClass = computed(() => `block ${WIDTH[this.width()]}`);
}
