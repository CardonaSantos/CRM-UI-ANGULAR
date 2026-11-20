import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { HlmDialogImports } from '@nova/ui/dialog';
import { HlmSheetImports } from '@nova/ui/sheet';
import { Breakpoints } from '../core/breakpoints';

export type AppDialogSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<AppDialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/**
 * Diálogo controlado: `[(open)]="editando"`. En móvil (< md) se muestra como
 * hoja inferior (guía §7.2). Slots: contenido y `[appDialogFooter]`.
 */
@Component({
  selector: 'app-dialog',
  imports: [HlmDialogImports, HlmSheetImports, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <ng-template #header>
      <h2 class="font-heading text-lg leading-none font-semibold">{{ title() }}</h2>
      @if (description()) {
        <p class="text-muted-foreground text-sm">{{ description() }}</p>
      }
    </ng-template>
    <ng-template #body><ng-content /></ng-template>
    <ng-template #footer><ng-content select="[appDialogFooter]" /></ng-template>

    @if (bp.isMobile()) {
      <hlm-sheet side="bottom" [state]="state()" (stateChanged)="open.set($event === 'open')">
        <hlm-sheet-content *hlmSheetPortal="let ctx" closeLabel="Cerrar" class="max-h-[92dvh] gap-0 rounded-t-xl p-0">
          <hlm-sheet-header class="border-b"><ng-container *ngTemplateOutlet="header" /></hlm-sheet-header>
          <div class="min-h-0 flex-1 overflow-y-auto p-4"><ng-container *ngTemplateOutlet="body" /></div>
          <div class="flex flex-col-reverse gap-2 border-t p-4 empty:hidden">
            <ng-container *ngTemplateOutlet="footer" />
          </div>
        </hlm-sheet-content>
      </hlm-sheet>
    } @else {
      <hlm-dialog [state]="state()" (stateChanged)="open.set($event === 'open')">
        <hlm-dialog-content *hlmDialogPortal="let ctx" closeLabel="Cerrar" [class]="contentClass()">
          <div class="flex flex-col gap-1.5 pe-8"><ng-container *ngTemplateOutlet="header" /></div>
          <div class="-mx-4 max-h-[70vh] overflow-y-auto px-4"><ng-container *ngTemplateOutlet="body" /></div>
          <div class="flex justify-end gap-2 empty:hidden"><ng-container *ngTemplateOutlet="footer" /></div>
        </hlm-dialog-content>
      </hlm-dialog>
    }
  `,
})
export class AppDialog {
  protected readonly bp = inject(Breakpoints);

  readonly open = model(false);
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly size = input<AppDialogSize>('md');

  protected readonly state = computed(() => (this.open() ? 'open' : 'closed'));
  protected readonly contentClass = computed(() => `gap-4 ${SIZE[this.size()]}`);
}
