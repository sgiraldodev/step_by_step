import { request } from '@/lib/http';
import type { AppColor } from '@/components/ui/app-colors';
export type User = { id: string; name: string; email: string; app_color?: AppColor };
export const authApi = {
  saveColor: (app_color: AppColor) =>
    request<User>('/auth/preferences', { method: 'PATCH', body: JSON.stringify({ app_color }) }),
  me: () => request<User>('/auth/me'),
  status: () => request<{ setup_required: boolean; email_recovery: boolean }>('/auth/status'),
  login: (email: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (
    name: string,
    email: string,
    password: string,
    setup_code?: string,
    verification_token?: string,
  ) =>
    request<{ user: User; recovery_code: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, setup_code, verification_token }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgot: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  sendCode: (email: string) =>
    request<{ message: string; expires_at: string }>('/auth/recovery-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyCode: (email: string, code: string) =>
    request<{ token: string }>('/auth/recovery-code/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  sendRegistrationCode: (email: string) =>
    request<{ message: string; expires_at: string }>('/auth/registration-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyRegistrationCode: (email: string, code: string) =>
    request<{ token: string }>('/auth/registration-code/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  reset: (data: { email?: string; recovery_code?: string; token?: string; password: string }) =>
    request<{ message: string; recovery_code: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
