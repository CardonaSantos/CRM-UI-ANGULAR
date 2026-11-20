import { InjectionToken } from '@angular/core';

/**
 * URL base del backend (SERVER_CRM_NOVA), sin barra final.
 * Se provee en apps/crm desde `environment.apiBaseUrl`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
