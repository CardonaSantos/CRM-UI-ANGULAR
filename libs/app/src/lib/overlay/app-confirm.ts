import { ChangeDetectionStrategy, Component, Injectable, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmDialogService } from '@nova/ui/dialog';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '../primitives/app-button';

export interface AppConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` para acciones destructivas (eliminar, anular, desinstalar). */
  tone?: 'primary' | 'danger';
  icon?: string;
}

/**
 * Confirmación con promesa. Uso:
 * `if (await this.confirm.ask({ title: '¿Eliminar cliente?', tone: 'danger' })) …`
 */
@Injectable({ providedIn: 'root' })
export class AppConfirm {
  private readonly dialogs = inject(HlmDialogService);

  async ask(options: AppConfirmOptions): Promise<boolean> {
    const ref = this.dialogs.open<boolean>(AppConfirmView, {
      context: options,
      showCloseButton: false,
      role: 'alertdialog',
      contentClass: 'sm:max-w-md',
    });
    return (await firstValueFrom(ref.closed$)) === true;
  }
}

@Component({
  selector: 'app-confirm-view',
  imports: [AppButton, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-4' },
  template: `
    <div class="flex items-start gap-3">
      <span class="flex size-10 shrink-0 items-center justify-center rounded-full" [class]="iconBox()">
        <ng-icon [name]="icon()" size="1.25rem" aria-hidden="true" />
      </span>
      <div class="flex min-w-0 flex-col gap-1.5">
        <h2 class="font-heading text-lg leading-tight font-semibold">{{ opts.title }}</h2>
        @if (opts.description) {
          <p class="text-muted-foreground text-sm">{{ opts.description }}</p>
        }
      </div>
    </div>
    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <app-button variant="outline" (click)="close(false)">{{ opts.cancelLabel ?? 'Cancelar' }}</app-button>
      <app-button [variant]="danger() ? 'danger' : 'primary'" (click)="close(true)">
        {{ opts.confirmLabel ?? 'Confirmar' }}
      </app-button>
    </div>
  `,
})
export class AppConfirmView {
  private readonly ref = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  protected readonly opts = injectBrnDialogContext<AppConfirmOptions>();

  protected readonly danger = computed(() => this.opts.tone === 'danger');
  protected readonly icon = computed(
    () => this.opts.icon ?? (this.danger() ? 'lucideTriangleAlert' : 'lucideCircleHelp'),
  );
  protected readonly iconBox = computed(() =>
    this.danger() ? 'bg-danger-soft text-danger-soft-foreground' : 'bg-primary-soft text-primary-soft-foreground',
  );

  protected close(result: boolean): void {
    this.ref.close(result);
  }
}
