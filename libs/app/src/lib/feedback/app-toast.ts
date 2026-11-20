import { ChangeDetectionStrategy, Component, Injectable, computed, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ThemeService } from '@nova/core/theme';
import { HlmToaster } from '@nova/ui/sonner';

/** Servicio de notificaciones. Las features no importan sonner directo. */
@Injectable({ providedIn: 'root' })
export class AppToast {
  success(message: string, description?: string): void {
    toast.success(message, { description });
  }

  error(message: string, description?: string): void {
    toast.error(message, { description });
  }

  info(message: string, description?: string): void {
    toast.info(message, { description });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, { description });
  }
}

/** Contenedor de toasts. Se monta una sola vez en el componente raíz. */
@Component({
  selector: 'app-toaster',
  imports: [HlmToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<hlm-toaster [theme]="theme()" position="top-center" [closeButton]="true" [richColors]="true" />`,
})
export class AppToaster {
  private readonly themeService = inject(ThemeService);
  protected readonly theme = computed(() => (this.themeService.isDark() ? 'dark' : 'light'));
}
