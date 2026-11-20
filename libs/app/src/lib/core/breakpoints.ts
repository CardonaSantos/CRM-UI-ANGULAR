import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Breakpoints únicos del CRM (guía §7.1), alineados con Tailwind. */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

/**
 * Detección en TS, solo cuando CSS no alcanza (guía §7.3): p. ej. la tabla
 * cambia a cards o `app-page` mueve las acciones a un menú.
 */
@Injectable({ providedIn: 'root' })
export class Breakpoints {
  private readonly bo = inject(BreakpointObserver);

  private query(q: string) {
    return toSignal(this.bo.observe(q).pipe(map((r) => r.matches)), {
      initialValue: typeof matchMedia === 'function' ? matchMedia(q).matches : false,
    });
  }

  /** < md (768 px): técnico o cobrador en campo. */
  readonly isMobile = this.query(`(max-width: ${BREAKPOINTS.md - 0.02}px)`);
  /** ≥ lg (1024 px). */
  readonly isDesktop = this.query(`(min-width: ${BREAKPOINTS.lg}px)`);
}
