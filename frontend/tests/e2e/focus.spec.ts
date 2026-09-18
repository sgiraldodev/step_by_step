import { test, expect } from '@playwright/test';

test('la aplicación migrada conserva registro, tareas, enfoque, rutinas y estadísticas', async ({
  page,
}) => {
  const username = `e2e_${Date.now()}`;
  await page.goto('/acceso');
  await page.getByRole('button', { name: 'Crear una cuenta', exact: true }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Santiago Giraldo');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(`${username}@example.test`);
  await page.getByLabel('Contraseña', { exact: true }).fill('Prueba-local-segura-2026');
  await page.getByLabel('Repetir contraseña', { exact: true }).fill('Prueba-local-segura-2026');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByRole('button', { name: 'Ya lo guardé · Entrar a mi espacio' }).click();
  await expect(
    page.getByText('Te damos la bienvenida, Santiago Giraldo.', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('Te damos la bienvenida, Santiago Giraldo.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Título de la tarea').fill('Tarea de validación');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(page.getByText('Tarea de validación', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Iniciar.*Tarea de validación/ }).click();
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
  await page.getByLabel('Título de la rutina').fill('Rutina de validación');
  await page.getByRole('button', { name: 'Crear rutina', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Marcar Rutina de validación como hecha hoy' }),
  ).toBeVisible();
  await page.getByRole('checkbox', { name: 'Marcar Rutina de validación como hecha hoy' }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Marcar Rutina de validación como pendiente hoy' }),
  ).toBeChecked();
  await page.getByRole('tab', { name: 'Estadísticas', exact: true }).click();
  await expect(page.getByText('Tu tiempo, en perspectiva')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/migracion-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await page.getByLabel('Correo electrónico').fill(`${username}@example.test`);
  await page.getByLabel('Contraseña', { exact: true }).fill('Prueba-local-segura-2026');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(
    page.getByText('Te damos la bienvenida, Santiago Giraldo.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
});

test('el registro admite nombres con espacios y el acceso pide solo correo', async ({ page }) => {
  await page.goto('/acceso');
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Crear una cuenta', exact: true }).click();
  const name = page.getByLabel('Nombre', { exact: true });
  await name.fill('María José Giraldo');
  expect(await name.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(true);
});
