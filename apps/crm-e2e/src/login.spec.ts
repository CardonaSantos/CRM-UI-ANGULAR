import { expect, test } from '@playwright/test';

test.describe('Login', () => {
  test('sin sesión, cualquier ruta redirige al login conservando el destino', async ({ page }) => {
    await page.goto('/clientes');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fclientes/);
    await expect(page.getByRole('heading', { name: 'Acceso al CRM' })).toBeVisible();
  });

  test('valida los campos antes de llamar al backend', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText('Ingresa tu correo')).toBeVisible();
    await expect(page.getByText('Ingresa tu contraseña')).toBeVisible();

    await page.getByLabel('Correo electrónico').fill('no-es-correo');
    await page.getByLabel('Correo electrónico').blur();
    await expect(page.getByText('Correo no válido')).toBeVisible();
  });
});
