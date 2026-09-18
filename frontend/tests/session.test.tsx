import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useTimerSession } from '@/modules/focus/hooks/use-timer-session';
import { makeTimer, DEFAULT_SETTINGS } from '@/modules/focus/timer';
const user = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Santiago Giraldo',
  email: 'santi@example.test',
};
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
it('hereda exclusivamente la sesión del propietario original y conserva preferencias', () => {
  localStorage.setItem('pomodoro-session-v1', JSON.stringify(makeTimer(1, 'work')));
  localStorage.setItem(
    'pomodoro-settings-v1',
    JSON.stringify({ workMinutes: 45, restMinutes: 10 }),
  );
  const hook = renderHook(() => useTimerSession(user, 'America/Bogota', vi.fn()));
  expect(hook.result.current.ready).toBe(true);
  expect(hook.result.current.settings.workMinutes).toBe(45);
  expect(hook.result.current.timer?.taskId).toBe(1);
  expect(localStorage.getItem('pomodoro-session-v1')).toBeNull();
  act(() => hook.result.current.saveSettings(DEFAULT_SETTINGS));
  expect(hook.result.current.settings.workMinutes).toBe(30);
});
it('descarta sesiones dañadas y descansos del día anterior', () => {
  localStorage.setItem(`pomodoro-session-v2:${user.id}`, 'invalid');
  let hook = renderHook(() => useTimerSession(user, 'America/Bogota', vi.fn()));
  expect(hook.result.current.timer).toBeNull();
  hook.unmount();
  localStorage.setItem(
    `pomodoro-session-v2:${user.id}`,
    JSON.stringify({ ...makeTimer(1, 'rest'), routineDate: '2000-01-01', duration: undefined }),
  );
  hook = renderHook(() => useTimerSession(user, 'America/Bogota', vi.fn()));
  expect(hook.result.current.timer).toBeNull();
});
it('mantiene el reloj por fecha límite y anuncia errores de almacenamiento', () => {
  vi.useFakeTimers();
  localStorage.setItem(`pomodoro-session-v2:${user.id}`, JSON.stringify(makeTimer(1, 'work')));
  const onError = vi.fn();
  const hook = renderHook(() => useTimerSession(user, 'America/Bogota', onError));
  act(() => vi.advanceTimersByTime(1000));
  expect(hook.result.current.timer?.remaining).toBe(1799);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Almacenamiento no disponible');
  });
  act(() => hook.result.current.saveSettings(DEFAULT_SETTINGS));
  expect(onError).toHaveBeenCalled();
  act(() => hook.result.current.setTimer(makeTimer(2, 'work')));
  expect(onError).toHaveBeenCalledWith(
    'Tu navegador no permite conservar el temporizador al recargar.',
  );
});
