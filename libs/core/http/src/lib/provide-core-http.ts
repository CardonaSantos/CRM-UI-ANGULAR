import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_BASE_URL } from './api-base-url';
import { authTokenInterceptor, errorToastInterceptor, loggingInterceptor } from './interceptors';

/** HttpClient + interceptores del CRM. El orden importa: log → token → toast de error. */
export function provideCoreHttp(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_BASE_URL, useValue: apiBaseUrl.replace(/\/+$/, '') },
    provideHttpClient(withFetch(), withInterceptors([loggingInterceptor, authTokenInterceptor, errorToastInterceptor])),
  ]);
}
