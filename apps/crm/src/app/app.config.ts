import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query';
import { provideAppKit } from '@nova/app';
import { AuthStore } from '@nova/core/auth';
import { provideCoreHttp } from '@nova/core/http';
import { ThemeService } from '@nova/core/theme';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideCoreHttp(environment.apiBaseUrl),
    provideTanStackQuery(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
            mutations: { retry: 0 },
          },
        }),
    ),
    provideAppKit(),
    // La sesión y el tema se resuelven antes de evaluar los guards (sin parpadeo de "Cargando").
    provideAppInitializer(() => {
      inject(AuthStore).restore();
      inject(ThemeService);
    }),
  ],
};
