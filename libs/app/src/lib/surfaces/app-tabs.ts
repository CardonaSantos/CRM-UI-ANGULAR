import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { BrnAccordion, BrnAccordionItem } from '@spartan-ng/brain/accordion';
import { HlmAccordionContent, HlmAccordionTrigger } from '@nova/ui/accordion';
import { HlmTabsImports } from '@nova/ui/tabs';

export interface AppTabItem {
  id: string;
  label: string;
  icon?: string;
  /** Contador opcional (p. ej. tickets abiertos). */
  badge?: number | string;
  disabled?: boolean;
  hidden?: boolean;
}

/** Contenido de una pestaña: `<ng-template appTab="pagos">…</ng-template>`. Se crea solo al activarla. */
@Directive({ selector: 'ng-template[appTab]' })
export class AppTab {
  readonly id = input.required<string>({ alias: 'appTab' });
  readonly template = inject(TemplateRef);
}

/**
 * Pestañas controladas: `[tabs]` + `[(value)]`. En móvil la lista hace scroll
 * horizontal (guía §7.2). `variant="line"` para fichas de detalle.
 */
@Component({
  selector: 'app-tabs',
  imports: [HlmTabsImports, NgTemplateOutlet, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full min-w-0' },
  template: `
    <hlm-tabs [tab]="active()" (tabActivated)="value.set($event)" class="w-full gap-4">
      <div class="-mx-1 overflow-x-auto px-1 pb-1">
        <hlm-tabs-list [variant]="variant()" [attr.aria-label]="ariaLabel()">
          @for (tab of visible(); track tab.id) {
            <button [hlmTabsTrigger]="tab.id" [disabled]="!!tab.disabled" type="button">
              @if (tab.icon) {
                <ng-icon [name]="tab.icon" />
              }
              {{ tab.label }}
              @if (tab.badge !== undefined && tab.badge !== null) {
                <span class="bg-muted text-muted-foreground rounded-full px-1.5 text-xs tabular-nums">{{ tab.badge }}</span>
              }
            </button>
          }
        </hlm-tabs-list>
      </div>
      @for (tab of visible(); track tab.id) {
        <div [hlmTabsContent]="tab.id" class="min-w-0">
          @if (tab.id === active()) {
            @if (templateFor(tab.id); as tpl) {
              <ng-container *ngTemplateOutlet="tpl" />
            }
          }
        </div>
      }
    </hlm-tabs>
  `,
})
export class AppTabs {
  readonly tabs = input.required<readonly AppTabItem[]>();
  readonly value = model<string>();
  readonly variant = input<'default' | 'line'>('default');
  readonly ariaLabel = input<string>();
  /** Paneles declarados fuera (los reenvía `app-detail-layout`). */
  readonly panels = input<readonly AppTab[]>([]);

  private readonly ownPanels = contentChildren(AppTab);
  protected readonly visible = computed(() => this.tabs().filter((t) => !t.hidden));
  protected readonly active = computed(() => {
    const v = this.value();
    const tabs = this.visible();
    const current = tabs.find((t) => t.id === v);
    return current?.id ?? tabs.find((t) => !t.disabled)?.id ?? '';
  });

  protected templateFor(id: string): TemplateRef<unknown> | undefined {
    return [...this.ownPanels(), ...this.panels()].find((p) => p.id() === id)?.template;
  }
}

/**
 * Secciones plegables. `type="multiple"` deja abrir varias a la vez.
 * Uso: `<app-accordion><app-accordion-item title="Datos">…</app-accordion-item></app-accordion>`.
 */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: BrnAccordion, inputs: ['type'] }],
  host: { 'data-slot': 'accordion', class: 'flex w-full flex-col' },
  template: `<ng-content />`,
})
export class AppAccordion {}

@Component({
  selector: 'app-accordion-item',
  imports: [HlmAccordionTrigger, HlmAccordionContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: BrnAccordionItem, inputs: ['isOpened: opened', 'disabled'] }],
  host: { 'data-slot': 'accordion-item', class: 'flex flex-col not-last:border-b' },
  template: `
    <hlm-accordion-trigger>{{ title() }}</hlm-accordion-trigger>
    <hlm-accordion-content><ng-content /></hlm-accordion-content>
  `,
})
export class AppAccordionItem {
  readonly title = input.required<string>();
}
