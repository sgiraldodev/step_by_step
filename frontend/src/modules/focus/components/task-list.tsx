'use client';
import { useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  Check,
  Circle,
  Clock3,
  Tags,
  RotateCcw,
  Plus,
  LoaderCircle,
  ListTodo,
  Timer as TimerIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Task, type Tag, type Priority } from '@/modules/focus/tasks';
import type { Timer } from '@/modules/focus/timer';
import { TagChip } from '@/modules/focus/components/tag-selector';
import ConfirmDeleteDialog from '@/modules/focus/components/confirm-delete-dialog';
import TaskCreateDialog from '@/modules/focus/components/task-create-dialog';
import TaskBulkActions from '@/modules/focus/components/task-bulk-actions';
import type { TaskBatchAction, TaskBatchResult } from '@/modules/focus/task-batch';
export const tabs = ['Pendientes', 'En progreso', 'Terminadas', 'Todas'] as const;
export type TaskTab = (typeof tabs)[number];
type TaskListProps = {
  selectionScope: string;
  onBulkAction: (tasks: Task[], action: TaskBatchAction) => Promise<TaskBatchResult>;
  create: (event: FormEvent) => Promise<boolean>;
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
  complete: (task: Task) => Promise<void>;
  start: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  startButtons: RefObject<Map<number, HTMLButtonElement>>;
};
export default function TaskList({
  selectionScope,
  onBulkAction,
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
  complete,
  start,
  onDelete,
  startButtons,
  ready,
}: TaskListProps) {
  const createButton = useRef<HTMLButtonElement>(null);
  const [creating, setCreating] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [selection, setSelection] = useState<{ scope: string; ids: number[] }>({
    scope: selectionScope,
    ids: [],
  });
  const [batchMessage, setBatchMessage] = useState('');
  if (selection.scope !== selectionScope) {
    setSelection({ scope: selectionScope, ids: [] });
    setBatchMessage('');
  }
  const selected = ordered.filter((task) => selection.ids.includes(task.id));
  const selectionDisabled = busy || loading || !ready;
  const allSelected = ordered.length > 0 && selected.length === ordered.length;
  async function applySelection(action: TaskBatchAction) {
    const result = await onBulkAction(selected, action);
    const succeeded = [...result.deleted, ...result.updated.map((task) => task.id)];
    setSelection((current) => ({
      ...current,
      ids: current.ids.filter((id) => !succeeded.includes(id)),
    }));
    setBatchMessage(
      `${succeeded.length} tareas procesadas.${result.errors.length ? ` ${result.errors.length} no se pudieron procesar; siguen seleccionadas. ${result.errors.join(' ')}` : ''}`,
    );
  }
  return (
    <section className="panel overflow-hidden">
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Mis tareas</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Un paso a la vez.</p>
          </div>
          <Button
            type="button"
            disabled={busy || loading}
            ref={createButton}
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 text-sm"
          >
            <Plus size={18} aria-hidden="true" /> Nueva tarea
          </Button>
        </div>
        <div
          className="my-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="tablist"
          aria-label="Filtrar tareas"
        >
          {tabs.map((t, index) => {
            const Icon = [Circle, LoaderCircle, Check, ListTodo][index];
            const status = ['Pendiente', 'En Progreso', 'Terminada', 'Todas'][index];
            const count = ordinaryTasks.filter(
              (task) => t === 'Todas' || task.status === status,
            ).length;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-label={t}
                aria-selected={tab === t}
                tabIndex={tab === t ? 0 : -1}
                onKeyDown={(event) => {
                  const destinations: Record<string, number> = {
                    ArrowRight: (index + 1) % tabs.length,
                    ArrowLeft: (index + tabs.length - 1) % tabs.length,
                    Home: 0,
                    End: tabs.length - 1,
                  };
                  const next = destinations[event.key];
                  if (next === undefined) return;
                  event.preventDefault();
                  setTab(tabs[next]);
                  (event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
                }}
                className={`flex min-h-11 items-center justify-center gap-1 sm:gap-2 rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${tab === t ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--secondary)] hover:bg-[var(--surface-hover)]'}`}
                onClick={() => setTab(t)}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span className="whitespace-nowrap text-xs sm:text-sm">{t}</span>
                <span
                  aria-hidden="true"
                  className="rounded-md bg-[var(--surface)]/15 px-1 text-xs sm:px-1.5"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {!loading && ordered.length > 0 && (
        <label className="flex min-h-11 items-center gap-3 border-t border-[var(--border)] px-6 py-2 text-sm">
          <input
            type="checkbox"
            aria-label="Seleccionar todas las tareas visibles"
            checked={allSelected}
            ref={(node) => {
              if (node) node.indeterminate = selected.length > 0 && !allSelected;
            }}
            disabled={selectionDisabled}
            onChange={() => {
              setBatchMessage('');
              setSelection({
                scope: selectionScope,
                ids: allSelected ? [] : ordered.map((task) => task.id),
              });
            }}
            className="size-4 shrink-0 accent-[var(--accent)]"
          />
          Seleccionar todas las visibles
        </label>
      )}
      {selected.length > 0 && (
        <TaskBulkActions
          selected={selected}
          busy={selectionDisabled}
          activeTaskId={timer?.taskId}
          onAction={applySelection}
          onClear={() => {
            setSelection({ scope: selectionScope, ids: [] });
            setBatchMessage('');
          }}
        />
      )}
      {batchMessage && (
        <p role="status" className="px-6 py-3 text-sm text-[var(--secondary)]">
          {batchMessage}
        </p>
      )}
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
                className={`flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-6 py-5 last:border-b-0 ${timer?.taskId === task.id ? 'bg-[var(--accent-soft)]' : ''}`}
              >
                <label className="flex min-h-11 items-center">
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar tarea: ${task.title}`}
                    checked={selected.some((item) => item.id === task.id)}
                    disabled={selectionDisabled}
                    onChange={(event) => {
                      setBatchMessage('');
                      setSelection({
                        scope: selectionScope,
                        ids: event.target.checked
                          ? [...selected.map((item) => item.id), task.id]
                          : selected.filter((item) => item.id !== task.id).map((item) => item.id),
                      });
                    }}
                    className="size-4 shrink-0 accent-[var(--accent)]"
                  />
                </label>
                <div className="min-w-0 flex-1 basis-[200px]">
                  <p
                    className={`break-words text-base font-semibold leading-6 sm:text-lg ${task.status === 'Terminada' ? 'text-[var(--muted)] line-through' : ''}`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
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
                      className="flex items-center gap-1 text-sm text-[var(--accent-text)]"
                    >
                      <Tags size={12} />
                      {task.tags.length ? 'Editar' : 'Etiquetas'}
                    </button>
                  </div>
                </div>
                <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                  {task.status !== 'Terminada' && (
                    <button
                      type="button"
                      aria-label={`Completar tarea: ${task.title}`}
                      title={
                        timer?.taskId === task.id
                          ? 'Resuelve el temporizador de esta tarea antes de completarla'
                          : 'Completar tarea sin agregar tiempo ni ciclos'
                      }
                      disabled={busy || !ready || timer?.taskId === task.id}
                      onClick={() => void complete(task)}
                      className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] p-2.5 text-[var(--accent-text)] hover:bg-[var(--surface-hover)]"
                    >
                      <Check size={17} aria-hidden="true" />
                    </button>
                  )}
                  {task.status !== 'Terminada' && (
                    <button
                      type="button"
                      aria-label={`Eliminar tarea: ${task.title}`}
                      title={`Eliminar tarea: ${task.title}`}
                      disabled={busy}
                      onClick={() => setTaskToDelete(task)}
                      className="rounded-lg border border-[var(--error-border)] p-2.5 text-[var(--error-text)] hover:bg-[var(--error-bg)]"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
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
      {creating && (
        <TaskCreateDialog
          create={create}
          title={title}
          setTitle={setTitle}
          priority={priority}
          setPriority={setPriority}
          busy={busy || tagBusy}
          tags={tags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          createTag={createTag}
          onClose={() => {
            setCreating(false);
            requestAnimationFrame(() => createButton.current?.focus());
          }}
        />
      )}
      {taskToDelete && (
        <ConfirmDeleteDialog
          title="Eliminar tarea"
          description={`Se borrará «${taskToDelete.title}» y todo el tiempo registrado para esta tarea. Esta acción no se puede deshacer. ¿Deseas continuar?`}
          busy={busy}
          onConfirm={() => onDelete(taskToDelete)}
          onClose={() => setTaskToDelete(null)}
        />
      )}
    </section>
  );
}
