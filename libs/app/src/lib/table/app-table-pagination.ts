import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AngularTable } from '@tanstack/angular-table';
import { formatNumber } from '../core/format';
import { AppSelect } from '../form/app-select';
import { AppIconButton } from '../primitives/app-button';
import type { AppTableFeatures } from './table-features';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAppTable = AngularTable<AppTableFeatures, any>;

/** Pie de tabla: rango mostrado, tamaño de página y navegación. */
@Component({
  selector: 'app-table-pagination',
  imports: [AppSelect, AppIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-center justify-between gap-3 text-sm' },
  template: `
    <p class="text-muted-foreground tabular-nums" aria-live="polite">{{ range() }}</p>
    <div class="flex items-center gap-2">
      <div class="hidden items-center gap-2 sm:flex">
        <span class="text-muted-foreground">Filas</span>
        <app-select
          class="w-20"
          [options]="sizeOptions()"
          [value]="pageSize()"
          (valueChange)="table().setPageSize($event ?? pageSize())"
          inputId="page-size"
        />
      </div>
      <span class="text-muted-foreground px-1 tabular-nums">{{ pageLabel() }}</span>
      <app-icon-button icon="lucideChevronsLeft" label="Primera página" variant="outline" size="sm" [disabled]="!canPrev()" (click)="table().firstPage()" class="hidden sm:contents" />
      <app-icon-button icon="lucideChevronLeft" label="Página anterior" variant="outline" size="sm" [disabled]="!canPrev()" (click)="table().previousPage()" />
      <app-icon-button icon="lucideChevronRight" label="Página siguiente" variant="outline" size="sm" [disabled]="!canNext()" (click)="table().nextPage()" />
      <app-icon-button icon="lucideChevronsRight" label="Última página" variant="outline" size="sm" [disabled]="!canNext()" (click)="table().lastPage()" class="hidden sm:contents" />
    </div>
  `,
})
export class AppTablePagination {
  readonly table = input.required<AnyAppTable>();
  readonly pageSizes = input<readonly number[]>([10, 25, 50, 100]);

  private readonly state = computed(() => this.table().atoms.pagination.get());
  protected readonly pageSize = computed(() => this.state().pageSize);
  protected readonly sizeOptions = computed(() => this.pageSizes().map((n) => ({ value: n, label: String(n) })));
  protected readonly canPrev = computed(() => (this.state(), this.table().getCanPreviousPage()));
  protected readonly canNext = computed(() => (this.state(), this.table().getCanNextPage()));

  protected readonly pageLabel = computed(() => {
    const { pageIndex } = this.state();
    return `${pageIndex + 1} / ${Math.max(this.table().getPageCount(), 1)}`;
  });

  protected readonly range = computed(() => {
    const { pageIndex, pageSize } = this.state();
    const total = this.table().getRowCount();
    if (!total) return 'Sin registros';
    const from = pageIndex * pageSize + 1;
    const to = Math.min(total, from + pageSize - 1);
    return `${formatNumber(from)}–${formatNumber(to)} de ${formatNumber(total)}`;
  });
}
