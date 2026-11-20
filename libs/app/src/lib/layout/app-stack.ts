import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva } from 'class-variance-authority';

export type AppGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const GAP: Record<AppGap, string> = { none: 'gap-0', xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };

export const stackVariants = cva('flex', {
  variants: {
    direction: { column: 'flex-col', row: 'flex-row flex-wrap' },
    align: { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' },
    justify: { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' },
  },
  defaultVariants: { direction: 'column', align: 'stretch', justify: 'start' },
});

/** Pila vertical (o fila con `direction="row"`) con separación por token. */
@Component({
  selector: 'app-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class AppStack {
  readonly gap = input<AppGap>('md');
  readonly direction = input<'column' | 'row'>('column');
  readonly align = input<'start' | 'center' | 'end' | 'stretch'>('stretch');
  readonly justify = input<'start' | 'center' | 'end' | 'between'>('start');

  protected readonly classes = computed(
    () => `${stackVariants({ direction: this.direction(), align: this.align(), justify: this.justify() })} ${GAP[this.gap()]}`,
  );
}

/** Fila horizontal alineada al centro (atajo de `app-stack direction="row"`). */
@Component({
  selector: 'app-inline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class AppInline {
  readonly gap = input<AppGap>('sm');
  readonly justify = input<'start' | 'center' | 'end' | 'between'>('start');

  protected readonly classes = computed(
    () => `${stackVariants({ direction: 'row', align: 'center', justify: this.justify() })} ${GAP[this.gap()]}`,
  );
}

export type GridCols = 1 | 2 | 3 | 4;
export interface ResponsiveCols {
  base?: GridCols;
  sm?: GridCols;
  md?: GridCols;
  lg?: GridCols;
  xl?: GridCols;
}

// Clases literales para que Tailwind las detecte.
const COLS = {
  base: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' },
  xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4' },
} as const;

/** Grid mobile-first: `[cols]="{ base: 1, md: 2, xl: 3 }"`. */
@Component({
  selector: 'app-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class AppGrid {
  readonly cols = input<ResponsiveCols>({ base: 1 });
  readonly gap = input<AppGap>('md');

  protected readonly classes = computed(() => {
    const cols = { base: 1, ...this.cols() } as ResponsiveCols;
    const parts = (Object.keys(COLS) as (keyof ResponsiveCols)[])
      .filter((bp) => cols[bp])
      .map((bp) => COLS[bp][cols[bp] as GridCols]);
    return ['grid', GAP[this.gap()], ...parts].join(' ');
  });
}
