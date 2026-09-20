import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LandingPage from '@/modules/auth/components/landing-page';

afterEach(cleanup);

it('permite elegir momentos y abrir el registro o el acceso', () => {
  render(<LandingPage />);
  expect(screen.getByRole('button', { name: 'Música' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Guitarra' }));
  expect(screen.getByRole('button', { name: 'Música' }).getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByRole('button', { name: 'Guitarra' }).getAttribute('aria-pressed')).toBe(
    'true',
  );
  expect(screen.getByText('Vuelve a tus acordes favoritos.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Lectura' }));
  expect(screen.getByText('Un capítulo para ti.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Encuentra tu ritmo' }).getAttribute('href')).toBe(
    '/acceso#registro',
  );
  expect(screen.getByRole('link', { name: 'Crear mi espacio' }).getAttribute('href')).toBe(
    '/acceso#registro',
  );
  expect(screen.getByRole('link', { name: 'Entrar' }).getAttribute('href')).toBe('/acceso');
});
