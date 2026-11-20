import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, computed, inject, input } from '@angular/core';
import { type Cell, FlexRender } from '@tanstack/angular-table';
import { EMPTY_VALUE, formatDate, formatDateTime, formatMoney, formatNumber } from '../core/format';
import { AppBadge } from '../feedback/app-badge';
import { AppDropdownMenu, type AppMenuItem } from '../primitives/app-dropdown-menu';
import type { AppColumnMeta, AppTableFeatures } from './table-features';

export interface AppCellContext<T> {
  $implicit: T;
  value: unknown;
}

/**
 * Celda personalizada por id de columna:
 * `<ng-template appCell="cliente" let-row>{{ row.nombre }}</ng-template>`.
 */
@Directive({ selector: 'ng-template[appCell]' })
export class AppCellDef {
  readonly column = input.required<string>({ alias: 'appCell' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly template = inject<TemplateRef<AppCellContext<any>>>(TemplateRef);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard(_dir: AppCellDef, ctx: unknown): ctx is AppCellContext<any> {
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCell = Cell<AppTableFeatures, any, unknown>;

/** Pinta una celda según su `meta.kind` (moneda, fecha, estado, acciones…). */
@Component({
  selector: 'app-table-cell',
  imports: [FlexRender, NgTemplateOutlet, AppBadge, AppDropdownMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (template(); as tpl) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: cell().row.original, value: value() }" />
    } @else {
      @switch (meta()?.kind) {
        @case ('money') {
          <span class="tabular-nums">{{ money() }}</span>
        }
        @case ('number') {
          <span class="tabular-nums">{{ number() }}</span>
        }
        @case ('date') {
          <span class="tabular-nums">{{ date() }}</span>
        }
        @case ('datetime') {
          <span class="tabular-nums">{{ dateTime() }}</span>
        }
        @case ('status') {
          @if (status(); as s) {
            <app-badge [tone]="s.tone" [dot]="true">{{ s.label }}</app-badge>
          } @else {
            <span class="text-muted-foreground">{{ empty }}</span>
          }
        }
        @case ('actions') {
          <app-dropdown-menu [items]="actions()" size="sm" />
        }
        @default {
          <ng-template [flexRenderCell]="cell()" let-v>{{ v ?? empty }}</ng-template>
        }
      }
    }
  `,
})
export class AppTableCell {
  readonly cell = input.required<AnyCell>();
  readonly template = input<TemplateRef<AppCellContext<unknown>>>();

  protected readonly empty = EMPTY_VALUE;
  protected readonly meta = computed(() => this.cell().column.columnDef.meta as AppColumnMeta | undefined);
  protected readonly value = computed(() => this.cell().getValue());
  protected readonly money = computed(() => formatMoney(this.value() as number | null));
  protected readonly number = computed(() => formatNumber(this.value() as number | null));
  protected readonly date = computed(() => formatDate(this.value() as Date | null));
  protected readonly dateTime = computed(() => formatDateTime(this.value() as Date | null));
  protected readonly status = computed(() => {
    const v = this.value();
    if (v === null || v === undefined || v === '') return null;
    const style = this.meta()?.status?.[String(v)];
    return { label: style?.label ?? String(v), tone: style?.tone ?? 'neutral' };
  });
  protected readonly actions = computed<readonly AppMenuItem[]>(() => {
    const fn = this.meta()?.actions as ((row: unknown) => readonly AppMenuItem[]) | undefined;
    return fn ? fn(this.cell().row.original) : [];
  });
}
