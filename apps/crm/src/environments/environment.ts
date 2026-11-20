/**
 * Producción. TODO: definir la URL del backend según la estrategia de
 * despliegue en convivencia con la UI React (decisión abierta §16:
 * subdominio nuevo vs. proxy por rutas en Railway). Mientras tanto se asume
 * que el host sirve el backend bajo /api.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
