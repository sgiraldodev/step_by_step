import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, renderHook } from '@testing-library/react';
import { useTimerSound } from '@/modules/focus/hooks/use-timer-sound';
import { makeTimer, type Timer } from '@/modules/focus/timer';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('suena una sola vez al terminar enfoque y vuelve a sonar al terminar descanso', () => {
  const start = vi.fn();
  const close = vi.fn();
  vi.stubGlobal(
    'AudioContext',
    class {
      state = 'running';
      currentTime = 0;
      destination = {};
      close = close;
      createOscillator() {
        return {
          frequency: { value: 0 },
          connect: vi.fn(),
          disconnect: vi.fn(),
          start,
          stop: vi.fn(),
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          disconnect: vi.fn(),
        };
      }
    },
  );
  const onError = vi.fn();
  const work = makeTimer(1, 'work');
  const hook = renderHook(({ timer }: { timer: Timer }) => useTimerSound(timer, onError), {
    initialProps: { timer: work },
  });
  fireEvent.pointerDown(document.body);
  expect(start).not.toHaveBeenCalled();
  const decision: Timer = { ...work, phase: 'decision', remaining: 0, deadline: null };
  hook.rerender({ timer: decision });
  expect(start).toHaveBeenCalledTimes(7);
  hook.rerender({ timer: { ...decision } });
  expect(start).toHaveBeenCalledTimes(7);
  hook.rerender({ timer: makeTimer(1, 'rest') });
  hook.rerender({ timer: makeTimer(1, 'work') });
  expect(start).toHaveBeenCalledTimes(14);
  expect(onError).not.toHaveBeenCalled();
  hook.unmount();
  expect(close).toHaveBeenCalledOnce();
});
