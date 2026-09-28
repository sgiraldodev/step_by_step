'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { priorities, type Priority, type Tag } from '@/modules/focus/tasks';
import TagSelector from '@/modules/focus/components/tag-selector';

export default function TaskCreateDialog({
  create,
  title,
  setTitle,
  priority,
  setPriority,
  busy,
  tags,
  selectedTags,
  setSelectedTags,
  createTag,
  onClose,
}: {
  create: (event: FormEvent) => Promise<boolean>;
  title: string;
  setTitle: (value: string) => void;
  priority: Priority;
  setPriority: (value: Priority) => void;
  busy: boolean;
  tags: Tag[];
  selectedTags: string[];
  setSelectedTags: (value: string[]) => void;
  createTag: (name: string, color: string) => Promise<Tag>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    titleInput.current?.focus();
    return () => modal?.close();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || busy) return;
    submitting.current = true;
    setFailed(false);
    try {
      if (await create(event)) onClose();
      else setFailed(true);
    } finally {
      submitting.current = false;
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="create-task-title"
      className="m-auto max-h-[calc(100dvh-40px)] w-[calc(100%-40px)] max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="create-task-title" className="text-xl font-semibold">
          Nueva tarea
        </h2>
        <button
          type="button"
          aria-label="Cerrar nueva tarea"
          disabled={busy}
          onClick={onClose}
          className="rounded-lg p-3"
        >
          <X size={20} />
        </button>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Define tu siguiente paso. Puedes añadir prioridad y etiquetas.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          Título de la tarea
          <input
            ref={titleInput}
            required
            maxLength={300}
            disabled={busy}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="¿En qué vas a trabajar?"
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium">
          Prioridad
          <select
            disabled={busy}
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base"
          >
            {priorities.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <TagSelector
          tags={tags}
          selected={selectedTags}
          onChange={setSelectedTags}
          onCreate={createTag}
          disabled={busy}
        />
        {failed && (
          <p role="alert" className="text-sm text-[var(--error-text)]">
            No se pudo crear la tarea. Revisa la conexión e inténtalo de nuevo.
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy} disabled={!title.trim()}>
            {busy ? 'Guardando…' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
