import { request } from '@/lib/http';
export type User = { id: string; name: string; email: string };
export const authApi = {
  me: () => request<User>('/auth/me'),
  status: () => request<{ setup_required: boolean; email_recovery: boolean }>('/auth/status'),
  login: (email: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, setup_code?: string) =>
    request<{ user: User; recovery_code: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, setup_code }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgot: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  reset: (data: { email?: string; recovery_code?: string; token?: string; password: string }) =>
    request<{ message: string; recovery_code: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
