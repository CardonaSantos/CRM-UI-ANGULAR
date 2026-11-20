import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@nova/ui/button';
import { HlmDropdownMenuImports } from '@nova/ui/dropdown-menu';
import type { AppButtonSize, AppButtonVariant } from './app-button';

/** Acción de un menú. Los permisos se resuelven con `hidden`. */
export interface AppMenuItem {
  label: string;
  icon?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
  separatorBefore?: boolean;
  run: () => void;
}

const VARIANT = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  link: 'link',
} as const;

/**
 * Menú de acciones. Sin `label` el disparador es un botón de icono "⋯".
 * Las acciones vienen como datos (`items`), nunca como HTML suelto.
 */
@Component({
  selector: 'app-dropdown-menu',
  imports: [HlmDropdownMenuImports, HlmButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      hlmBtn
      type="button"
      [variant]="hlmVariant()"
      [size]="triggerSize()"
      [disabled]="disabled() || !visible().length"
      [hlmDropdownMenuTrigger]="menu"
      [align]="align()"
      [attr.aria-label]="label() ? null : ariaLabel()"
    >
      @if (triggerIcon(); as name) {
        <ng-icon [name]="name" [attr.data-icon]="label() ? 'inline-start' : null" />
      }
      @if (label()) {
        {{ label() }}
        <ng-icon name="lucideChevronDown" data-icon="inline-end" />
      }
    </button>
    <ng-template #menu>
      <hlm-dropdown-menu class="min-w-48">
        @if (title()) {
          <div hlmDropdownMenuLabel>{{ title() }}</div>
          <hlm-dropdown-menu-separator />
        }
        @for (item of visible(); track item.label) {
          @if (item.separatorBefore && !$first) {
            <hlm-dropdown-menu-separator />
          }
          <button
            hlmDropdownMenuItem
            type="button"
            [disabled]="!!item.disabled"
            [variant]="item.tone === 'danger' ? 'destructive' : 'default'"
            (triggered)="item.run()"
          >
            @if (item.icon) {
              <ng-icon [name]="item.icon" />
            }
            {{ item.label }}
          </button>
        }
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class AppDropdownMenu {
  readonly items = input.required<readonly AppMenuItem[]>();
  readonly label = input<string>();
  /** Icono del disparador; sin `label` usa "⋯" por defecto. */
  readonly icon = input<string>();
  readonly ariaLabel = input('Más acciones');
  readonly title = input<string>();
  readonly variant = input<AppButtonVariant>('ghost');
  readonly size = input<AppButtonSize>('md');
  readonly align = input<'start' | 'center' | 'end'>('end');
  readonly disabled = input(false);

  protected readonly triggerIcon = computed(() => this.icon() ?? (this.label() ? undefined : 'lucideEllipsis'));
  protected readonly visible = computed(() => this.items().filter((i) => !i.hidden));
  protected readonly hlmVariant = computed(() => VARIANT[this.variant()]);
  protected readonly triggerSize = computed(() => {
    const s = this.size();
    if (this.label()) return s === 'md' ? 'default' : s;
    return s === 'md' ? 'icon' : s === 'sm' ? 'icon-sm' : 'icon-lg';
  });
}
