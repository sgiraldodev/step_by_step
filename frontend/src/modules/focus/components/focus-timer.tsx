'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, Check, Pause, PictureInPicture2 } from 'lucide-react';

type PictureInPictureBrowser = Window & {
  documentPictureInPicture?: {
    requestWindow: (options: { width: number; height: number }) => Promise<Window>;
  };
};

const floatingStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #111318; color: #f5f5f6; font-family: Arial, sans-serif; }
  main { min-height: 100vh; padding: 18px; display: flex; flex-direction: column; justify-content: center; text-align: center; }
  h1 { margin: 0; color: #bfc3ca; font-size: 15px; font-weight: 500; overflow-wrap: anywhere; }
  .countdown { margin: 12px 0; font: 300 52px/1 ui-monospace, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
  .actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
  button { padding: 8px 12px; border: 1px solid #ffffff40; border-radius: 999px; background: #ffffff14; color: inherit; cursor: pointer; }
  button:hover { background: #ffffff24; }
  button:focus-visible { outline: 2px solid #bfc3ca; outline-offset: 2px; }
  button:disabled { opacity: .5; cursor: default; }
`;

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
  const floatingRef = useRef<Window | null>(null);
  const [floatingWindow, setFloatingWindow] = useState<Window | null>(null);
  const [canFloat, setCanFloat] = useState(false);
  const [floatingError, setFloatingError] = useState('');
  useEffect(() => {
    setCanFloat('documentPictureInPicture' in window);
    return () => floatingRef.current?.close();
  }, []);
  useEffect(() => {
    if (!active) floatingRef.current?.close();
  }, [active]);
  useEffect(() => {
    if (!active || floatingWindow) return;
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
  }, [active, floatingWindow]);

  async function openFloatingWindow() {
    const browser = window as PictureInPictureBrowser;
    if (!browser.documentPictureInPicture) return;
    setFloatingError('');
    try {
      const floating = await browser.documentPictureInPicture.requestWindow({
        width: 320,
        height: 210,
      });
      floating.document.title = 'Temporizador · Step by step';
      const style = floating.document.createElement('style');
      style.textContent = floatingStyles;
      floating.document.head.appendChild(style);
      floating.addEventListener(
        'pagehide',
        () => {
          floatingRef.current = null;
          setFloatingWindow(null);
        },
        { once: true },
      );
      floatingRef.current = floating;
      setFloatingWindow(floating);
    } catch {
      setFloatingError(
        'No se pudo abrir la ventana flotante. Comprueba los permisos del navegador.',
      );
    }
  }

  return (
    <>
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
            {canFloat && (
              <button
                type="button"
                className="focus-pause"
                onClick={() => void openFloatingWindow()}
              >
                <PictureInPicture2 size={18} />
                <span>Ventana flotante</span>
              </button>
            )}
            <button
              autoFocus
              type="button"
              className="focus-pause"
              disabled={busy}
              onClick={onPause}
            >
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
          {floatingError && (
            <p role="alert" className="mt-4 text-sm text-[var(--error-text)]">
              {floatingError}
            </p>
          )}
        </div>
      </dialog>
      {floatingWindow &&
        createPortal(
          <main aria-label="Temporizador flotante">
            <h1>{title}</h1>
            <p className="countdown" aria-label={`${minutes} minutos ${seconds} segundos`}>
              {minutes}:{seconds}
            </p>
            <div className="actions">
              <button type="button" disabled={busy} onClick={onPause}>
                Pausar
              </button>
              <button type="button" onClick={() => floatingWindow.close()}>
                Volver a la aplicación
              </button>
            </div>
          </main>,
          floatingWindow.document.body,
        )}
    </>
  );
}
