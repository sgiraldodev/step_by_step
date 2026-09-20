'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Tag } from '@/modules/focus/tasks';

export const TAG_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#0891b2',
  '#15803d',
  '#64748b',
];
export function TagChip({ tag, children }: { tag: Tag; children?: React.ReactNode }) {
  return (
    <span className="tag-chip" style={{ borderColor: tag.color, background: `${tag.color}18` }}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tag.color }} />
      {tag.name}
      {children}
    </span>
  );
}

export default function TagSelector({
  tags,
  selected,
  onChange,
  onCreate,
  disabled = false,
}: {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string, color: string) => Promise<Tag>;
  disabled?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside, true);
    return () => document.removeEventListener('pointerdown', closeOutside, true);
  }, [open]);
  const normalized = query.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const matches = tags.filter((tag) => tag.name.toLocaleLowerCase().includes(normalized));
  const exact = tags.find((tag) => tag.name.toLocaleLowerCase() === normalized);
  function toggle(tagId: string) {
    if (selected.includes(tagId)) onChange(selected.filter((value) => value !== tagId));
    else if (selected.length < 10) onChange([...selected, tagId]);
  }
  async function add() {
    if (!normalized || saving || disabled || selected.length >= 10) return;
    if (exact) {
      if (!selected.includes(exact.id)) onChange([...selected, exact.id]);
      setQuery('');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const tag = await onCreate(query.trim(), color);
      onChange([...new Set([...selected, tag.id])]);
      setQuery('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la etiqueta.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      ref={container}
      className="tag-selector"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id} className="mb-2 block text-xs font-semibold">
        Etiquetas
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
        {tags
          .filter((tag) => selected.includes(tag.id))
          .map((tag) => (
            <TagChip key={tag.id} tag={tag}>
              <button
                type="button"
                aria-label={`Quitar etiqueta ${tag.name}`}
                disabled={disabled || saving}
                onClick={() => toggle(tag.id)}
                className="rounded p-0.5"
              >
                <X size={12} />
              </button>
            </TagChip>
          ))}
        <input
          id={id}
          value={query}
          disabled={disabled || saving}
          maxLength={50}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void add();
            }
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
            }
          }}
          placeholder="Busca o escribe una etiqueta…"
          aria-controls={`${id}-options`}
          className="min-w-36 flex-1 bg-transparent px-1 py-1 text-sm"
        />
        <button
          type="button"
          aria-label={open ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="px-2 text-xs text-[var(--accent-text)]"
        >
          {open ? 'Cerrar' : 'Elegir'}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted)]">
        Selecciona varias o escribe y presiona Enter para crear. Máximo 10.
      </p>
      {open && (
        <div
          id={`${id}-options`}
          className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2"
        >
          <div className="max-h-40 overflow-y-auto">
            {matches.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[var(--surface-hover)]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(tag.id)}
                  disabled={
                    disabled || saving || (!selected.includes(tag.id) && selected.length >= 10)
                  }
                  onChange={() => toggle(tag.id)}
                  className="accent-[var(--accent)]"
                />
                <TagChip tag={tag} />
              </label>
            ))}
            {matches.length === 0 && (
              <p className="p-2 text-xs text-[var(--muted)]">
                {query ? 'Crea una etiqueta con este nombre.' : 'Todavía no hay etiquetas.'}
              </p>
            )}
          </div>
          {normalized && !exact && (
            <div className="mt-2 border-t border-[var(--border)] pt-3">
              <div
                className="mb-3 flex flex-wrap gap-2"
                role="group"
                aria-label="Color de la nueva etiqueta"
              >
                {TAG_COLORS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Color ${value}`}
                    aria-pressed={color === value}
                    onClick={() => setColor(value)}
                    className="h-6 w-6 rounded-full border-2"
                    style={{
                      background: value,
                      borderColor: color === value ? 'var(--ink)' : 'transparent',
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={disabled || saving || selected.length >= 10}
                onClick={() => void add()}
                className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-text)]"
              >
                <Plus size={14} />
                {saving ? 'Creando…' : `Crear “${query.trim()}”`}
              </button>
            </div>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-[var(--error-text)]">
          {error}
        </p>
      )}
    </div>
  );
}
