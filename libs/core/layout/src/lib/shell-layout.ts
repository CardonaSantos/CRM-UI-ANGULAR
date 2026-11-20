import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { AuthStore, ROL_USUARIO_LABEL } from '@nova/core/auth';
import { ThemeService } from '@nova/core/theme';
import { AppDrawer, AppIconButton } from '@nova/app';
import { filter } from 'rxjs';
import { NAV_ICONS } from './nav-icons';
import { SidebarNav } from './sidebar-nav';

/** Layout raíz autenticado: sidebar (off-canvas en móvil), topbar y contenido. */
@Component({
  selector: 'nv-shell-layout',
  imports: [RouterOutlet, AppDrawer, AppIconButton, SidebarNav],
  providers: [provideIcons(NAV_ICONS)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell-layout.html',
})
export class ShellLayout {
  protected readonly auth = inject(AuthStore);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly roleLabel = ROL_USUARIO_LABEL;
  protected readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleDark(): void {
    this.theme.update({ appearance: this.theme.isDark() ? 'light' : 'dark' });
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
