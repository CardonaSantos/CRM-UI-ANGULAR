import { isRolUsuario, type RolUsuario } from './roles';

/**
 * Sesión del usuario CRM decodificada del JWT.
 * Misma validación que `decodeCrmSession` de POS-UI (ZustandCrmContext.ts).
 */
export interface SessionUser {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  empresaId: number;
  activo: boolean;
  avatar: string | null;
  portadaUrl: string | null;
}

interface CrmJwtPayload {
  sub?: number;
  id?: number;
  nombre?: unknown;
  correo?: unknown;
  rol?: unknown;
  activo?: unknown;
  empresaId?: unknown;
  avatar?: string | null;
  portadaUrl?: string | null;
  exp?: number;
}

/** Misma clave que la UI React, para no cambiar el contrato con el backend. */
export const CRM_TOKEN_STORAGE_KEY = 'tokenAuthCRM';

function decodeJwtPayload(token: string): CrmJwtPayload | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as CrmJwtPayload;
  } catch {
    return null;
  }
}

/** Devuelve la sesión si el token es válido, no expiró y el usuario está activo. */
export function decodeSession(token: string, now = Date.now()): SessionUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = Number(payload.id ?? payload.sub);
  const empresaId = Number(payload.empresaId);

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(empresaId) ||
    empresaId <= 0 ||
    typeof payload.nombre !== 'string' ||
    typeof payload.correo !== 'string' ||
    !isRolUsuario(payload.rol) ||
    payload.activo !== true
  ) {
    return null;
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 <= now) return null;

  return {
    id,
    nombre: payload.nombre,
    correo: payload.correo,
    rol: payload.rol,
    empresaId,
    activo: true,
    avatar: payload.avatar ?? null,
    portadaUrl: payload.portadaUrl ?? null,
  };
}
