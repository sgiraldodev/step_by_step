import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  test.describe(`Ancho ${width}`, () => {
    test.use({ hasTouch: width < 768 });
    test(`selección múltiple y confirmación de borrado (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      let tasks = [1, 2].map((id) => ({
        id,
        title: `Tarea de selección ${id}`,
        status: 'Pendiente',
        priority: 'Media',
        cycles_invested: id,
        tags: [],
        routine_id: null,
        routine_date: null,
        created_at: '2026-09-28T12:00:00Z',
        updated_at: null,
      }));
      // Todas las peticiones se interceptan; no se modifican datos reales.
      await page.route('**/api/v1/**', async (route) => {
        const path = new URL(route.request().url()).pathname;
        let body: object = [];
        if (path.endsWith('/auth/me'))
          body = {
            id: 'selection-preview',
            name: 'Vista de prueba',
            email: 'preview@example.test',
            app_color: 'green',
          };
        if (path.endsWith('/auth/status')) body = { setup_required: false, email_recovery: false };
        if (path.endsWith('/routines'))
          body = { date: '2026-09-28', time_zone: 'America/Bogota', items: [], today_tasks: [] };
        if (path.endsWith('/tasks')) body = tasks;
        const match = path.match(/\/tasks\/(\d+)$/);
        if (match) {
          const id = Number(match[1]);
          if (route.request().method() === 'DELETE') {
            tasks = tasks.filter((task) => task.id !== id);
            await route.fulfill({ status: 204 });
            return;
          }
          const task = tasks.find((task) => task.id === id)!;
          const { action } = route.request().postDataJSON();
          task.status = action === 'complete' ? 'Terminada' : 'Pendiente';
          body = task;
        }
        await route.fulfill({ json: body });
      });
      await page.addInitScript(() => localStorage.setItem('step-theme', 'light'));
      await page.goto('/acceso');
      const first = page.getByRole('checkbox', {
        name: 'Seleccionar tarea: Tarea de selección 1',
        exact: true,
      });
      await first.focus();
      await page.keyboard.press('Space');
      await expect(first).toBeChecked();
      await expect(
        page.getByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }),
      ).toBeChecked({ indeterminate: true });
      await page
        .getByRole('checkbox', { name: 'Seleccionar tarea: Tarea de selección 2', exact: true })
        .check();
      await expect(page.getByText('2 seleccionadas', { exact: true })).toBeVisible();
      const actions = page.getByRole('group', { name: 'Acciones para las tareas seleccionadas' });
      const completeBox = await actions
        .getByRole('button', { name: 'Completar seleccionadas' })
        .boundingBox();
      const restoreBox = await actions
        .getByRole('button', { name: 'Volver a pendientes' })
        .boundingBox();
      const deleteBox = await actions
        .getByRole('button', { name: 'Eliminar seleccionadas' })
        .boundingBox();
      expect(completeBox!.y).toBe(restoreBox!.y);
      expect(completeBox!.y).toBe(deleteBox!.y);
      expect(completeBox!.height).toBeGreaterThanOrEqual(width < 768 ? 44 : 36);
      expect((await actions.boundingBox())!.height).toBeLessThan(110);
      await page.screenshot({
        path: `test-results/seleccion-multiple-${width}.png`,
        fullPage: true,
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.getByRole('button', { name: 'Completar seleccionadas', exact: true }).click();
      await expect(page.getByText('2 tareas procesadas.', { exact: true })).toBeVisible();
      expect(tasks.map((task) => task.cycles_invested)).toEqual([1, 2]);
      await page.getByRole('tab', { name: 'Terminadas', exact: true }).click();
      await page.getByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }).check();
      await page.getByRole('button', { name: 'Volver a pendientes', exact: true }).click();
      await expect(page.getByText('2 tareas procesadas.', { exact: true })).toBeVisible();
      await page.getByRole('tab', { name: 'Pendientes', exact: true }).click();
      await page.getByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }).check();
      await page.getByRole('button', { name: 'Eliminar seleccionadas', exact: true }).click();
      await expect(page.getByRole('dialog')).toContainText('Se eliminarán 2 tareas');
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
      expect(tasks).toHaveLength(2);
      await page.getByRole('button', { name: 'Eliminar seleccionadas', exact: true }).click();
      await page.getByRole('button', { name: 'Sí, borrar', exact: true }).click();
      await expect(page.getByText('Todo empieza con una tarea', { exact: true })).toBeVisible();
      expect(tasks).toHaveLength(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  });
}
