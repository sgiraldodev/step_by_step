'use client';
import type { FormEvent, RefObject } from 'react';
import {
  Check,
  Circle,
  Clock3,
  Tags,
  RotateCcw,
  Plus,
  ListTodo,
  Timer as TimerIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { priorities, type Task, type Tag, type Priority } from '@/modules/focus/tasks';
import type { Timer } from '@/modules/focus/timer';
import TagSelector, { TagChip } from '@/modules/focus/components/tag-selector';
export const tabs = ['Todas', 'Pendientes', 'En progreso', 'Terminadas'] as const;
export type TaskTab = (typeof tabs)[number];
type TaskListProps = {
  create: (event: FormEvent) => Promise<void>;
  title: string;
  setTitle: (title: string) => void;
  priority: Priority;
  setPriority: (priority: Priority) => void;
  busy: boolean;
  tagBusy: boolean;
  loading: boolean;
  ready: boolean;
  tags: Tag[];
  selectedTags: string[];
  setSelectedTags: (ids: string[]) => void;
  createTag: (name: string, color: string) => Promise<Tag>;
  tab: TaskTab;
  setTab: (tab: TaskTab) => void;
  tasks: Task[];
  ordinaryTasks: Task[];
  ordered: Task[];
  timer: Timer | null;
  setEditing: (value: { kind: 'task'; item: Task }) => void;
  restore: (task: Task) => Promise<void>;
  start: (task: Task) => Promise<void>;
  startButtons: RefObject<Map<number, HTMLButtonElement>>;
};
export default function TaskList({
  create,
  title,
  setTitle,
  priority,
  setPriority,
  busy,
  tagBusy,
  loading,
  tags,
  selectedTags,
  setSelectedTags,
  createTag,
  tab,
  setTab,
  tasks,
  ordinaryTasks,
  ordered,
  timer,
  setEditing,
  restore,
  start,
  startButtons,
  ready,
}: TaskListProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis tareas</h2>
          <span className="text-xs text-[var(--muted)]">Organiza tu día</span>
        </div>
        <form
          onSubmit={create}
          className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-2"
        >
          <input
            aria-label="Título de la tarea"
            placeholder="¿En qué vas a trabajar?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            required
            className="min-w-40 flex-1 border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-text)] rounded-lg"
          />
          <select
            aria-label="Prioridad"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"
          >
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <div className="w-full px-2 pb-2">
            <TagSelector
              tags={tags}
              selected={selectedTags}
              onChange={setSelectedTags}
              onCreate={createTag}
              disabled={busy || loading}
            />
          </div>
          <Button
            disabled={busy || tagBusy || loading || !title.trim()}
            className="flex w-full items-center justify-center gap-1 text-xs"
            type="submit"
          >
            <Plus size={16} />
            Agregar
          </Button>
        </form>
        <div
          className="mt-3 flex gap-4 overflow-x-auto text-xs"
          role="tablist"
          aria-label="Filtrar tareas"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`tab whitespace-nowrap ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Todas' && (
                <span className="ml-2 rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 text-[10px]">
                  {ordinaryTasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        {loading ? (
          <p role="status" className="p-10 text-center text-sm text-[var(--muted)]">
            Cargando tus tareas…
          </p>
        ) : ordered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ListTodo className="mx-auto mb-4 text-[var(--faint)]" size={30} />
            <p className="text-sm font-medium">
              {tasks.length ? 'No hay tareas con estos filtros' : 'Todo empieza con una tarea'}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {tasks.length
                ? 'Cambia el estado o la etiqueta para ver tus tareas.'
                : 'Agrega tu primera tarea y encuentra tu ritmo.'}
            </p>
          </div>
        ) : (
          <ul>
            {ordered.map((task) => (
              <li
                key={task.id}
                className={`flex items-center gap-3 border-b border-[var(--border)] px-6 py-5 last:border-b-0 ${timer?.taskId === task.id ? 'bg-[var(--accent-soft)]' : ''}`}
              >
                <span
                  className={
                    task.status === 'Terminada'
                      ? 'text-[var(--accent-text)]'
                      : 'text-[var(--faint)]'
                  }
                >
                  {task.status === 'Terminada' ? <Check size={19} /> : <Circle size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-words text-sm font-medium ${task.status === 'Terminada' ? 'text-[var(--muted)] line-through' : ''}`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className={`priority-${task.priority} rounded-md px-2 py-1 font-medium`}>
                      {task.priority}
                    </span>
                    <span
                      className={
                        task.status === 'En Progreso'
                          ? 'text-[var(--accent-text)]'
                          : 'text-[var(--muted)]'
                      }
                    >
                      {task.status}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--muted)]">
                      <TimerIcon size={12} />
                      {task.cycles_invested} {task.cycles_invested === 1 ? 'ciclo' : 'ciclos'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {task.tags.map((tag) => (
                      <TagChip key={tag.id} tag={tag} />
                    ))}
                    <button
                      type="button"
                      aria-label={`Editar etiquetas de ${task.title}`}
                      disabled={busy || timer?.taskId === task.id}
                      onClick={() => setEditing({ kind: 'task', item: task })}
                      className="flex items-center gap-1 text-[11px] text-[var(--accent-text)]"
                    >
                      <Tags size={12} />
                      {task.tags.length ? 'Editar' : 'Etiquetas'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'Terminada' && (
                    <button
                      type="button"
                      aria-label={`Restaurar tarea: ${task.title}`}
                      title="Volver a pendiente sin borrar el tiempo invertido"
                      disabled={busy}
                      onClick={() => void restore(task)}
                      className="rounded-lg border border-[var(--border)] p-2.5 text-[var(--accent-text)]"
                    >
                      <RotateCcw size={17} />
                    </button>
                  )}
                  <button
                    ref={(element) => {
                      if (element) startButtons.current.set(task.id, element);
                      else startButtons.current.delete(task.id);
                    }}
                    title={`Iniciar Pomodoro: ${task.title}`}
                    aria-label={`Iniciar Pomodoro: ${task.title}`}
                    disabled={busy || !!timer || task.status === 'Terminada' || !ready}
                    onClick={() => void start(task)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--accent-text)] hover:bg-[var(--accent-soft)]"
                  >
                    <Clock3 size={17} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--border)] px-6 py-4 text-[11px] text-[var(--muted)]">
        <Clock3 size={13} />
        Haz clic en el reloj de una tarea para comenzar.
      </div>
    </section>
  );
}
