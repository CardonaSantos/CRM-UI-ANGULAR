import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AppButton,
  type AppButtonVariant,
  AppButtonGroup,
  AppDropdownMenu,
  AppIconButton,
  AppInline,
  type AppMenuItem,
  AppSection,
  AppStack,
  AppToast,
  AppTooltip,
} from '@nova/app';

/** Catálogo: acciones (app-button, icon-button, button-group, dropdown, tooltip). */
@Component({
  selector: 'nv-catalog-actions',
  imports: [AppSection, AppStack, AppInline, AppButton, AppIconButton, AppButtonGroup, AppDropdownMenu, AppTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section title="app-button" description="Variantes, tamaños, iconos y carga">
        <app-inline>
          @for (v of variants; track v) {
            <app-button [variant]="v">{{ v }}</app-button>
          }
        </app-inline>
        <app-inline>
          <app-button size="sm">Pequeño</app-button>
          <app-button size="md">Mediano</app-button>
          <app-button size="lg">Grande</app-button>
          <app-button leftIcon="lucidePlus">Nuevo cliente</app-button>
          <app-button variant="outline" rightIcon="lucideArrowRight">Siguiente</app-button>
          <app-button [loading]="loading()" (click)="simulate()">Guardar</app-button>
          <app-button [disabled]="true">Deshabilitado</app-button>
        </app-inline>
      </app-section>

      <app-section title="app-icon-button + appTooltip" description="Solo icono; la etiqueta es obligatoria (accesibilidad)">
        <app-inline>
          <app-icon-button icon="lucidePencil" label="Editar" appTooltip="Editar" />
          <app-icon-button icon="lucideTrash2" label="Eliminar" variant="outline" appTooltip="Eliminar" />
          <app-icon-button icon="lucidePrinter" label="Imprimir" variant="secondary" size="sm" />
          <app-icon-button icon="lucideRefreshCw" label="Actualizar" variant="primary" size="lg" />
        </app-inline>
      </app-section>

      <app-section title="app-button-group" description="Acciones pegadas">
        <app-button-group ariaLabel="Periodo">
          <app-button variant="outline">Día</app-button>
          <app-button variant="outline">Semana</app-button>
          <app-button variant="outline">Mes</app-button>
        </app-button-group>
      </app-section>

      <app-section title="app-dropdown-menu" description="Acciones como datos; hidden resuelve los permisos">
        <app-inline>
          <app-dropdown-menu [items]="menu" />
          <app-dropdown-menu [items]="menu" label="Acciones" variant="outline" align="start" title="Cliente 1024" />
        </app-inline>
      </app-section>
    </app-stack>
  `,
})
export class CatalogActions {
  private readonly toast = inject(AppToast);

  protected readonly variants: AppButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'];
  protected readonly loading = signal(false);

  protected readonly menu: AppMenuItem[] = [
    { label: 'Ver perfil', icon: 'lucideEye', run: () => this.toast.info('Ver perfil') },
    { label: 'Editar', icon: 'lucidePencil', run: () => this.toast.info('Editar') },
    { label: 'Acción sin permiso', hidden: true, run: () => undefined },
    { label: 'Deshabilitada', icon: 'lucideLock', disabled: true, run: () => undefined },
    { label: 'Eliminar', icon: 'lucideTrash2', tone: 'danger', separatorBefore: true, run: () => this.toast.error('Eliminar') },
  ];

  protected simulate(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
