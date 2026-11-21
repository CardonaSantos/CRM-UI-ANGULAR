import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { HlmSheetImports } from '@nova/ui/sheet';

/**
 * Panel lateral (off-canvas). Controlado: `[(open)]="menuOpen"`.
 * En móvil lo usa el shell para el menú; en Fase 1 también filtros de `app-page`.
 */
@Component({
  selector: 'app-drawer',
  imports: [HlmSheetImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.title]': 'null', class: 'contents' },
  template: `
    <hlm-sheet [side]="side()" [state]="open() ? 'open' : 'closed'" (stateChanged)="open.set($event === 'open')">
      <hlm-sheet-content *hlmSheetPortal="let ctx" closeLabel="Cerrar" class="gap-0 p-0">
        <hlm-sheet-header class="border-b">
          <h2 hlmSheetTitle>{{ title() }}</h2>
        </hlm-sheet-header>
        <div class="min-h-0 flex-1 overflow-y-auto" [class.p-4]="padded()"><ng-content /></div>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class AppDrawer {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly side = input<'left' | 'right' | 'top' | 'bottom'>('left');
  /** Padding interno (formularios, detalle). El menú del shell va sin padding. */
  readonly padded = input(false);
}
