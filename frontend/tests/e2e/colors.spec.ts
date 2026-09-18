import { test, expect } from '@playwright/test';

test('personaliza el color desde Configuración y lo conserva en ambos temas', async ({ page }) => {
  // Datos ficticios interceptados: esta prueba no consulta ni modifica cuentas reales.
  let appColor = 'blue';
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: object = [];
    if (path.endsWith('/auth/preferences')) appColor = route.request().postDataJSON().app_color;
    if (path.endsWith('/auth/me') || path.endsWith('/auth/preferences'))
      body = {
        id: 'color-preview',
        name: 'Vista de colores',
        email: 'colores@example.test',
        app_color: appColor,
      };
    if (path.endsWith('/auth/status')) body = { setup_required: false, email_recovery: false };
    if (path.endsWith('/routines'))
      body = { date: '2026-09-18', time_zone: 'America/Bogota', items: [], today_tasks: [] };
    await route.fulfill({ json: body });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/acceso');
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Tu configuración' });
  await expect(dialog.getByRole('radio')).toHaveCount(10);
  const colors = [
    'Azul',
    'Verde',
    'Turquesa',
    'Celeste',
    'Naranja',
    'Rosado',
    'Lila',
    'Violeta',
    'Rojo',
    'Gris',
  ];
  const accents = new Set<string>();
  for (const color of colors) {
    await dialog.getByText(color, { exact: true }).click();
    if (color !== 'Azul')
      await expect(dialog.getByRole('status')).toContainText('guardado en tu cuenta');
    const background = await page
      .getByRole('button', { name: 'Guardar configuración' })
      .evaluate((button) => getComputedStyle(button).backgroundColor);
    accents.add(background);
  }
  expect(accents.size).toBe(10);
  await dialog.getByText('Rosado', { exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('guardado en tu cuenta');
  await dialog.getByRole('button', { name: 'Cerrar configuración' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'pink');
  await page.getByRole('button', { name: 'Modo oscuro', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'pink');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  await expect(dialog.getByRole('radio', { name: 'Rosado', exact: true })).toBeChecked();
  await dialog.getByRole('radio', { name: 'Lila', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-color', 'lilac');
  await page.screenshot({ path: 'test-results/configuracion-colores-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
