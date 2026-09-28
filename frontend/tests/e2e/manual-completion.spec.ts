import { expect, test } from '@playwright/test';

for (const width of [390, 1280, 1800]) {
  test(`completa una tarea sin tiempo y permite restaurarla (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const task = {
      id: 1,
      title: 'Tarea realizada fuera del sistema',
      priority: 'Media',
      status: 'Pendiente',
      cycles_invested: 0,
      tags: [],
      routine_id: null,
      routine_date: null,
      created_at: '2026-09-28T12:00:00Z',
      updated_at: null,
    };
    // Datos ficticios: no se consulta ni modifica la base local.
    await page.route('**/api/v1/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      let body: object = [];
      if (path.endsWith('/auth/me'))
        body = {
          id: 'manual-completion-preview',
          name: 'Persona de prueba',
          email: 'manual@example.test',
          app_color: 'blue',
        };
      if (path.endsWith('/auth/status')) body = { setup_required: false, email_recovery: false };
      if (path.endsWith('/routines'))
        body = {
          date: '2026-09-28',
          time_zone: 'America/Bogota',
          items: [],
          today_tasks: [],
        };
      if (path.endsWith('/tasks')) body = [task];
      if (path.endsWith('/tasks/1')) {
        const payload = route.request().postDataJSON();
        expect(payload).toEqual({ action: payload.action });
        expect(['complete', 'restore']).toContain(payload.action);
        task.status = payload.action === 'complete' ? 'Terminada' : 'Pendiente';
        body = task;
      }
      await route.fulfill({ json: body });
    });
    await page.addInitScript(() => localStorage.setItem('step-theme', 'dark'));
    await page.goto('/acceso');
    await expect(page.getByLabel('Título de la tarea')).toHaveCount(0);
    await page.getByRole('button', { name: 'Nueva tarea', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva tarea', exact: true });
    await expect(dialog.getByLabel('Título de la tarea')).toBeFocused();
    await dialog.getByLabel('Título de la tarea').fill('Borrador conservado');
    await page.screenshot({ path: `test-results/nueva-tarea-${width}.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Nueva tarea', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Nueva tarea', exact: true }).click();
    await expect(dialog.getByLabel('Título de la tarea')).toHaveValue('Borrador conservado');
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    const filters = page.getByRole('tablist', { name: 'Filtrar tareas' });
    await expect(filters.getByRole('tab', { name: 'Pendientes', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(filters.getByRole('tab').last()).toHaveAccessibleName('Todas');
    await filters.getByRole('tab', { name: 'Todas', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(filters.getByRole('tab', { name: 'Pendientes', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const complete = page.getByRole('button', { name: `Completar tarea: ${task.title}` });
    await expect(complete).toBeEnabled();
    await expect(complete).toHaveText('');
    await expect(complete).toHaveAttribute('title', 'Completar tarea sin agregar tiempo ni ciclos');
    const titleBox = await page.getByText(task.title, { exact: true }).boundingBox();
    expect(titleBox?.width).toBeGreaterThan(160);
    await page.screenshot({ path: `test-results/completar-tarea-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await complete.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('tab', { name: 'Terminadas', exact: true }).click();
    await expect(page.getByText('Terminada', { exact: true })).toBeVisible();
    await expect(page.getByText('0 ciclos', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.reload();
    await page.getByRole('tab', { name: 'Terminadas', exact: true }).click();
    await expect(page.getByText(task.title, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Restaurar tarea: ${task.title}` }).click();
    await page.getByRole('tab', { name: 'Pendientes', exact: true }).click();
    await expect(complete).toBeEnabled();
    await expect(page.getByText('0 ciclos', { exact: true })).toBeVisible();
  });
}
