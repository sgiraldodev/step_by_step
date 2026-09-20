import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ColorPicker from '@/components/ui/color-picker';
import ThemeToggle from '@/components/ui/theme-toggle';
import { APP_COLORS, APP_COLOR_INIT_SCRIPT, validAppColor } from '@/components/ui/app-colors';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.color = 'blue';
  document.documentElement.dataset.theme = 'light';
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.color;
});

describe('Personalización de color', () => {
  it('ofrece diez colores y guarda cada selección sin alterar el modo claro u oscuro', () => {
    render(
      <>
        <ColorPicker />
        <ThemeToggle />
      </>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(10);
    fireEvent.click(screen.getByRole('radio', { name: 'Rosado' }));
    for (const color of APP_COLORS) {
      fireEvent.click(screen.getByRole('radio', { name: color.label }));
      expect(document.documentElement.dataset.color).toBe(color.id);
      expect(localStorage.getItem('step-color')).toBe(color.id);
      expect((screen.getByRole('radio', { name: color.label }) as HTMLInputElement).checked).toBe(
        true,
      );
    }
    fireEvent.click(screen.getByRole('button', { name: 'Modo oscuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.color).toBe('slate');
  });

  it('restaura el color antes de pintar y muestra la selección al abrir el control', () => {
    localStorage.setItem('step-color', 'lilac');
    new Function(APP_COLOR_INIT_SCRIPT)();
    expect(document.documentElement.dataset.color).toBe('lilac');
    render(<ColorPicker />);
    expect((screen.getByRole('radio', { name: 'Lila' }) as HTMLInputElement).checked).toBe(true);
  });

  it('usa azul para preferencias inválidas y conserva la selección si el almacenamiento falla', () => {
    expect(validAppColor(null)).toBe('blue');
    expect(validAppColor('desconocido')).toBe('blue');
    localStorage.setItem('step-color', 'desconocido');
    new Function(APP_COLOR_INIT_SCRIPT)();
    expect(document.documentElement.dataset.color).toBe('blue');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Bloqueado');
    });
    new Function(APP_COLOR_INIT_SCRIPT)();
    expect(document.documentElement.dataset.color).toBe('blue');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Bloqueado');
    });
    render(<ColorPicker />);
    fireEvent.click(screen.getByRole('radio', { name: 'Rosado' }));
    expect(document.documentElement.dataset.color).toBe('pink');
    expect(screen.getByRole('status').textContent).toContain('no permite guardarlo');
  });
});
