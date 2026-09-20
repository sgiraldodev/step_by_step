import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/theme-toggle';
import ColorPicker from '@/components/ui/color-picker';
import { TagChip } from '@/modules/focus/components/tag-selector';

export default function DesignSystem() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Design System · Step by step</h1>
        <ThemeToggle />
      </header>
      <section className="panel space-y-4 p-6">
        <h2 className="text-xl font-semibold">Personalización</h2>
        <ColorPicker />
      </section>
      <section className="panel space-y-4 p-6">
        <h2 className="text-xl font-semibold">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Guardar</Button>
          <Button variant="secondary">Cancelar</Button>
          <Button disabled>Deshabilitado</Button>
          <Button loading>Guardando…</Button>
        </div>
      </section>
      <section className="panel space-y-4 p-6">
        <h2 className="text-xl font-semibold">Prioridades y etiquetas</h2>
        <div className="flex flex-wrap gap-3">
          {['Baja', 'Media', 'Alta', 'Urgente'].map((value) => (
            <span key={value} className={`priority-${value} rounded-md px-2 py-1`}>
              {value}
            </span>
          ))}
          <TagChip tag={{ id: 'catalog', name: 'Personal', color: '#7c3aed' }} />
        </div>
      </section>
      <section className="panel space-y-4 p-6">
        <h2 className="text-xl font-semibold">Estados</h2>
        <p role="status">Cargando tus tareas…</p>
        <p>No tienes tareas pendientes.</p>
        <p role="alert" className="text-[var(--error-text)]">
          No se pudo guardar. Inténtalo de nuevo.
        </p>
      </section>
      <Link className="text-[var(--accent-text)] underline" href="/">
        Volver a la aplicación
      </Link>
    </main>
  );
}
