import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Authorization } from '@nova/core/auth';
import { NAV, filterNav } from './nav';

/** Menú lateral generado desde NAV + permisos del usuario. */
@Component({
  selector: 'nv-sidebar-nav',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './sidebar-nav.html',
})
export class SidebarNav {
  private readonly authz = inject(Authorization);
  protected readonly items = computed(() => filterNav(NAV, this.authz.can));
}
