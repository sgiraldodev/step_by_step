'use client';
import { Button } from '@/components/ui/button';
import ColorPicker from '@/components/ui/color-picker';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Settings, X } from 'lucide-react';
import { DEFAULT_SETTINGS, validSettings, type TimerSettings } from '@/modules/focus/timer';

export default function TimerSettingsMenu({
  settings,
  onSave,
  disabled,
}: {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
  disabled: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [work, setWork] = useState(String(settings.workMinutes));
  const [rest, setRest] = useState(String(settings.restMinutes));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (disabled) dialog.current?.close();
  }, [disabled]);
  function open() {
    setWork(String(settings.workMinutes));
    setRest(String(settings.restMinutes));
    setError('');
    setSaved(false);
    dialog.current?.showModal();
  }
  function save(e: FormEvent) {
    e.preventDefault();
    const value = { workMinutes: Number(work), restMinutes: Number(rest) };
    if (!validSettings(value)) {
      setError('Usa minutos enteros: concentración de 1 a 180 y descanso de 1 a 60.');
      return;
    }
    try {
      onSave(value);
      dialog.current?.close();
      setSaved(true);
    } catch {
      setError('No se pudo guardar la configuración en este navegador. Inténtalo de nuevo.');
    }
  }
  return (
    <div>
      <button
        onClick={open}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--secondary)] hover:bg-[var(--surface-hover)]"
        aria-haspopup="dialog"
      >
        <Settings size={16} />
        <span className="sr-only sm:not-sr-only">Configuración</span>
      </button>
      {saved && (
        <span role="status" className="sr-only">
          Configuración guardada
        </span>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="settings-title"
        aria-describedby="settings-description"
        className="m-auto max-h-[calc(100dvh-40px)] w-[calc(100%-40px)] max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-xl backdrop:bg-slate-900/35 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="settings-title" className="text-xl font-semibold">
            Tu configuración
          </h2>
          <button
            aria-label="Cerrar configuración"
            onClick={() => dialog.current?.close()}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>
        <p id="settings-description" className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Define la duración de tus próximos bloques. El bloque actual conservará su tiempo.
        </p>
        <form onSubmit={save} className="mt-6 space-y-5">
          <div>
            <label htmlFor="work-minutes" className="text-sm font-medium">
              Tiempo de concentración
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="work-minutes"
                autoFocus
                type="number"
                min={1}
                max={180}
                step={1}
                required
                value={work}
                onChange={(e) => setWork(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-3"
              />
              <span className="text-sm text-[var(--muted)]">minutos</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">De 1 a 180 minutos</p>
          </div>
          <div>
            <label htmlFor="rest-minutes" className="text-sm font-medium">
              Tiempo de descanso
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="rest-minutes"
                type="number"
                min={1}
                max={60}
                step={1}
                required
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-3"
              />
              <span className="text-sm text-[var(--muted)]">minutos</span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">De 1 a 60 minutos</p>
          </div>
          <ColorPicker />
          {error && (
            <p role="alert" className="text-sm text-[var(--error-text)]">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button
              type="button"
              className="text-xs text-[var(--muted)] underline"
              onClick={() => {
                setWork(String(DEFAULT_SETTINGS.workMinutes));
                setRest(String(DEFAULT_SETTINGS.restMinutes));
              }}
            >
              Restaurar 30 / 5
            </button>
            <Button type="submit" className="text-sm">
              Guardar configuración
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
