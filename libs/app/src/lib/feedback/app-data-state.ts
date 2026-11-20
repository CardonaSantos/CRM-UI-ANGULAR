import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
} from '@angular/core';
import { AppButton } from '../primitives/app-button';
import { AppAlert } from './app-alert';
import { AppEmptyState } from './app-empty-state';
import { AppSkeleton, type AppSkeletonShape } from './app-loader';

/**
 * Lo que `app-data-state` lee de una query de TanStack (`injectQuery`).
 * Estructural: cualquier objeto con estas señales sirve.
 */
export interface AppQueryLike<T = unknown> {
  isPending: () => boolean;
  isError: () => boolean;
  error: () => unknown;
  data: () => T | undefined;
  refetch?: () => unknown;
}

/** Plantilla del contenido listo: `<ng-template appDataReady let-data>`. */
@Directive({ selector: 'ng-template[appDataReady]' })
export class AppDataReady {
  readonly template = inject<TemplateRef<{ $implicit: unknown }>>(TemplateRef);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard(_dir: AppDataReady, ctx: unknown): ctx is { $implicit: any } {
    return true;
  }
}

/** Vacío por defecto: null, [] o un paginado `{ items: [] }` / `{ data: [] }`. */
export function isEmptyData(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') {
    const page = data as { items?: unknown; data?: unknown };
    if (Array.isArray(page.items)) return page.items.length === 0;
    if (Array.isArray(page.data)) return page.data.length === 0;
  }
  return false;
}

/** Mensaje legible de un error HTTP de NestJS. */
export function errorMessage(error: unknown): string {
  const e = error as { error?: { message?: string | string[] }; message?: string } | null;
  const msg = e?.error?.message ?? e?.message;
  return Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Ocurrió un error inesperado.');
}

/**
 * Único lugar donde se resuelven carga, error, vacío y éxito (guía §8.4).
 * Con `[query]` lee la query; sin ella, usa `loading`, `error` y `empty`.
 */
@Component({
  selector: 'app-data-state',
  imports: [NgTemplateOutlet, AppSkeleton, AppAlert, AppEmptyState, AppButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full', '[attr.aria-busy]': "status() === 'loading' || null" },
  template: `
    @switch (status()) {
      @case ('loading') {
        <app-skeleton [shape]="loadingShape()" [lines]="loadingLines()" />
      }
      @case ('error') {
        <app-alert tone="danger" [title]="errorTitle()">
          {{ errorText() }}
          @if (canRetry()) {
            <app-button appAlertActions variant="outline" size="sm" leftIcon="lucideRotateCcw" (click)="onRetry()">
              Reintentar
            </app-button>
          }
        </app-alert>
      }
      @case ('empty') {
        <app-empty-state [title]="emptyTitle()" [description]="emptyDescription()" [icon]="emptyIcon()">
          <ng-content select="[appEmptyActions]" ngProjectAs="[appEmptyActions]" />
        </app-empty-state>
      }
      @default {
        @if (ready(); as tpl) {
          <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: data() }" />
        }
        <ng-content />
      }
    }
  `,
})
export class AppDataState {
  readonly query = input<AppQueryLike>();
  readonly loading = input(false);
  readonly error = input<unknown>(null);
  /** Fuerza el estado vacío; por defecto se deduce de los datos. */
  readonly empty = input<boolean>();

  readonly loadingShape = input<AppSkeletonShape>('text');
  readonly loadingLines = input(3);
  readonly errorTitle = input('No se pudo cargar la información');
  readonly emptyTitle = input('Sin resultados');
  readonly emptyDescription = input<string>();
  readonly emptyIcon = input('lucideInbox');

  /** Muestra "Reintentar" en el error. */
  readonly retryable = input(true);
  /** Se emite al pulsar "Reintentar" cuando no hay query. */
  readonly retry = output<void>();

  protected readonly ready = contentChild(AppDataReady);
  protected readonly data = computed(() => this.query()?.data());

  private readonly errorValue = computed(() => {
    const q = this.query();
    return q ? (q.isError() ? (q.error() ?? true) : null) : this.error();
  });

  readonly status = computed<'loading' | 'error' | 'empty' | 'ready'>(() => {
    const q = this.query();
    if (q ? q.isPending() : this.loading()) return 'loading';
    if (this.errorValue()) return 'error';
    const empty = this.empty() ?? (q ? isEmptyData(q.data()) : false);
    return empty ? 'empty' : 'ready';
  });

  protected readonly errorText = computed(() => errorMessage(this.errorValue()));
  protected readonly canRetry = computed(() => this.retryable() && (!this.query() || !!this.query()?.refetch));

  protected onRetry(): void {
    const q = this.query();
    if (q?.refetch) q.refetch();
    else this.retry.emit();
  }
}
