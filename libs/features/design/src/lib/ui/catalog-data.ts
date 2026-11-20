import type { AppOption, AppStatusStyle } from '@nova/app';

/** Datos ficticios para el catálogo (no salen del backend). */
export interface ClienteDemo {
  id: number;
  nombre: string;
  telefono: string;
  sector: string;
  plan: string;
  saldo: number;
  estado: 'ACTIVO' | 'MOROSO' | 'SUSPENDIDO' | 'PENDIENTE';
  ultimoPago: string;
}

const NOMBRES = [
  'Ana López', 'Carlos Pérez', 'María García', 'José Hernández', 'Lucía Morales', 'Pedro Ramírez',
  'Sofía Castillo', 'Diego Méndez', 'Valeria Ortiz', 'Andrés Juárez', 'Gabriela Rivera', 'Luis Cifuentes',
];
const SECTORES = ['Zona 1', 'Zona 4', 'San Cristóbal', 'Mixco', 'Villa Nueva', 'Petapa'];
const PLANES = ['10 Mbps', '20 Mbps', '50 Mbps', '100 Mbps'];
const ESTADOS: ClienteDemo['estado'][] = ['ACTIVO', 'ACTIVO', 'ACTIVO', 'MOROSO', 'SUSPENDIDO', 'PENDIENTE'];

export const CLIENTES_DEMO: ClienteDemo[] = Array.from({ length: 57 }, (_, i) => ({
  id: i + 1,
  nombre: `${NOMBRES[i % NOMBRES.length]}${i >= NOMBRES.length ? ` ${Math.floor(i / NOMBRES.length) + 1}` : ''}`,
  telefono: String(50000000 + ((i * 7919) % 49999999)),
  sector: SECTORES[i % SECTORES.length],
  plan: PLANES[i % PLANES.length],
  saldo: ((i * 137) % 900) + (i % 3 === 0 ? 0.5 : 0),
  estado: ESTADOS[i % ESTADOS.length],
  ultimoPago: new Date(2026, 10 - (i % 6), 1 + (i % 27)).toISOString(),
}));

export const ESTADO_CLIENTE: Record<string, AppStatusStyle> = {
  ACTIVO: { label: 'Activo', tone: 'success' },
  MOROSO: { label: 'Moroso', tone: 'warning' },
  SUSPENDIDO: { label: 'Suspendido', tone: 'danger' },
  PENDIENTE: { label: 'Pendiente', tone: 'info' },
};

export const SECTOR_OPTIONS: AppOption<string>[] = SECTORES.map((s) => ({ value: s, label: s }));
export const PLAN_OPTIONS: AppOption<string>[] = PLANES.map((p) => ({ value: p, label: p, description: 'Fibra óptica' }));
