import { expect, test } from '@playwright/test';

/** JWT sin firma con el mismo payload que emite el backend (el front solo lo decodifica). */
function fakeToken(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const payload = {
    sub: 1,
    nombre: 'Ana López',
    correo: 'ana@nova.gt',
    rol: 'SUPER_ADMIN',
    activo: true,
    empresaId: 1,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return `${b64({ alg: 'none' })}.${b64(payload)}.x`;
}

test.describe('Catálogo de diseño (Fase 1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((token) => localStorage.setItem('tokenAuthCRM', token), fakeToken());
  });

  test('la tabla es tabla en escritorio y cards en móvil; busca y pagina', async ({ page, isMobile }) => {
    await page.goto('/_design?tab=tabla');
    if (isMobile) {
      await expect(page.locator('table')).toHaveCount(0);
      await expect(page.locator('app-table-cards li')).toHaveCount(10);
    } else {
      await expect(page.locator('tbody tr')).toHaveCount(10);
    }
    await expect(page.getByText('1–10 de 57')).toBeVisible();

    await page.getByPlaceholder('Buscar por nombre, sector o plan…').fill('Valeria');
    await page.getByPlaceholder('Buscar por nombre, sector o plan…').press('Enter');
    await expect(page.getByText('1–5 de 5')).toBeVisible();
  });

  test('el formulario muestra los errores de Signal Forms al enviar vacío', async ({ page }) => {
    await page.goto('/_design?tab=formularios');
    await page.getByRole('button', { name: 'Guardar cliente' }).click();
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('Elige un sector')).toBeVisible();
  });

  test('la confirmación devuelve la decisión del usuario', async ({ page }) => {
    await page.goto('/_design?tab=overlays');
    await page.getByRole('button', { name: 'Eliminar cliente' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByText('Cancelado')).toBeVisible();
  });
});
