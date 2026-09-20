import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`recuperación por correo con errores y nueva contraseña (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    // API y correo ficticios: no modifica cuentas ni envía mensajes reales.
    await page.route('**/api/v1/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      const data = route.request().method() === 'POST' ? route.request().postDataJSON() : {};
      let status = 200;
      let body: object = { setup_required: false, email_recovery: true };
      if (path.endsWith('/auth/me')) {
        status = 401;
        body = { detail: 'Inicia sesión.' };
      }
      if (path.endsWith('/auth/recovery-code')) {
        if (data.email === 'missing@example.test') {
          status = 404;
          body = { detail: 'No existe una cuenta con este correo electrónico.' };
        } else
          body = {
            message: 'Enviamos un código de 4 dígitos a tu correo.',
            expires_at: new Date(Date.now() + 180000).toISOString(),
          };
      }
      if (path.endsWith('/auth/recovery-code/verify')) {
        if (data.code !== '0123') {
          status = 400;
          body = { detail: 'El código no es válido o ya venció.' };
        } else {
          expect(data.email).toBe('persona@example.test');
          body = { token: 'fake-reset-token' };
        }
      }
      if (path.endsWith('/auth/reset-password')) {
        expect(data).toEqual({ token: 'fake-reset-token', password: 'Clave-segura-2026' });
        body = { message: 'Contraseña actualizada.', recovery_code: 'nuevo-codigo-personal' };
      }
      await route.fulfill({ status, json: body });
    });
    await page.goto('/acceso');
    await page.getByRole('button', { name: 'Olvidé mi contraseña' }).click();
    await page.getByRole('button', { name: /Otro método/ }).click();
    await page.getByLabel('Correo electrónico').fill('missing@example.test');
    await page.getByRole('button', { name: 'Enviar código al correo' }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText('No existe una cuenta');
    await page.getByLabel('Correo electrónico').fill('persona@example.test');
    await page.getByRole('button', { name: 'Enviar código al correo' }).click();
    await page.getByLabel('Código de 4 dígitos').fill('9999');
    await page.getByRole('button', { name: 'Validar código' }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText('El código no es válido');
    await page.getByRole('button', { name: 'Reenviar código' }).click();
    await expect(page.getByLabel('Código de 4 dígitos')).toHaveValue('');
    await page.screenshot({ path: `test-results/email-recovery-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByLabel('Código de 4 dígitos').fill('0123');
    await page.getByRole('button', { name: 'Validar código' }).click();
    await page.getByLabel('Contraseña', { exact: true }).fill('Clave-segura-2026');
    await page.getByLabel('Repetir contraseña').fill('Clave-segura-2026');
    await page.getByRole('button', { name: 'Restablecer contraseña' }).click();
    await expect(page.getByText('nuevo-codigo-personal', { exact: true })).toBeVisible();
  });
}

test('el registro valida el correo antes de crear la cuenta', async ({ page }) => {
  let verified = false;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let status = 200;
    let body: object = { setup_required: false, email_recovery: true };
    if (path.endsWith('/auth/me')) {
      status = 401;
      body = { detail: 'Inicia sesión.' };
    }
    if (path.endsWith('/auth/registration-code'))
      body = {
        message: 'Código enviado.',
        expires_at: new Date(Date.now() + 180000).toISOString(),
      };
    if (path.endsWith('/auth/registration-code/verify')) {
      expect(route.request().postDataJSON()).toEqual({
        email: 'persona@example.test',
        code: '0123',
      });
      verified = true;
      body = { token: 'fake-registration-token' };
    }
    if (path.endsWith('/auth/register')) {
      expect(verified).toBe(true);
      expect(route.request().postDataJSON()).toMatchObject({
        email: 'persona@example.test',
        verification_token: 'fake-registration-token',
      });
      body = {
        user: { id: 'fake-user', name: 'María José Giraldo', email: 'persona@example.test' },
        recovery_code: 'codigo-personal',
      };
    }
    await route.fulfill({ status, json: body });
  });
  await page.goto('/acceso#registro');
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveCount(0);
  await page.getByLabel('Correo electrónico').fill('persona@example.test');
  await page.getByRole('button', { name: 'Enviar código al correo' }).click();
  await page.getByLabel('Código de 4 dígitos').fill('0123');
  await page.getByRole('button', { name: 'Validar código' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('María José Giraldo');
  await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('readonly', '');
  await page.getByLabel('Contraseña', { exact: true }).fill('Clave-segura-2026');
  await page.getByLabel('Repetir contraseña').fill('Clave-segura-2026');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('codigo-personal', { exact: true })).toBeVisible();
});
