import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { type ButtonVariants, HlmButton } from '@nova/ui/button';
import { HlmSpinner } from '@nova/ui/spinner';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
export type AppButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<AppButtonVariant, ButtonVariants['variant']> = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  link: 'link',
};

const SIZE: Record<AppButtonSize, ButtonVariants['size']> = { sm: 'sm', md: 'default', lg: 'lg' };

/**
 * Botón del kit. Las features nunca usan `<button>` ni `hlmBtn` directo.
 * Los iconos se pasan por nombre de Lucide (`lucidePlus`) y deben estar
 * registrados con `provideIcons` en la app o en el componente que lo usa.
 */
@Component({
  selector: 'app-button',
  imports: [HlmButton, NgIcon, HlmSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.contents]': '!block()', '[class.flex]': 'block()' },
  template: `
    <button
      hlmBtn
      [variant]="hlmVariant()"
      [size]="hlmSize()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [attr.aria-label]="ariaLabel()"
      [class.w-full]="block()"
    >
      @if (loading()) {
        <hlm-spinner data-icon="inline-start" />
      } @else if (leftIcon()) {
        <ng-icon [name]="leftIcon()!" data-icon="inline-start" />
      }
      <ng-content />
      @if (rightIcon() && !loading()) {
        <ng-icon [name]="rightIcon()!" data-icon="inline-end" />
      }
    </button>
  `,
})
export class AppButton {
  readonly variant = input<AppButtonVariant>('primary');
  readonly size = input<AppButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  /** Ocupa todo el ancho disponible. */
  readonly block = input(false);
  readonly leftIcon = input<string>();
  readonly rightIcon = input<string>();
  readonly ariaLabel = input<string>();

  protected readonly hlmVariant = computed(() => VARIANT[this.variant()]);
  protected readonly hlmSize = computed(() => SIZE[this.size()]);
}

/** Botón solo icono. `label` es obligatorio por accesibilidad. */
@Component({
  selector: 'app-icon-button',
  imports: [HlmButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <button
      hlmBtn
      [variant]="hlmVariant()"
      [size]="hlmSize()"
      type="button"
      [disabled]="disabled()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
    >
      <ng-icon [name]="icon()" />
    </button>
  `,
})
export class AppIconButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly variant = input<AppButtonVariant>('ghost');
  readonly size = input<AppButtonSize>('md');
  readonly disabled = input(false);

  protected readonly hlmVariant = computed(() => VARIANT[this.variant()]);
  protected readonly hlmSize = computed(() => ICON_SIZE[this.size()]);
}

const ICON_SIZE: Record<AppButtonSize, ButtonVariants['size']> = { sm: 'icon-sm', md: 'icon', lg: 'icon-lg' };
