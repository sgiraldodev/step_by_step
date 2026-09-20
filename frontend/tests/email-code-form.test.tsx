import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import EmailCodeForm from '@/modules/auth/components/email-code-form';
import { authApi } from '@/modules/auth/auth';

vi.mock('@/modules/auth/auth', () => ({ authApi: { sendCode: vi.fn(), verifyCode: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('bloquea el código vencido y permite reenviar sin perder el correo', async () => {
  vi.mocked(authApi.sendCode)
    .mockResolvedValueOnce({
      message: 'Enviado.',
      expires_at: new Date(Date.now() - 1000).toISOString(),
    })
    .mockResolvedValueOnce({
      message: 'Reenviado.',
      expires_at: new Date(Date.now() + 180000).toISOString(),
    });
  const verified = vi.fn();
  render(
    <EmailCodeForm purpose="recovery" initialEmail="persona@example.test" onVerified={verified} />,
  );
  fireEvent.submit(
    screen.getByRole('button', { name: 'Enviar código al correo' }).closest('form')!,
  );
  await screen.findByText('El código venció. Solicita uno nuevo.');
  expect(screen.getByRole('button', { name: 'Validar código' }).hasAttribute('disabled')).toBe(
    true,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }));
  await screen.findByText('Reenviado.');
  expect(authApi.sendCode).toHaveBeenLastCalledWith('persona@example.test');
  expect(screen.getByRole('button', { name: 'Validar código' }).hasAttribute('disabled')).toBe(
    false,
  );
  expect(verified).not.toHaveBeenCalled();
});

it('conserva el código ante un rechazo y valida usando el correo asociado', async () => {
  vi.mocked(authApi.sendCode).mockResolvedValue({
    message: 'Enviado.',
    expires_at: new Date(Date.now() + 180000).toISOString(),
  });
  vi.mocked(authApi.verifyCode)
    .mockRejectedValueOnce(new Error('Código incorrecto.'))
    .mockResolvedValueOnce({ token: 'autorizacion' });
  const verified = vi.fn();
  render(
    <EmailCodeForm purpose="recovery" initialEmail="persona@example.test" onVerified={verified} />,
  );
  fireEvent.submit(
    screen.getByRole('button', { name: 'Enviar código al correo' }).closest('form')!,
  );
  const input = await screen.findByLabelText('Código de 4 dígitos');
  fireEvent.change(input, { target: { value: '0123' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Validar código' }).closest('form')!);
  await screen.findByText('Código incorrecto.');
  expect((input as HTMLInputElement).value).toBe('0123');
  fireEvent.submit(screen.getByRole('button', { name: 'Validar código' }).closest('form')!);
  await screen.findByText('Enviado.');
  await vi.waitFor(() =>
    expect(verified).toHaveBeenCalledWith('persona@example.test', 'autorizacion'),
  );
});
