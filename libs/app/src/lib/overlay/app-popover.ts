import { ChangeDetectionStrategy, Component, Directive, computed, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@nova/ui/button';
import { HlmPopoverImports } from '@nova/ui/popover';
import { BrnTooltip, type BrnTooltipPosition, provideBrnTooltipDefaultOptions } from '@spartan-ng/brain/tooltip';
import { DEFAULT_TOOLTIP_CONTENT_CLASSES, DEFAULT_TOOLTIP_SVG_CLASS, tooltipPositionVariants } from '@nova/ui/tooltip';
import { hlm } from '@nova/ui/utils';
import type { AppButtonVariant } from '../primitives/app-button';

const VARIANT = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  link: 'link',
} as const;

/**
 * Panel flotante anclado a un botón (filtros rápidos, detalles).
 * El botón se configura con `label`/`icon`; el contenido se proyecta.
 */
@Component({
  selector: 'app-popover',
  imports: [HlmPopoverImports, HlmButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <hlm-popover [align]="align()" sideOffset="6" [state]="open() ? 'open' : 'closed'" (stateChanged)="open.set($event === 'open')">
      <button
        hlmPopoverTrigger
        hlmBtn
        type="button"
        [variant]="hlmVariant()"
        [size]="label() ? 'default' : 'icon'"
        [attr.aria-label]="label() ? null : ariaLabel()"
      >
        @if (icon()) {
          <ng-icon [name]="icon()!" [attr.data-icon]="label() ? 'inline-start' : null" />
        }
        {{ label() }}
      </button>
      <hlm-popover-content *hlmPopoverPortal="let ctx" [class]="widthClass()">
        @if (title()) {
          <p class="font-medium">{{ title() }}</p>
        }
        <ng-content />
      </hlm-popover-content>
    </hlm-popover>
  `,
})
export class AppPopover {
  readonly open = model(false);
  readonly label = input<string>();
  readonly icon = input<string>();
  /** Obligatorio si el botón es solo icono. */
  readonly ariaLabel = input<string>();
  readonly title = input<string>();
  readonly variant = input<AppButtonVariant>('outline');
  readonly align = input<'start' | 'center' | 'end'>('center');
  readonly width = input<'sm' | 'md' | 'lg'>('md');

  protected readonly hlmVariant = computed(() => VARIANT[this.variant()]);
  protected readonly widthClass = computed(() => ({ sm: 'w-56', md: 'w-72', lg: 'w-96' })[this.width()]);
}

/** Tooltip de texto: `<app-icon-button appTooltip="Editar" …>`. */
@Directive({
  selector: '[appTooltip]',
  providers: [
    provideBrnTooltipDefaultOptions({
      svgClasses: DEFAULT_TOOLTIP_SVG_CLASS,
      tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
      arrowClasses: (position: BrnTooltipPosition) => hlm(tooltipPositionVariants({ position })),
    }),
  ],
  hostDirectives: [{ directive: BrnTooltip, inputs: ['brnTooltip: appTooltip', 'position: appTooltipPosition'] }],
})
export class AppTooltip {}
