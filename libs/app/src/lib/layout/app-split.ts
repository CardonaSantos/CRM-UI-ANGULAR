import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Dos columnas: lateral (`[appSplitAside]`) + principal (contenido por defecto).
 * En móvil y tablet se apila en vertical (guía §7.2); desde `lg`, 1/3 + 2/3.
 */
@Component({
  selector: 'app-split',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid grid-cols-1 gap-6 lg:grid-cols-3', '[attr.data-aside]': 'aside()' },
  template: `
    <div class="min-w-0" [class.lg:order-last]="aside() === 'end'"><ng-content select="[appSplitAside]" /></div>
    <div class="flex min-w-0 flex-col gap-6 lg:col-span-2"><ng-content /></div>
  `,
})
export class AppSplit {
  readonly aside = input<'start' | 'end'>('start');
}
