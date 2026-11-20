import { RolUsuario } from './roles';
import { decodeSession } from './session';
import { fakeJwt, validPayload } from './testing';

describe('decodeSession', () => {
  it('decodifica un token válido (incluye acentos en UTF-8)', () => {
    const user = decodeSession(fakeJwt(validPayload()));
    expect(user).toMatchObject({ id: 7, nombre: 'José Pérez', rol: RolUsuario.TECNICO, empresaId: 1 });
  });

  it('usa `id` si viene, y si no `sub`', () => {
    expect(decodeSession(fakeJwt(validPayload({ id: 99 })))?.id).toBe(99);
  });

  it.each([
    ['expirado', { exp: Math.floor(Date.now() / 1000) - 10 }],
    ['inactivo', { activo: false }],
    ['rol desconocido', { rol: 'HACKER' }],
    ['sin empresa', { empresaId: 0 }],
    ['sin nombre', { nombre: undefined }],
  ])('rechaza un token %s', (_caso, over) => {
    expect(decodeSession(fakeJwt(validPayload(over)))).toBeNull();
  });

  it('rechaza basura', () => {
    expect(decodeSession('no-es-un-jwt')).toBeNull();
    expect(decodeSession('a.%%%.c')).toBeNull();
  });
});
