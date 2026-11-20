import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmEmptyImports } from '@nova/ui/empty';

/** Estado vacío: icono, título, descripción y acciones (`[appEmptyActions]`). */
@Component({
  selector: 'app-empty-state',
  imports: [HlmEmptyImports, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div hlmEmpty [class.py-6]="size() === 'sm'" [class.border]="bordered()" [class.border-dashed]="bordered()">
      <div hlmEmptyHeader>
        <div hlmEmptyMedia variant="icon"><ng-icon [name]="icon()" /></div>
        <h3 hlmEmptyTitle>{{ title() }}</h3>
        @if (description()) {
          <p hlmEmptyDescription>{{ description() }}</p>
        }
      </div>
      <div hlmEmptyContent class="empty:hidden"><ng-content select="[appEmptyActions]" /></div>
    </div>
  `,
})
export class AppEmptyState {
  readonly title = input('Sin resultados');
  readonly description = input<string>();
  readonly icon = input('lucideInbox');
  readonly size = input<'sm' | 'md'>('md');
  readonly bordered = input(false);
}
