import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import FocusTimer from '@/modules/focus/components/focus-timer';

const props = {
  active: true,
  title: 'Escribir propuesta',
  minutes: '25',
  seconds: '00',
  busy: false,
  onPause: vi.fn(),
  onFinish: vi.fn(),
  onSwitch: vi.fn(),
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Temporizador flotante', () => {
  it('mantiene la vista de enfoque si el navegador no ofrece ventana flotante', () => {
    render(<FocusTimer {...props} />);
    expect(screen.queryByRole('button', { name: 'Ventana flotante' })).toBeNull();
    expect(screen.getByLabelText('25 minutos 00 segundos')).toBeTruthy();
  });

  it('muestra el mismo contador en la ventana flotante y vuelve al cerrarla', async () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const floating = iframe.contentWindow!;
    const close = vi.fn(() => floating.dispatchEvent(new Event('pagehide')));
    Object.defineProperty(floating, 'close', { value: close });
    const requestWindow = vi.fn().mockResolvedValue(floating);
    vi.stubGlobal('documentPictureInPicture', { requestWindow });
    const view = render(<FocusTimer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ventana flotante' }));
    await waitFor(() => expect(within(floating.document.body).getByText('25:00')).toBeTruthy());
    expect(requestWindow).toHaveBeenCalledWith({ width: 320, height: 210 });
    expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('open')).toBe(false);

    view.rerender(<FocusTimer {...props} minutes="24" seconds="59" />);
    expect(within(floating.document.body).getByText('24:59')).toBeTruthy();
    fireEvent.click(
      within(floating.document.body).getByRole('button', { name: 'Volver a la aplicación' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('open')).toBe(true),
    );
    expect(close).toHaveBeenCalledOnce();
    iframe.remove();
  });
});
