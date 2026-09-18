import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  advanceTimer,
  investedSeconds,
  businessDay,
  makeTimer,
  togglePause,
  validSettings,
  WORK_SECONDS,
  DEFAULT_SETTINGS,
} from '@/modules/focus/timer';

afterEach(() => vi.restoreAllMocks());
describe('Temporizador persistente', () => {
  it('detiene el trabajo hasta responder y comienza un bloque completo tras el descanso', () => {
    const timer = makeTimer(1, 'work');
    expect(timer.remaining).toBe(WORK_SECONDS);
    expect(advanceTimer(timer, timer.deadline! - 1000).remaining).toBe(1);
    expect(advanceTimer(timer, timer.deadline! - timer.remaining * 1000)).toBe(timer);
    const decision = advanceTimer(timer, timer.deadline!);
    expect(decision.phase).toBe('decision');
    expect(advanceTimer(decision, Date.now() + 999999)).toBe(decision);
    const rest = makeTimer(1, 'rest', { workMinutes: 45, restMinutes: 10 });
    expect(
      advanceTimer({ ...rest, routineDate: '2026-09-17' }, rest.deadline! + 999999, {
        workMinutes: 20,
        restMinutes: 3,
      }),
    ).toMatchObject({ phase: 'work', remaining: 1200, routineDate: '2026-09-17' });
  });
  it('conserva el esfuerzo exacto al pausar, reanudar y reintentar', () => {
    let now = 100000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    let timer = makeTimer(1, 'work');
    now += 125500;
    expect(investedSeconds(timer)).toBe(125);
    timer = togglePause(timer);
    expect(advanceTimer(timer, now + 999999)).toBe(timer);
    now += 600000;
    expect(investedSeconds(timer)).toBe(125);
    timer = togglePause(timer);
    now += 30500;
    expect(investedSeconds(timer)).toBe(156);
    expect(investedSeconds({ ...timer, resolvedSeconds: 156 }, now + 999999)).toBe(156);
    expect(investedSeconds(advanceTimer(timer, timer.deadline!))).toBe(WORK_SECONDS);
  });
  it('valida las duraciones y respeta medianoche en Bogotá', () => {
    expect(validSettings(DEFAULT_SETTINGS)).toBe(true);
    for (const value of [
      null,
      1,
      {},
      { workMinutes: 0, restMinutes: 5 },
      { workMinutes: 181, restMinutes: 5 },
      { workMinutes: 25.5, restMinutes: 5 },
      { workMinutes: 30, restMinutes: 0 },
      { workMinutes: 30, restMinutes: 61 },
    ])
      expect(validSettings(value)).toBe(false);
    expect(businessDay('America/Bogota', new Date('2026-09-18T04:59:59Z'))).toBe('2026-09-17');
    expect(businessDay('America/Bogota', new Date('2026-09-18T05:00:00Z'))).toBe('2026-09-18');
    expect(businessDay()).toHaveLength(10);
    const decision = { ...makeTimer(1, 'work'), phase: 'decision' as const };
    expect(togglePause(decision)).toBe(decision);
    const expired = { ...makeTimer(1, 'work'), deadline: Date.now() - 1 };
    expect(togglePause(expired).phase).toBe('decision');
    const withoutDeadline = { ...makeTimer(1, 'work'), deadline: null };
    expect(advanceTimer(withoutDeadline, Date.now())).toBe(withoutDeadline);
    expect(investedSeconds({ ...withoutDeadline, duration: undefined })).toBe(WORK_SECONDS);
    expect(investedSeconds({ ...withoutDeadline, paused: true, remainingMs: undefined })).toBe(0);
    expect(
      togglePause({ ...withoutDeadline, paused: true, remainingMs: undefined }).deadline,
    ).toBeGreaterThan(Date.now());
  });
});
