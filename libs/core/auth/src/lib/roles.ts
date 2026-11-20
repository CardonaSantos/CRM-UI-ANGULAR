/** Migrado literal desde POS-UI `Crm/features/users/users-rol.ts`. */
export enum RolUsuario {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',

  COORDINADOR_OPERACIONES = 'COORDINADOR_OPERACIONES',

  OFICINA = 'OFICINA',
  TIENDA = 'TIENDA',

  TECNICO = 'TECNICO',
  COBRADOR = 'COBRADOR',
}

export const ROL_USUARIO_LABEL: Record<RolUsuario, string> = {
  [RolUsuario.TIENDA]: 'Tienda',
  [RolUsuario.OFICINA]: 'Oficina',
  [RolUsuario.TECNICO]: 'Técnico',
  [RolUsuario.COBRADOR]: 'Cobrador',
  [RolUsuario.COORDINADOR_OPERACIONES]: 'Coordinador de operaciones',
  [RolUsuario.ADMIN]: 'Administrador',
  [RolUsuario.SUPER_ADMIN]: 'Super administrador',
};

const ROLES = new Set<string>(Object.values(RolUsuario));

export function isRolUsuario(value: unknown): value is RolUsuario {
  return typeof value === 'string' && ROLES.has(value);
}
