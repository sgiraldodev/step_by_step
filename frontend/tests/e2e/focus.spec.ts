import { test, expect } from '@playwright/test';

test('la aplicación migrada conserva tareas, enfoque, rutinas y estadísticas', async ({ page }) => {
  const username = `e2e_${Date.now()}`;
  await page.goto('/acceso');
  await page.getByLabel('Correo electrónico').fill('preview@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('Preview-password-2026');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(
    page.getByText('Te damos la bienvenida, Persona de prueba.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('Te damos la bienvenida, Persona de prueba.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Título de la tarea').fill(`Tarea de validación ${username}`);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(page.getByText(`Tarea de validación ${username}`, { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: new RegExp(`Iniciar.*Tarea de validación ${username}`) })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reanudar', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reanudar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Terminar', exact: true }).click();
  await expect(page.getByText('Terminada', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Rutinas diarias', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Mis rutinas diarias', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Título de la rutina').fill(`Rutina de validación ${username}`);
  await page.getByRole('button', { name: 'Crear rutina', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: `Marcar Rutina de validación ${username} como hecha hoy` }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: `Marcar Rutina de validación ${username} como hecha hoy` })
    .click();
  await expect(
    page.getByRole('checkbox', {
      name: `Marcar Rutina de validación ${username} como pendiente hoy`,
    }),
  ).toBeChecked();
  await page.getByRole('tab', { name: 'Estadísticas', exact: true }).click();
  await expect(page.getByText('Tu tiempo, en perspectiva')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/migracion-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await page.getByLabel('Correo electrónico').fill('preview@example.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('Preview-password-2026');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(
    page.getByText('Te damos la bienvenida, Persona de prueba.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
});

test('el registro admite nombres con espacios y el acceso pide solo correo', async ({ page }) => {
  await page.goto('/acceso');
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear una cuenta', exact: true }).click();
  await page.route('**/auth/registration-code', (route) =>
    route.fulfill({
      json: { message: 'Enviado.', expires_at: new Date(Date.now() + 180000).toISOString() },
    }),
  );
  await page.route('**/auth/registration-code/verify', (route) =>
    route.fulfill({ json: { token: 'fake-registration' } }),
  );
  await page.getByLabel('Correo electrónico').fill('persona@example.test');
  await page.getByRole('button', { name: 'Enviar código al correo' }).click();
  await page.getByLabel('Código de 4 dígitos').fill('0123');
  await page.getByRole('button', { name: 'Validar código' }).click();
  const name = page.getByLabel('Nombre', { exact: true });
  await name.fill('María José Giraldo');
  expect(await name.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(true);
});
