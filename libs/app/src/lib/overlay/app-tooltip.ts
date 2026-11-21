import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { BrnTooltip, type BrnTooltipPosition, provideBrnTooltipDefaultOptions } from '@spartan-ng/brain/tooltip';
import { DEFAULT_TOOLTIP_CONTENT_CLASSES, DEFAULT_TOOLTIP_SVG_CLASS, tooltipPositionVariants } from '@nova/ui/tooltip';
import { hlm } from '@nova/ui/utils';

/** Estilo de spartan para los tooltips del kit (lo comparten `appTooltip` y `app-icon-button`). */
export const provideAppTooltipOptions = () =>
  provideBrnTooltipDefaultOptions({
    svgClasses: DEFAULT_TOOLTIP_SVG_CLASS,
    tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
    arrowClasses: (position: BrnTooltipPosition) => hlm(tooltipPositionVariants({ position })),
  });

/**
 * Tooltip de texto: `<app-button appTooltip="Exportar a CSV">…</app-button>`.
 * `app-icon-button` ya muestra su `label` como tooltip; no hace falta ponérselo.
 */
@Directive({
  selector: '[appTooltip]',
  providers: [provideAppTooltipOptions()],
  hostDirectives: [{ directive: BrnTooltip, inputs: ['brnTooltip: appTooltip', 'position: appTooltipPosition'] }],
})
export class AppTooltip {
  constructor() {
    // El tooltip se ancla a la caja del host. Los botones del kit usan
    // `display: contents` (no tienen caja) y el tooltip saldría en la esquina
    // de la pantalla; en ese caso el host pasa a ocupar la caja del botón.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      if (getComputedStyle(host).display === 'contents') host.style.display = 'inline-flex';
    });
  }
}
