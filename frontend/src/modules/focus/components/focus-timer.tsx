'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeftRight, Check, Pause } from 'lucide-react';

export default function FocusTimer({
  active,
  title,
  minutes,
  seconds,
  busy,
  onPause,
  onFinish,
  onSwitch,
}: {
  active: boolean;
  title: string;
  minutes: string;
  seconds: string;
  busy: boolean;
  onPause: () => void;
  onFinish: () => void;
  onSwitch: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!active) return;
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus replaces any configuration/history panel that was open during a break.
    document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((openDialog) => {
      if (openDialog !== modal) openDialog.close();
    });
    if (modal && !modal.open) modal.showModal();
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  return (
    <dialog
      ref={dialog}
      className="focus-overlay"
      aria-labelledby="focus-task-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onPause();
      }}
    >
      <div className="focus-content">
        <h2 id="focus-task-title" className="focus-title">
          {title}
        </h2>
        <p className="focus-countdown" aria-label={`${minutes} minutos ${seconds} segundos`}>
          {minutes}
          <span className="focus-colon">:</span>
          {seconds}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button autoFocus type="button" className="focus-pause" disabled={busy} onClick={onPause}>
            <Pause size={18} />
            <span>Pausar</span>
          </button>
          <button
            type="button"
            className="focus-pause focus-finish"
            disabled={busy}
            onClick={onFinish}
          >
            <Check size={18} />
            <span>Terminar</span>
          </button>
          <button type="button" className="focus-pause" disabled={busy} onClick={onSwitch}>
            <ArrowLeftRight size={18} />
            <span>Cambiar de tarea</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
