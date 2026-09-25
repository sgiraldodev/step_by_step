import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from '@/lib/http';

afterEach(() => vi.unstubAllGlobals());
describe('Cliente HTTP', () => {
  it('utiliza la API versionada y la protección del navegador', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    expect(await request('/tasks')).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/tasks',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Step-Client': 'web' }),
        cache: 'no-store',
      }),
    );
  });
  it('conserva los mensajes de error y anuncia la expiración de sesión', async () => {
    const event = vi.fn();
    window.addEventListener('step-session-expired', event);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: { code: 'AUTH_REQUIRED', message: 'Inicia sesión.' } }),
      }),
    );
    await expect(request('/tasks')).rejects.toThrow('Inicia sesión.');
    expect(event).toHaveBeenCalledOnce();
    await expect(request('/auth/me')).rejects.toThrow('Inicia sesión.');
    expect(event).toHaveBeenCalledOnce();
    window.removeEventListener('step-session-expired', event);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ detail: 'Conflicto.' }),
      }),
    );
    await expect(request('/tasks', { method: 'PATCH' })).rejects.toThrow('Conflicto.');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error();
        },
      }),
    );
    await expect(request('/tasks')).rejects.toThrow('Revisa la conexión');
  });
  it('acepta respuestas vacías al eliminar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    await expect(request('/tasks/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});
