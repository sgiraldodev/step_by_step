'use client';
import type { CSSProperties, Dispatch, SetStateAction, RefObject } from 'react';
import { Coffee, Timer as TimerIcon, Play, Pause, Check, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { togglePause, type Timer, type TimerSettings } from '@/modules/focus/timer';
import type { Task } from '@/modules/focus/tasks';
type TimerPanelProps = {
  rest: boolean;
  timer: Timer | null;
  progress: number;
  minutes: string;
  seconds: string;
  activeTask: Task | undefined;
  settings: TimerSettings;
  setTimer: Dispatch<SetStateAction<Timer | null>>;
  resumeButton: RefObject<HTMLButtonElement | null>;
  busy: boolean;
  resolve: (finished: boolean) => Promise<void>;
  switchTask: () => Promise<void>;
};
export default function TimerPanel({
  rest,
  timer,
  progress,
  minutes,
  seconds,
  activeTask,
  settings,
  setTimer,
  resumeButton,
  busy,
  resolve,
  switchTask,
}: TimerPanelProps) {
  return (
    <section
      className="panel flex flex-col items-center px-6 py-7 text-center"
      aria-label="Temporizador"
    >
      <div className="mb-6 flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-text)]">
        {rest ? <Coffee size={13} /> : <TimerIcon size={13} />}{' '}
        {rest ? 'Hora de descansar' : timer ? 'Tiempo de enfoque' : 'Listo para enfocarte'}
      </div>
      <div className="timer-ring" style={{ '--progress': `${progress}%` } as CSSProperties}>
        <div className="timer-inner">
          <p
            className="font-mono text-[54px] leading-none tracking-tighter tabular-nums"
            aria-label={`${minutes} minutos ${seconds} segundos`}
          >
            {minutes}
            <span className="text-[var(--faint)]">:</span>
            {seconds}
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {timer?.paused
              ? 'En pausa'
              : rest
                ? 'Respira. Recarga.'
                : timer?.phase === 'decision'
                  ? 'Bloque completado'
                  : 'minutos de enfoque'}
          </p>
        </div>
      </div>
      <p className="mt-6 max-w-full break-words text-sm font-medium">
        {activeTask?.title || 'Tu siguiente paso empieza aquí'}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {timer
          ? rest
            ? 'El siguiente bloque comienza al terminar el descanso.'
            : 'Concéntrate en una sola cosa. Lo demás puede esperar.'
          : 'Selecciona una tarea para iniciar tu Pomodoro.'}
      </p>
      {timer && timer.phase !== 'decision' ? (
        <div className="mt-6 flex w-full gap-2">
          <Button
            ref={resumeButton}
            className="flex flex-1 items-center justify-center gap-2 text-sm"
            onClick={() => setTimer((current) => (current ? togglePause(current, settings) : null))}
            disabled={busy || timer.resolvedSeconds !== undefined}
          >
            {timer.paused ? <Play size={16} /> : <Pause size={16} />}
            {timer.paused ? 'Reanudar' : 'Pausar'}
          </Button>
          {timer.phase === 'work' && (
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--accent-text)] px-3 py-3 text-sm font-semibold text-[var(--accent-text)] hover:bg-[var(--accent-soft)]"
              disabled={busy || timer.resolutionAction === 'interrupt'}
              onClick={() => void resolve(true)}
            >
              <Check size={16} />
              {busy ? 'Guardando…' : 'Terminar'}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--surface-subtle)] py-3 text-xs text-[var(--muted)]">
          <Play size={14} />
          {timer ? 'Resuelve el bloque para continuar' : 'Esperando una tarea'}
        </div>
      )}
      {timer && timer.phase !== 'decision' && (
        <>
          <button
            type="button"
            disabled={busy || timer.resolutionAction === 'resolve'}
            onClick={() => void switchTask()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-xs text-[var(--accent-text)]"
          >
            <ArrowLeftRight size={15} />
            Cambiar de tarea
          </button>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            Guarda el tiempo trabajado y vuelve a pendiente; no la marca como terminada.
          </p>
        </>
      )}
    </section>
  );
}
