import { CRM_PERMISSION as P, type CrmPermission } from '@nova/core/auth';

export interface NavItem {
  label: string;
  /** Nombre del icono Lucide (registrado en ShellLayout). */
  icon?: string;
  path?: string;
  permission?: CrmPermission;
  /** Se oculta si el usuario TAMBIÉN tiene este permiso (evita duplicados, p. ej. dos "Inicio"). */
  hiddenWith?: CrmPermission;
  children?: NavItem[];
}

/**
 * Navegación única del CRM (reemplaza los 7 archivos `routes-<rol>.ts`).
 * Lo que ve cada rol sale de ROLE_PERMISSIONS: para cambiarlo no se toca este archivo.
 * Rutas normalizadas en español y kebab-case (guía §11.4). Las vistas que aún
 * no se migran muestran la página "pendiente".
 */
export const NAV: NavItem[] = [
  { label: 'Inicio', icon: 'lucideHouse', path: '/inicio', permission: P.DASHBOARD_VER },
  {
    label: 'Inicio',
    icon: 'lucideHouse',
    path: '/tecnico/inicio',
    permission: P.DASHBOARD_TECNICO_VER,
    hiddenWith: P.DASHBOARD_VER,
  },
  {
    label: 'Clientes',
    icon: 'lucideUsers',
    children: [
      { label: 'Listado de clientes', path: '/clientes', permission: P.CLIENTES_VER },
      { label: 'Nuevo cliente', path: '/clientes/nuevo', permission: P.CLIENTES_CREAR },
    ],
  },
  {
    label: 'Instalaciones',
    icon: 'lucideClipboardList',
    children: [
      { label: 'Instalaciones registradas', path: '/instalaciones', permission: P.INSTALACIONES_VER },
      { label: 'Instalaciones asignadas', path: '/instalaciones/tecnico', permission: P.INSTALACIONES_TECNICO_VER },
    ],
  },
  {
    label: 'Soporte',
    icon: 'lucideMonitorSmartphone',
    children: [
      { label: 'Tickets de soporte', path: '/tickets', permission: P.TICKETS_VER },
      { label: 'Tickets asignados', path: '/tickets/tecnico', permission: P.TICKETS_TECNICO_GESTIONAR },
      { label: 'Metas de soporte', path: '/soporte/metas', permission: P.SOPORTE_METAS_VER },
      { label: 'Categorías de soporte', path: '/soporte/categorias', permission: P.SOPORTE_CATEGORIAS_VER },
    ],
  },
  { label: 'Jornadas y ubicación', icon: 'lucideLocate', path: '/tracking', permission: P.REAL_TIME_LOCATION_VER },
  {
    label: 'Desinstalaciones',
    icon: 'lucideCircleMinus',
    children: [
      { label: 'Desinstalaciones registradas', path: '/desinstalaciones', permission: P.DESINSTALACIONES_VER },
      { label: 'Autorizaciones', path: '/desinstalaciones/autorizaciones', permission: P.DESINSTALACIONES_AUTORIZAR },
    ],
  },
  {
    label: 'Servicios',
    icon: 'lucideWaypoints',
    children: [
      { label: 'Servicio principal', path: '/servicios/internet', permission: P.SERVICIOS_VER },
      { label: 'Servicios adicionales', path: '/servicios/adicionales', permission: P.SERVICIOS_VER },
    ],
  },
  { label: 'Facturación por zona', icon: 'lucideMapPinned', path: '/facturacion-zona', permission: P.FACTURACION_ZONA_VER },
  { label: 'Sectores', icon: 'lucideMapPin', path: '/sectores', permission: P.SECTORES_VER },
  {
    label: 'Bot y mensajería',
    icon: 'lucideBot',
    children: [
      { label: 'Bot', path: '/bot', permission: P.BOT_VER },
      { label: 'Mensajería WhatsApp', path: '/whatsapp', permission: P.WHATSAPP_VER },
      { label: 'Galería', path: '/whatsapp/galeria', permission: P.WHATSAPP_GALERIA_VER },
      { label: 'Plantillas Meta', path: '/whatsapp/plantillas', permission: P.WHATSAPP_PLANTILLAS_VER },
      { label: 'Enviar campaña', path: '/whatsapp/campanas', permission: P.WHATSAPP_CAMPANAS_VER },
    ],
  },
  { label: 'Plantillas de contrato', icon: 'lucideFileText', path: '/contratos/plantillas', permission: P.PLANTILLAS_CONTRATO_VER },
  {
    label: 'Rutas de cobro',
    icon: 'lucideMap',
    children: [
      { label: 'Rutas', path: '/rutas-cobro', permission: P.RUTAS_COBRO_VER },
      { label: 'Mis rutas', path: '/rutas-cobro/asignadas', permission: P.RUTAS_ASIGNADAS_VER },
    ],
  },
  {
    label: 'Red',
    icon: 'lucideCable',
    children: [
      { label: 'OLT', path: '/red/olt', permission: P.OPTICO_VER },
      { label: 'Routers MikroTik', path: '/red/routers', permission: P.OPTICO_VER },
    ],
  },
  {
    label: 'PPPoE',
    icon: 'lucideRouter',
    children: [
      { label: 'Cuentas PPPoE', path: '/pppoe/cuentas', permission: P.PPPOE_ADMINISTRACION_VER },
      { label: 'Perfiles homologados', path: '/pppoe/homologaciones', permission: P.PPPOE_HOMOLOGACIONES_VER },
      { label: 'Auditoría', path: '/pppoe/auditoria', permission: P.PPPOE_AUDITORIA_VER },
      { label: 'Operaciones', path: '/pppoe/operaciones', permission: P.PPPOE_OPERACIONES_VER },
    ],
  },
  {
    label: 'Créditos',
    icon: 'lucideLandmark',
    children: [
      { label: 'Registrar crédito', path: '/creditos/nuevo', permission: P.CREDITOS_CREAR },
      { label: 'Créditos', path: '/creditos', permission: P.CREDITOS_VER },
    ],
  },
  { label: 'Facturas eliminadas', icon: 'lucideTrash2', path: '/facturas-eliminadas', permission: P.REGISTROS_ELIMINADOS_VER },
  { label: 'Reportes', icon: 'lucideSheet', path: '/reportes', permission: P.REPORTES_VER },
  { label: 'Usuarios', icon: 'lucideUsers', path: '/usuarios', permission: P.USUARIOS_VER },
  { label: 'Perfil', icon: 'lucideUser', path: '/perfil', permission: P.PERFIL_VER },
  { label: 'Catálogo de diseño', icon: 'lucidePalette', path: '/_design', permission: P.PRUEBAS_VER },
];

/** Deja solo lo permitido y oculta los grupos que quedan vacíos. */
export function filterNav(items: readonly NavItem[], can: (p: CrmPermission) => boolean): NavItem[] {
  return items.flatMap((item) => {
    if (item.permission && !can(item.permission)) return [];
    if (item.hiddenWith && can(item.hiddenWith)) return [];
    if (!item.children) return [item];
    const children = filterNav(item.children, can);
    return children.length ? [{ ...item, children }] : [];
  });
}

/** Primera ruta navegable para el usuario (destino de "/" después del login). */
export function firstNavPath(items: readonly NavItem[]): string | null {
  for (const item of items) {
    if (item.path) return item.path;
    const child = item.children && firstNavPath(item.children);
    if (child) return child;
  }
  return null;
}
