/** Utilidades de test: arma un JWT sin firma con el payload que espera `decodeSession`. */
export function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64(payload)}.firma`;
}

export const validPayload = (over: Record<string, unknown> = {}) => ({
  sub: 7,
  nombre: 'José Pérez',
  correo: 'jose@nova.gt',
  rol: 'TECNICO',
  activo: true,
  empresaId: 1,
  exp: Math.floor(Date.now() / 1000) + 3600,
  ...over,
});
