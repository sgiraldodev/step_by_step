'use client';
import { useEffect, useState } from 'react';
import {
  advanceTimer,
  businessDay,
  DEFAULT_SETTINGS,
  REST_SECONDS,
  validSettings,
  WORK_SECONDS,
  type Timer,
  type TimerSettings,
} from '@/modules/focus/timer';
import type { User } from '@/modules/auth/auth';

export function useTimerSession(user: User, timeZone: string, onError: (message: string) => void) {
  const STORAGE_KEY = `pomodoro-session-v2:${user.id}`;
  const SETTINGS_KEY = `pomodoro-settings-v2:${user.id}`;
  const [timer, setTimer] = useState<Timer | null>(null);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    // Only the verified original owner may inherit this installation's old browser session.
    if (user.id === '00000000-0000-4000-8000-000000000001') {
      try {
        for (const [oldKey, newKey] of [
          ['pomodoro-session-v1', STORAGE_KEY],
          ['pomodoro-settings-v1', SETTINGS_KEY],
        ]) {
          const previous = localStorage.getItem(oldKey);
          if (previous && !localStorage.getItem(newKey)) localStorage.setItem(newKey, previous);
          localStorage.removeItem(oldKey);
        }
      } catch {
        /* Browser storage may be unavailable. */
      }
    }
    let restoredSettings = DEFAULT_SETTINGS;
    try {
      const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (validSettings(storedSettings)) restoredSettings = storedSettings;
    } catch {
      /* Invalid preferences fall back to the default durations. */
    }
    setSettings(restoredSettings);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const value = JSON.parse(stored) as Timer;
        if (
          Number.isInteger(value.taskId) &&
          ['work', 'rest', 'decision'].includes(value.phase) &&
          Number.isFinite(value.remaining) &&
          value.remaining >= 0 &&
          (value.deadline === null || Number.isFinite(value.deadline)) &&
          typeof value.paused === 'boolean' &&
          typeof value.operationId === 'string'
        ) {
          const duration =
            Number.isFinite(value.duration) && (value.duration ?? 0) > 0
              ? value.duration
              : value.phase === 'rest'
                ? REST_SECONDS
                : WORK_SECONDS;
          if (value.phase === 'rest' && value.routineDate && value.routineDate !== businessDay())
            setTimer(null);
          else setTimer(advanceTimer({ ...value, duration }, Date.now(), restoredSettings));
        }
      }
    } catch {
      /* A damaged browser session can safely be discarded. */
    }
    setReady(true);
  }, [SETTINGS_KEY, STORAGE_KEY, user.id]);
  useEffect(() => {
    if (!ready) return;
    try {
      if (timer) localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      onError('Tu navegador no permite conservar el temporizador al recargar.');
    }
  }, [timer, ready, STORAGE_KEY, onError]);
  useEffect(() => {
    const interval = setInterval(
      () =>
        setTimer((current) => {
          if (
            !current ||
            (current.phase === 'rest' &&
              current.routineDate &&
              current.routineDate !== businessDay(timeZone))
          )
            return null;
          return advanceTimer(current, Date.now(), settings);
        }),
      250,
    );
    return () => clearInterval(interval);
  }, [settings, timeZone]);

  function saveSettings(value: TimerSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
      setSettings(value);
    } catch {
      onError('Tu navegador no permite guardar la configuración.');
    }
  }
  return { timer, setTimer, ready, settings, saveSettings };
}
