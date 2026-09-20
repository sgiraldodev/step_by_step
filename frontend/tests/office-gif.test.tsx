import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import OfficeGif from '@/modules/focus/components/office-gif';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('GIF de fin de enfoque', () => {
  it('elige un GIF por apertura y mantiene la selección al pausar', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const first = render(<OfficeGif />);
    expect(screen.getByRole('img').getAttribute('src')).toContain('/gifs/the-office/high-five.gif');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar GIF' }));
    expect(screen.getByRole('img').getAttribute('src')).toContain('/gifs/the-office/high-five.png');
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir GIF' }));
    expect(screen.getByRole('img').getAttribute('src')).toContain('/gifs/the-office/high-five.gif');
    first.unmount();
    random.mockReturnValue(0.99);
    render(<OfficeGif />);
    expect(screen.getByRole('img').getAttribute('src')).toContain('/gifs/the-office/message.gif');
  });

  it('respeta movimiento reducido y comunica errores de imagen', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.spyOn(Math, 'random').mockReturnValue(1.5 / 15);
    render(<OfficeGif />);
    expect(screen.getByRole('img').getAttribute('src')).toContain(
      '/gifs/the-office/celebration.png',
    );
    expect(screen.getByRole('button', { name: 'Reproducir GIF' })).toBeTruthy();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status').textContent).toContain('No se pudo cargar el GIF');
  });

  it('permite elegir quince GIF distintos con sus imágenes estáticas disponibles', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const random = vi.spyOn(Math, 'random');
    const selected = new Set<string>();
    for (let index = 0; index < 15; index++) {
      random.mockReturnValue((index + 0.5) / 15);
      const view = render(<OfficeGif />);
      const source = new URL(screen.getByRole('img').getAttribute('src')!, 'http://localhost')
        .pathname;
      selected.add(source);
      const animated = readFileSync(join(process.cwd(), 'public', source.slice(1)));
      expect(animated.subarray(0, 3).toString()).toBe('GIF');
      fireEvent.click(screen.getByRole('button', { name: 'Pausar GIF' }));
      const still = readFileSync(
        join(process.cwd(), 'public', source.slice(1).replace('.gif', '.png')),
      );
      expect(still.subarray(1, 4).toString()).toBe('PNG');
      view.unmount();
    }
    expect(selected.size).toBe(15);
  });
});
