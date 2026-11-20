import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  type AppBulkAction,
  AppBadge,
  AppButton,
  AppButtonGroup,
  AppCellDef,
  AppConfirm,
  AppDataTable,
  AppSection,
  AppStack,
  AppToast,
  actionsColumn,
  appColumns,
  dateColumn,
  moneyColumn,
  statusColumn,
} from '@nova/app';
import { CLIENTES_DEMO, type ClienteDemo, ESTADO_CLIENTE } from './catalog-data';

/** Catálogo: app-data-table con helpers de columna, selección, exportación y cards móviles. */
@Component({
  selector: 'nv-catalog-table',
  imports: [AppSection, AppStack, AppDataTable, AppCellDef, AppBadge, AppButton, AppButtonGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section
        title="app-data-table"
        description="Búsqueda, orden, paginación, selección con acciones masivas, columnas visibles, densidad y exportación. En móvil se muestra como cards."
      >
        <app-button-group ariaLabel="Estado de la tabla">
          <app-button size="sm" [variant]="loading() ? 'primary' : 'outline'" (click)="loading.set(!loading())">Cargando</app-button>
          <app-button size="sm" [variant]="empty() ? 'primary' : 'outline'" (click)="empty.set(!empty())">Vacía</app-button>
        </app-button-group>

        <app-data-table
          tableId="catalogo-clientes"
          ariaLabel="Clientes de ejemplo"
          [data]="empty() ? [] : clientes"
          [columns]="columns"
          [getRowId]="rowId"
          [loading]="loading()"
          [searchable]="true"
          searchPlaceholder="Buscar por nombre, sector o plan…"
          [selectable]="true"
          [bulkActions]="bulk"
          [exportable]="true"
          exportFileName="clientes-demo"
          [clickableRows]="true"
          (rowClick)="toast.info('Abrir ' + $event.nombre)"
          emptyTitle="No hay clientes"
          emptyDescription="Cuando registres clientes aparecerán aquí."
        >
          <ng-template appCell="plan" let-row>
            <app-badge tone="info" appearance="outline">{{ row.plan }}</app-badge>
          </ng-template>
          <app-button appEmptyActions leftIcon="lucidePlus" (click)="empty.set(false)">Nuevo cliente</app-button>
        </app-data-table>
      </app-section>
    </app-stack>
  `,
})
export class CatalogTable {
  protected readonly toast = inject(AppToast);
  private readonly confirm = inject(AppConfirm);

  protected readonly clientes = CLIENTES_DEMO;
  protected readonly loading = signal(false);
  protected readonly empty = signal(false);
  protected readonly rowId = (c: ClienteDemo) => String(c.id);

  private readonly col = appColumns<ClienteDemo>();
  protected readonly columns = [
    this.col.accessor('nombre', { header: 'Cliente', meta: { priority: 1 } }),
    this.col.accessor('telefono', { header: 'Teléfono', meta: { priority: 3 } }),
    this.col.accessor('sector', { header: 'Sector' }),
    this.col.accessor('plan', { header: 'Plan' }),
    statusColumn<ClienteDemo>('estado', 'Estado', (c) => c.estado, ESTADO_CLIENTE),
    moneyColumn<ClienteDemo>('saldo', 'Saldo', (c) => c.saldo),
    dateColumn<ClienteDemo>('ultimoPago', 'Último pago', (c) => c.ultimoPago, { priority: 3 }),
    actionsColumn<ClienteDemo>((c) => [
      { label: 'Ver perfil', icon: 'lucideEye', run: () => this.toast.info(`Perfil de ${c.nombre}`) },
      { label: 'Registrar pago', icon: 'lucideBanknote', hidden: c.saldo === 0, run: () => this.toast.success('Pago registrado') },
      { label: 'Suspender', icon: 'lucideBan', tone: 'danger', separatorBefore: true, run: () => this.suspend(c) },
    ]),
  ];

  protected readonly bulk: AppBulkAction<ClienteDemo>[] = [
    { label: 'Enviar recordatorio', icon: 'lucideSend', run: (rows) => this.toast.success(`Recordatorio a ${rows.length} clientes`) },
    { label: 'Suspender', icon: 'lucideBan', tone: 'danger', run: (rows) => this.toast.warning(`${rows.length} clientes suspendidos`) },
  ];

  private async suspend(c: ClienteDemo): Promise<void> {
    const ok = await this.confirm.ask({ title: `¿Suspender a ${c.nombre}?`, confirmLabel: 'Suspender', tone: 'danger' });
    if (ok) this.toast.warning(`${c.nombre} suspendido`);
  }
}
