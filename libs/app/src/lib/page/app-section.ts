import { ChangeDetectionStrategy, Component, computed, contentChildren, input, model } from '@angular/core';
import { AppTab, AppTabs, type AppTabItem } from '../surfaces/app-tabs';

/**
 * Bloque titulado dentro de una página o un formulario largo.
 * Slots: `[appSectionActions]` y el contenido por defecto.
 */
@Component({
  selector: 'app-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.title]': 'null', '[class]': 'hostClass()' },
  template: `
    @if (title()) {
      <header class="flex flex-wrap items-start justify-between gap-2">
        <div class="flex min-w-0 flex-col gap-0.5">
          <h2 class="font-heading text-base font-semibold">{{ title() }}</h2>
          @if (description()) {
            <p class="text-muted-foreground text-sm">{{ description() }}</p>
          }
        </div>
        <div class="flex items-center gap-2 empty:hidden"><ng-content select="[appSectionActions]" /></div>
      </header>
    }
    <ng-content />
  `,
})
export class AppSection {
  readonly title = input<string>();
  readonly description = input<string>();
  /** `card`: con fondo y borde; `plain`: solo separación. */
  readonly appearance = input<'card' | 'plain'>('card');

  protected readonly hostClass = computed(
    () =>
      `flex min-w-0 flex-col gap-4 ${this.appearance() === 'card' ? 'rounded-xl border bg-card p-4 text-card-foreground shadow-xs md:p-6' : ''}`,
  );
}

/**
 * Ficha de detalle (guía §5.2): resumen a la izquierda (`[appDetailSummary]`)
 * y pestañas a la derecha. En móvil el resumen va arriba.
 * Cada pestaña: `<ng-template appTab="pagos">…</ng-template>`.
 */
@Component({
  selector: 'app-detail-layout',
  imports: [AppTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr]' },
  template: `
    <aside class="flex min-w-0 flex-col gap-4"><ng-content select="[appDetailSummary]" /></aside>
    <div class="min-w-0">
      @if (tabs().length) {
        <app-tabs [tabs]="tabs()" [(value)]="tab" variant="line" [ariaLabel]="ariaLabel()" [panels]="panels()" />
      }
      <ng-content />
    </div>
  `,
})
export class AppDetailLayout {
  readonly tabs = input<readonly AppTabItem[]>([]);
  readonly tab = model<string>();
  readonly ariaLabel = input('Secciones');
  protected readonly panels = contentChildren(AppTab);
}
