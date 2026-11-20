import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AppAlert,
  AppBadge,
  AppButton,
  AppButtonGroup,
  AppDataReady,
  AppDataState,
  AppEmptyState,
  AppGrid,
  AppInline,
  AppLoader,
  AppProgress,
  AppSection,
  AppSkeleton,
  AppStack,
  AppStatusDot,
  type AppTone,
  AppToast,
} from '@nova/app';

type DemoState = 'loading' | 'error' | 'empty' | 'ready';

/** Catálogo: alertas, badges, estados, carga, vacío, data-state y toasts. */
@Component({
  selector: 'nv-catalog-feedback',
  imports: [
    AppSection, AppStack, AppInline, AppGrid, AppAlert, AppBadge, AppStatusDot, AppLoader, AppSkeleton, AppProgress,
    AppEmptyState, AppDataState, AppDataReady, AppButton, AppButtonGroup,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stack gap="lg">
      <app-section title="app-alert">
        <app-stack gap="sm">
          <app-alert tone="info" title="Corte programado">El sábado de 2:00 a 4:00 a. m. no habrá servicio en zona 4.</app-alert>
          <app-alert tone="success">El pago se registró correctamente.</app-alert>
          <app-alert tone="warning" title="Cliente moroso" [dismissible]="true">Tiene 2 facturas vencidas.</app-alert>
          <app-alert tone="danger" title="No se pudo conectar con la OLT">
            Revisa la conexión del equipo.
            <app-button appAlertActions size="sm" variant="outline">Reintentar</app-button>
          </app-alert>
        </app-stack>
      </app-section>

      <app-section title="app-badge y app-status-dot">
        @for (appearance of appearances; track appearance) {
          <app-inline>
            @for (tone of tones; track tone) {
              <app-badge [tone]="tone" [appearance]="appearance">{{ tone }}</app-badge>
            }
          </app-inline>
        }
        <app-inline gap="md">
          <app-badge tone="success" [dot]="true">En línea</app-badge>
          <app-badge tone="info" icon="lucideWifi" size="md">Fibra</app-badge>
          <app-status-dot tone="success" label="Conectado" [pulse]="true" />
          <app-status-dot tone="warning" label="Intermitente" />
          <app-status-dot tone="danger" label="Sin señal" [muted]="true" />
        </app-inline>
      </app-section>

      <app-section title="Carga" description="app-loader, app-skeleton y app-progress">
        <app-grid [cols]="{ base: 1, md: 3 }">
          <app-loader label="Cargando clientes…" />
          <app-skeleton [lines]="3" />
          <app-progress label="Meta de cobro" [value]="72" />
        </app-grid>
      </app-section>

      <app-section title="app-empty-state">
        <app-empty-state title="Sin tickets abiertos" description="Cuando un cliente reporte una falla aparecerá aquí." icon="lucideTicket" [bordered]="true">
          <app-button appEmptyActions leftIcon="lucidePlus">Crear ticket</app-button>
        </app-empty-state>
      </app-section>

      <app-section title="app-data-state" description="Único lugar para carga, error, vacío y éxito">
        <app-button-group ariaLabel="Estado de ejemplo">
          @for (s of states; track s) {
            <app-button size="sm" [variant]="state() === s ? 'primary' : 'outline'" (click)="state.set(s)">{{ s }}</app-button>
          }
        </app-button-group>
        <app-data-state [query]="fakeQuery" emptyTitle="Sin pagos registrados" emptyDescription="Este cliente aún no tiene pagos.">
          <ng-template appDataReady let-data>
            <app-alert tone="success" title="Datos listos">Se cargaron {{ data.length }} pagos.</app-alert>
          </ng-template>
        </app-data-state>
      </app-section>

      <app-section title="AppToast">
        <app-inline>
          <app-button variant="outline" (click)="toast.success('Guardado correctamente')">Éxito</app-button>
          <app-button variant="outline" (click)="toast.error('No se pudo guardar', 'El servidor no respondió')">Error</app-button>
          <app-button variant="outline" (click)="toast.info('Hay una actualización')">Info</app-button>
          <app-button variant="outline" (click)="toast.warning('Revisa los datos')">Aviso</app-button>
        </app-inline>
      </app-section>
    </app-stack>
  `,
})
export class CatalogFeedback {
  protected readonly toast = inject(AppToast);
  protected readonly tones: AppTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
  protected readonly appearances = ['soft', 'solid', 'outline'] as const;
  protected readonly states: DemoState[] = ['loading', 'error', 'empty', 'ready'];
  protected readonly state = signal<DemoState>('ready');

  /** Imita la forma de una query de TanStack. */
  protected readonly fakeQuery = {
    isPending: computed(() => this.state() === 'loading'),
    isError: computed(() => this.state() === 'error'),
    error: () => ({ error: { message: 'Tiempo de espera agotado (504)' } }),
    data: computed(() => (this.state() === 'ready' ? [1, 2, 3] : this.state() === 'empty' ? [] : undefined)),
    refetch: () => this.state.set('ready'),
  };
}
