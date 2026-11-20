import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToaster } from '@nova/app';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-toaster />
  `,
})
export class App {}
