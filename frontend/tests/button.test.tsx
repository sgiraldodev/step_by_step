import { afterEach, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Button } from '@/components/ui/button';
afterEach(cleanup);
it('expone los estados accesibles sin perder las propiedades nativas', () => {
  render(<Button loading>Guardando</Button>);
  expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  cleanup();
  render(
    <Button variant="secondary" type="submit">
      Guardar
    </Button>,
  );
  expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  expect(screen.getByRole('button').className).toContain('secondary-button');
  cleanup();
  render(<Button variant="destructive">Sí, borrar</Button>);
  expect(screen.getByRole('button').className).toContain('destructive-button');
});
