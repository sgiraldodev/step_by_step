import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ColorPreferenceProvider from '@/components/ui/color-preference-provider';
import ColorPicker from '@/components/ui/color-picker';

afterEach(cleanup);

it('restaura cada cuenta, guarda cambios y evita heredar colores al cambiar de usuario', async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const view = render(
    <ColorPreferenceProvider key="first" initialColor="pink" onSave={save}>
      <ColorPicker />
    </ColorPreferenceProvider>,
  );
  expect(document.documentElement.dataset.color).toBe('pink');
  fireEvent.click(screen.getByRole('radio', { name: 'Verde' }));
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toContain('guardado en tu cuenta'),
  );
  expect(save).toHaveBeenCalledWith('green');
  view.rerender(
    <ColorPreferenceProvider key="second" initialColor="lilac" onSave={save}>
      <ColorPicker />
    </ColorPreferenceProvider>,
  );
  expect(document.documentElement.dataset.color).toBe('lilac');
  expect((screen.getByRole('radio', { name: 'Lila' }) as HTMLInputElement).checked).toBe(true);
  view.unmount();
  expect(document.documentElement.dataset.color).toBe('blue');
});

it('restaura el color previo y comunica el fallo cuando la cuenta no puede guardarlo', async () => {
  const save = vi.fn().mockRejectedValue(new Error('No se pudo guardar.'));
  render(
    <ColorPreferenceProvider initialColor="green" onSave={save}>
      <ColorPicker />
    </ColorPreferenceProvider>,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Rosado' }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('No se pudo guardar.'));
  expect(document.documentElement.dataset.color).toBe('green');
});
