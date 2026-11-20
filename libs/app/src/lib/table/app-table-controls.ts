import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@nova/ui/button';
import { HlmDropdownMenuImports } from '@nova/ui/dropdown-menu';
import { AppButton } from '../primitives/app-button';
import type { AnyAppTable } from './app-table-pagination';
import { columnLabel } from './table-export';

export type AppTableDensity = 'xs' | 'sm' | 'md';

/** Menú para mostrar u ocultar columnas (se persiste con `tableId`). */
@Component({
  selector: 'app-table-column-visibility',
  imports: [HlmDropdownMenuImports, HlmButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button hlmBtn variant="outline" size="icon" type="button" aria-label="Columnas visibles" title="Columnas" [hlmDropdownMenuTrigger]="menu" align="end">
      <ng-icon name="lucideColumns3" />
    </button>
    <ng-template #menu>
      <hlm-dropdown-menu class="min-w-48">
        <div hlmDropdownMenuLabel>Columnas visibles</div>
        <hlm-dropdown-menu-separator />
        @for (col of columns(); track col.id) {
          <button hlmDropdownMenuCheckbox type="button" [checked]="col.getIsVisible()" [keepOpen]="true" (triggered)="col.toggleVisibility()">
            <hlm-dropdown-menu-checkbox-indicator />
            {{ label(col) }}
          </button>
        }
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class AppTableColumnVisibility {
  readonly table = input.required<AnyAppTable>();

  protected readonly columns = computed(() => {
    this.table().atoms.columnVisibility.get();
    return this.table().getAllLeafColumns().filter((c) => c.getCanHide());
  });
  protected readonly label = columnLabel;
}

/** Selector de densidad de filas (compacta, normal, amplia). */
@Component({
  selector: 'app-table-density',
  imports: [HlmDropdownMenuImports, HlmButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button hlmBtn variant="outline" size="icon" type="button" aria-label="Densidad de filas" title="Densidad" [hlmDropdownMenuTrigger]="menu" align="end">
      <ng-icon name="lucideRows3" />
    </button>
    <ng-template #menu>
      <hlm-dropdown-menu class="min-w-40">
        <div hlmDropdownMenuLabel>Densidad</div>
        <hlm-dropdown-menu-separator />
        @for (opt of options; track opt.value) {
          <button hlmDropdownMenuRadio type="button" [checked]="value() === opt.value" (triggered)="value.set(opt.value)">
            <hlm-dropdown-menu-radio-indicator />
            {{ opt.label }}
          </button>
        }
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class AppTableDensityMenu {
  readonly value = model<AppTableDensity>('sm');
  protected readonly options: { value: AppTableDensity; label: string }[] = [
    { value: 'xs', label: 'Compacta' },
    { value: 'sm', label: 'Normal' },
    { value: 'md', label: 'Amplia' },
  ];
}

/** Botón de exportar. La tabla arma el archivo (CSV compatible con Excel). */
@Component({
  selector: 'app-table-export',
  imports: [AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <app-button variant="outline" leftIcon="lucideDownload" [loading]="loading()" (click)="export.emit()">
      <span class="hidden sm:inline">Exportar</span>
    </app-button>
  `,
})
export class AppTableExport {
  readonly loading = input(false);
  readonly export = output<void>();
}
