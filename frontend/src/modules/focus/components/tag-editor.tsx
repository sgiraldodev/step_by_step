'use client';
import { Button } from '@/components/ui/button';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Tag } from '@/modules/focus/tasks';
import TagSelector from '@/modules/focus/components/tag-selector';

export default function TagEditor({
  target,
  tags,
  onCreate,
  onSave,
  onClose,
  busy,
}: {
  target: { title: string; tags: Tag[] } | null;
  tags: Tag[];
  busy: boolean;
  onCreate: (name: string, color: string) => Promise<Tag>;
  onSave: (ids: string[]) => Promise<boolean>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (target) {
      setSelected(target.tags.map((tag) => tag.id));
      setFailed(false);
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [target]);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="tag-editor-title"
      className="m-auto max-h-[90vh] w-[90vw] max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--ink)] backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="tag-editor-title" className="text-lg font-semibold">
          Clasificar actividad
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Cerrar etiquetas"
          className="rounded-lg p-2"
        >
          <X size={18} />
        </button>
      </div>
      <p className="mb-5 break-words text-sm text-[var(--muted)]">{target?.title}</p>
      <TagSelector
        tags={tags}
        selected={selected}
        onChange={setSelected}
        onCreate={onCreate}
        disabled={busy}
      />
      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
        Los bloques ya registrados conservan las etiquetas que tenían al cerrarse.
      </p>
      <p role="alert" className="mt-3 text-xs text-[var(--error-text)]">
        {failed
          ? 'No se pudieron guardar las etiquetas. Revisa tu conexión y vuelve a intentarlo.'
          : ''}
      </p>
      <Button
        type="button"
        disabled={busy}
        onClick={async () => {
          setFailed(false);
          if (await onSave(selected)) onClose();
          else setFailed(true);
        }}
        className="mt-6 w-full text-sm"
      >
        {busy ? 'Guardando…' : 'Guardar etiquetas'}
      </Button>
    </dialog>
  );
}
