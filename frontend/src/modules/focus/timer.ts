export const WORK_SECONDS = 30 * 60;
export const REST_SECONDS = 5 * 60;
export type TimerSettings = { workMinutes: number; restMinutes: number };
export const DEFAULT_SETTINGS: TimerSettings = { workMinutes: 30, restMinutes: 5 };
export function businessDay(timeZone = 'America/Bogota', now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function validSettings(value: unknown): value is TimerSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as TimerSettings;
  return (
    Number.isInteger(settings.workMinutes) &&
    settings.workMinutes >= 1 &&
    settings.workMinutes <= 180 &&
    Number.isInteger(settings.restMinutes) &&
    settings.restMinutes >= 1 &&
    settings.restMinutes <= 60
  );
}
export type Timer = {
  taskId: number;
  phase: 'work' | 'rest' | 'decision';
  remaining: number;
  deadline: number | null;
  paused: boolean;
  operationId: string;
  duration?: number;
  remainingMs?: number;
  resolvedSeconds?: number;
  resolutionAction?: 'resolve' | 'interrupt';
  routineDate?: string | null;
};
export function makeTimer(
  taskId: number,
  phase: 'work' | 'rest',
  settings: TimerSettings = DEFAULT_SETTINGS,
): Timer {
  const remaining = (phase === 'work' ? settings.workMinutes : settings.restMinutes) * 60;
  return {
    taskId,
    phase,
    remaining,
    duration: remaining,
    deadline: Date.now() + remaining * 1000,
    paused: false,
    operationId: crypto.randomUUID(),
  };
}
export function advanceTimer(
  timer: Timer,
  now: number,
  settings: TimerSettings = DEFAULT_SETTINGS,
): Timer {
  if (timer.paused || timer.phase === 'decision' || timer.deadline === null) return timer;
  const remaining = Math.max(0, Math.ceil((timer.deadline - now) / 1000));
  if (remaining > 0) return remaining === timer.remaining ? timer : { ...timer, remaining };
  if (timer.phase === 'work') return { ...timer, phase: 'decision', remaining: 0, deadline: null };
  // A new work block starts when the user returns; never invent unattended cycles.
  return { ...makeTimer(timer.taskId, 'work', settings), routineDate: timer.routineDate };
}
export function togglePause(timer: Timer, settings: TimerSettings = DEFAULT_SETTINGS): Timer {
  if (timer.phase === 'decision') return timer;
  if (timer.paused)
    return {
      ...timer,
      paused: false,
      deadline: Date.now() + (timer.remainingMs ?? timer.remaining * 1000),
    };
  const remaining = Math.max(0, Math.ceil(((timer.deadline ?? Date.now()) - Date.now()) / 1000));
  if (!remaining) return advanceTimer(timer, Date.now(), settings);
  return {
    ...timer,
    paused: true,
    remaining,
    remainingMs: Math.max(0, (timer.deadline ?? Date.now()) - Date.now()),
    deadline: null,
  };
}

export function investedSeconds(timer: Timer, now = Date.now()): number {
  if (timer.resolvedSeconds !== undefined) return timer.resolvedSeconds;
  const duration = timer.duration ?? WORK_SECONDS;
  const remainingMs =
    timer.phase === 'decision'
      ? 0
      : timer.paused
        ? (timer.remainingMs ?? timer.remaining * 1000)
        : Math.max(0, (timer.deadline ?? now) - now);
  return Math.max(0, Math.min(duration, Math.floor(duration - remainingMs / 1000)));
}
