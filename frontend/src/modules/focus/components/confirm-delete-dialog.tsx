'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ConfirmDeleteDialog({
  title,
  description,
  keepTagsOption = false,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  keepTagsOption?: boolean;
  busy: boolean;
  onConfirm: (keepTags: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const [keepTags, setKeepTags] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    return () => modal?.close();
  }, []);

  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setError('');
    try {
      await onConfirm(keepTags);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo borrar. Inténtalo de nuevo.');
    } finally {
      submitting.current = false;
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      className="m-auto max-h-[calc(100dvh-40px)] w-[calc(100%-40px)] max-w-md overflow-y-auto rounded-2xl border border-[var(--error-border)] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-xl backdrop:bg-slate-900/35 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id="delete-title" className="text-xl font-semibold">
        {title}
      </h2>
      <p id="delete-description" className="mt-3 text-sm leading-6 text-[var(--secondary)]">
        {description}
      </p>
      {keepTagsOption && (
        <label className="mt-5 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={keepTags}
            onChange={(event) => setKeepTags(event.target.checked)}
            disabled={busy}
            className="size-4 accent-[var(--accent)]"
          />
          Conservar mis etiquetas
        </label>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--error-text)]">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" autoFocus disabled={busy} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" loading={busy} onClick={() => void confirm()}>
          {busy ? 'Borrando…' : 'Sí, borrar'}
        </Button>
      </div>
    </dialog>
  );
}
