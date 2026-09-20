'use client';
import { Button } from '@/components/ui/button';

import { useRef, useState, type FormEvent } from 'react';
import { Clock3, History, Tags, Plus, Repeat2, X } from 'lucide-react';
import TagSelector, { TagChip } from '@/modules/focus/components/tag-selector';
import {
  priorities,
  routinesApi,
  type Priority,
  type Routine,
  type Task,
  type Tag,
} from '@/modules/focus/tasks';

export default function DailyRoutines({
  tags,
  onCreateTag,
  onEditTags,
  routines,
  tasks,
  day,
  busy,
  loading,
  timerTaskId,
  ready,
  onCreate,
  onToggle,
  onCheck,
  onStart,
}: {
  tags: Tag[];
  onCreateTag: (name: string, color: string) => Promise<Tag>;
  onEditTags: (routine: Routine) => void;
  routines: Routine[];
  tasks: Task[];
  day: string;
  busy: boolean;
  loading: boolean;
  timerTaskId?: number;
  ready: boolean;
  onCreate: (title: string, priority: Priority, tagIds: string[]) => Promise<boolean>;
  onToggle: (routine: Routine) => void;
  onCheck: (task: Task) => void;
  onStart: (task: Task) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Media');
  const [historyTitle, setHistoryTitle] = useState('');
  const [history, setHistory] = useState<Task[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const historyDialog = useRef<HTMLDialogElement>(null);
  const historyRequest = useRef(0);
  async function create(e: FormEvent) {
    e.preventDefault();
    if (title.trim() && (await onCreate(title.trim(), priority, selectedTags))) {
      setTitle('');
      setSelectedTags([]);
    }
  }
  async function showHistory(routine: Routine) {
    const request = ++historyRequest.current;
    setHistoryTitle(routine.title);
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    historyDialog.current?.showModal();
    try {
      const items = await routinesApi.history(routine.id);
      if (request === historyRequest.current) setHistory(items);
    } catch (e) {
      if (request === historyRequest.current)
        setHistoryError(e instanceof Error ? e.message : 'No se pudo cargar el historial.');
    } finally {
      if (request === historyRequest.current) setHistoryLoading(false);
    }
  }
  const todayTasks = new Map(
    tasks.filter((task) => task.routine_date === day).map((task) => [task.routine_id, task]),
  );
  const ordered = [...routines].sort((a, b) => Number(b.active) - Number(a.active) || a.id - b.id);
  const completed = tasks.filter(
    (task) => task.routine_date === day && task.status === 'Terminada',
  ).length;
  const active = routines.filter((routine) => routine.active).length;
  const dayLabel = day
    ? new Date(`${day}T12:00:00Z`).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      })
    : 'hoy';
  return (
    <section className="panel overflow-hidden" aria-label="Rutinas diarias">
      <div className="px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Repeat2 size={19} className="text-[var(--accent-text)]" />
            Mis rutinas diarias
          </h2>
          <span className="text-xs text-[var(--muted)]">{dayLabel}</span>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          Créala una vez y repítela cada día. Marca la casilla cuando la hagas o usa el reloj para
          concentrarte.
        </p>
        <form
          onSubmit={create}
          className="mt-4 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-2"
        >
          <input
            aria-label="Título de la rutina"
            placeholder="Ej. hacer ejercicio, almorzar, leer…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            required
            className="min-w-40 flex-1 rounded-lg bg-transparent px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-text)]"
          />
          <select
            aria-label="Prioridad de la rutina"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"
          >
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Button
            type="submit"
            disabled={busy || loading || !ready || !title.trim()}
            className="flex items-center gap-1 text-xs"
          >
            <Plus size={16} />
            Crear rutina
          </Button>
          <div className="w-full pb-2">
            <TagSelector
              tags={tags}
              selected={selectedTags}
              onChange={setSelectedTags}
              onCreate={onCreateTag}
              disabled={busy || loading}
            />
          </div>
        </form>
        <div className="my-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-[var(--accent-text)]">
            <Repeat2 size={13} />
            Se repiten todos los días
          </span>
          <span className="text-[var(--muted)]">
            {completed} de {active} completadas hoy
          </span>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        {loading ? (
          <p role="status" className="p-10 text-center text-sm text-[var(--muted)]">
            Cargando tus rutinas…
          </p>
        ) : ordered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Repeat2 size={30} className="mx-auto mb-4 text-[var(--faint)]" />
            <p className="text-sm font-medium">Un hábito pequeño, todos los días</p>
            <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
              Agrega tus actividades habituales. Mañana estarán pendientes otra vez.
            </p>
          </div>
        ) : (
          <ul>
            {ordered.map((routine) => {
              const task = todayTasks.get(routine.id);
              const done = task?.status === 'Terminada';
              const running = !!task && task.id === timerTaskId;
              return (
                <li
                  key={routine.id}
                  className={`flex items-start gap-3 border-b border-[var(--border)] px-6 py-5 last:border-b-0 ${running ? 'bg-[var(--accent-soft)]' : ''}`}
                >
                  <input
                    type="checkbox"
                    aria-label={`Marcar ${routine.title} como ${done ? 'pendiente' : 'hecha'} hoy`}
                    checked={done}
                    disabled={busy || !routine.active || !task || running || !ready}
                    onChange={() => task && onCheck(task)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words text-sm font-medium ${done ? 'text-[var(--muted)] line-through' : !routine.active ? 'text-[var(--muted)]' : ''}`}
                    >
                      {routine.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                      <span
                        className={`priority-${routine.priority} rounded-md px-2 py-1 font-medium`}
                      >
                        {routine.priority}
                      </span>
                      <span
                        className={
                          routine.active ? 'text-[var(--accent-text)]' : 'text-[var(--muted)]'
                        }
                      >
                        {routine.active
                          ? done
                            ? 'Hecha hoy'
                            : task?.status || 'Pendiente'
                          : 'Desactivada'}
                      </span>
                      <span className="text-[var(--muted)]">
                        {task?.cycles_invested ?? 0} ciclos hoy
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {routine.tags.map((tag) => (
                        <TagChip key={tag.id} tag={tag} />
                      ))}
                      <button
                        type="button"
                        aria-label={`Editar etiquetas de ${routine.title}`}
                        disabled={busy || running}
                        onClick={() => onEditTags(routine)}
                        className="flex items-center gap-1 text-[11px] text-[var(--accent-text)]"
                      >
                        <Tags size={12} />
                        {routine.tags.length ? 'Editar' : 'Etiquetas'}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
                      <button
                        className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--accent-text)]"
                        onClick={() => void showHistory(routine)}
                      >
                        <History size={12} />
                        Historial<span className="sr-only"> de {routine.title}</span>
                      </button>
                      <button
                        disabled={busy || running || loading}
                        onClick={() => onToggle(routine)}
                        className="text-[var(--muted)] underline hover:text-[var(--accent-text)]"
                      >
                        {routine.active ? 'Desactivar' : 'Volver a activar'}
                        <span className="sr-only"> {routine.title}</span>
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={`Iniciar Pomodoro: ${routine.title}`}
                    title={`Iniciar Pomodoro: ${routine.title}`}
                    disabled={
                      busy ||
                      timerTaskId !== undefined ||
                      done ||
                      !routine.active ||
                      !task ||
                      !ready
                    }
                    onClick={() => task && onStart(task)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--accent-text)] hover:bg-[var(--accent-soft)]"
                  >
                    <Clock3 size={17} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="border-t border-[var(--border)] px-6 py-4 text-[11px] leading-5 text-[var(--muted)]">
        Un nuevo día comienza a las 00:00 de Colombia. La rutina se conserva y su historial también.
      </p>
      <dialog
        ref={historyDialog}
        aria-labelledby="routine-history-title"
        className="m-auto max-h-[85vh] w-[90vw] max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-xl backdrop:bg-slate-900/35 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="routine-history-title" className="text-lg font-semibold">
              Historial de la rutina
            </h2>
            <p className="mt-2 break-words text-sm text-[var(--muted)]">{historyTitle}</p>
          </div>
          <button
            aria-label="Cerrar historial"
            onClick={() => historyDialog.current?.close()}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>
        {historyLoading ? (
          <p role="status" className="py-8 text-sm text-[var(--muted)]">
            Cargando historial…
          </p>
        ) : historyError ? (
          <p role="alert" className="py-8 text-sm text-[var(--error-text)]">
            {historyError}
          </p>
        ) : history.length === 0 ? (
          <p className="py-8 text-sm text-[var(--muted)]">
            Todavía no hay registros para esta rutina.
          </p>
        ) : (
          <>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Últimos 30 registros diarios · Colombia
            </p>
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {history.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                >
                  <time dateTime={task.routine_date || undefined}>{task.routine_date}</time>
                  <span
                    className={
                      task.status === 'Terminada'
                        ? 'text-[var(--accent-text)]'
                        : 'text-[var(--muted)]'
                    }
                  >
                    {task.status === 'Terminada' ? 'Hecha' : task.status}
                  </span>
                  <span className="text-[var(--muted)]">{task.cycles_invested} ciclos</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </dialog>
    </section>
  );
}
