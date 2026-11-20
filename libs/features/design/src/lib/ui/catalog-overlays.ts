import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import {
  AppButton,
  AppConfirm,
  AppDialog,
  AppDrawer,
  AppField,
  AppInline,
  AppInput,
  AppKeyValue,
  AppPopover,
  AppSection,
  AppStack,
  AppSwitch,
  AppToast,
} from '@nova/app';

/** Catálogo: dialog (hoja inferior en móvil), confirmación, drawer y popover. */
@Component({
  selector: 'nv-catalog-overlays',
  imports: [
    FormField, AppSection, AppStack, AppInline, AppButton, AppDialog, AppDrawer, AppPopover, AppField, AppInput,
    AppSwitch, AppKeyValue,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section title="app-dialog" description="Controlado con [(open)]. En móvil se abre como hoja inferior.">
        <app-inline>
          <app-button (click)="dialogOpen.set(true)">Editar sector</app-button>
          <app-button variant="outline" (click)="bigOpen.set(true)">Diálogo grande</app-button>
        </app-inline>
      </app-section>

      <app-section title="AppConfirm" description="Confirmación con promesa: await confirm.ask({…})">
        <app-inline>
          <app-button variant="outline" (click)="ask('primary')">Confirmar acción</app-button>
          <app-button variant="danger" leftIcon="lucideTrash2" (click)="ask('danger')">Eliminar cliente</app-button>
        </app-inline>
      </app-section>

      <app-section title="app-drawer y app-popover">
        <app-inline>
          <app-button variant="outline" leftIcon="lucidePanelRight" (click)="drawerOpen.set(true)">Abrir drawer</app-button>
          <app-popover label="Filtros rápidos" icon="lucideFilter" title="Filtrar por estado" align="start">
            <app-stack gap="sm">
              <app-switch label="Solo morosos" />
              <app-switch label="Con ticket abierto" />
            </app-stack>
          </app-popover>
        </app-inline>
      </app-section>
    </app-stack>

    <app-dialog title="Editar sector" description="Los cambios se aplican a los clientes del sector." [(open)]="dialogOpen">
      <form id="sector-form" novalidate (submit)="save($event)">
        <app-field label="Nombre del sector" for="dlg-nombre" [field]="f.nombre">
          <app-input inputId="dlg-nombre" [formField]="f.nombre" />
        </app-field>
      </form>
      <app-button appDialogFooter variant="outline" (click)="dialogOpen.set(false)">Cancelar</app-button>
      <app-button appDialogFooter (click)="save($event)">Guardar</app-button>
    </app-dialog>

    <app-dialog title="Detalle de factura" size="lg" [(open)]="bigOpen">
      <app-key-value [columns]="2" [items]="factura" />
      <app-button appDialogFooter (click)="bigOpen.set(false)">Cerrar</app-button>
    </app-dialog>

    <app-drawer title="Detalle rápido" side="right" [padded]="true" [(open)]="drawerOpen">
      <app-key-value [columns]="1" [items]="factura" />
    </app-drawer>
  `,
})
export class CatalogOverlays {
  private readonly confirm = inject(AppConfirm);
  private readonly toast = inject(AppToast);

  protected readonly dialogOpen = signal(false);
  protected readonly bigOpen = signal(false);
  protected readonly drawerOpen = signal(false);

  protected readonly model = signal({ nombre: 'Zona 1' });
  protected readonly f = form(this.model, (p) => required(p.nombre, { message: 'El nombre es obligatorio' }));

  protected readonly factura = [
    { label: 'Cliente', value: 'Ana López' },
    { label: 'Factura', value: 'FAC-2026-01024' },
    { label: 'Emisión', value: new Date(2026, 10, 1), kind: 'date' as const },
    { label: 'Total', value: 250, kind: 'money' as const },
    { label: 'Dirección', value: '5a. avenida 10-20, zona 1, Guatemala', wide: true },
  ];

  protected async ask(tone: 'primary' | 'danger'): Promise<void> {
    const ok = await this.confirm.ask(
      tone === 'danger'
        ? { title: '¿Eliminar a Ana López?', description: 'Se eliminarán sus facturas pendientes. Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', tone }
        : { title: '¿Generar facturas del mes?', description: 'Se crearán 1,240 facturas para noviembre.', confirmLabel: 'Generar' },
    );
    if (ok) this.toast.success('Confirmado');
    else this.toast.info('Cancelado');
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.f.nombre().markAsTouched();
    if (this.f().invalid()) return;
    this.dialogOpen.set(false);
    this.toast.success('Sector actualizado');
  }
}
