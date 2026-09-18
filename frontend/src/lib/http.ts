export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Step-Client': 'web', ...options?.headers },
    cache: 'no-store',
  });
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth'))
      window.dispatchEvent(new Event('step-session-expired'));
    const body = await response.json().catch(() => null);
    throw new Error(
      typeof body?.detail === 'string'
        ? body.detail
        : typeof body?.detail?.message === 'string'
          ? body.detail.message
          : 'No se pudo guardar. Revisa la conexión e inténtalo otra vez.',
    );
  }
  return response.json();
}
