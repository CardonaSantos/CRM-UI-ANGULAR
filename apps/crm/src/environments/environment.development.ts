/**
 * Desarrollo. `/api` lo redirige el dev-server a SERVER_CRM_NOVA local
 * (ver apps/crm/proxy.conf.json). Así no hace falta agregar localhost:4200 al
 * CORS del backend.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
