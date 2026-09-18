'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  LogOut,
  BarChart3,
  Tags,
  CheckCheck,
  Coffee,
  Flame,
  Leaf,
  ListTodo,
  Repeat2,
  RotateCcw,
  Timer as TimerIcon,
} from 'lucide-react';
import {
  priorities,
  routinesApi,
  tasksApi,
  tagsApi,
  type Priority,
  type Routine,
  type Task,
} from '@/modules/focus/tasks';
import {
  investedSeconds,
  businessDay,
  makeTimer,
  REST_SECONDS,
  togglePause,
  WORK_SECONDS,
} from '@/modules/focus/timer';
import TimerSettingsMenu from '@/modules/focus/components/timer-settings';
import DailyRoutines from '@/modules/focus/components/daily-routines';
import TimerPanel from '@/modules/focus/components/timer-panel';
import FocusTimer from '@/modules/focus/components/focus-timer';
import OfficeGif from '@/modules/focus/components/office-gif';
import ThemeToggle from '@/components/ui/theme-toggle';
import TaskList, { type TaskTab } from '@/modules/focus/components/task-list';
import TagEditor from '@/modules/focus/components/tag-editor';
import StatisticsView from '@/modules/focus/components/statistics';
import { useFocusData } from '@/modules/focus/hooks/use-focus-data';
import { useTimerSession } from '@/modules/focus/hooks/use-timer-session';
import { useTimerSound } from '@/modules/focus/hooks/use-timer-sound';
import type { User } from '@/modules/auth/auth';

export default function Pomodoro({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => Promise<void>;
}) {
  const [section, setSection] = useState<'tasks' | 'routines' | 'statistics'>('tasks');
  const [tagBusy, setTagBusy] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [statsRevision, setStatsRevision] = useState(0);
  const [editing, setEditing] = useState<{ kind: 'task' | 'routine'; item: Task | Routine } | null>(
    null,
  );
  const [timeZone, setTimeZone] = useState('America/Bogota');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Media');
  const [tab, setTab] = useState<TaskTab>('Todas');
  const { timer, setTimer, ready, settings, saveSettings } = useTimerSession(
    user,
    timeZone,
    setError,
  );
  const lock = useRef(false);
  useTimerSound(timer, setError);
  const yesButton = useRef<HTMLButtonElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const startButtons = useRef(new Map<number, HTMLButtonElement>());
  const { tasks, setTasks, routines, tags, setTags, day, loading, dataLoaded, load } = useFocusData(
    timer,
    setTimer,
    timeZone,
    setTimeZone,
    setError,
    lock,
  );

  useEffect(() => {
    if (timer?.phase !== 'decision') return;
    const frame = requestAnimationFrame(() => yesButton.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [timer?.phase]);
  useEffect(() => {
    if (!loading && dataLoaded && timer) {
      const current = tasks.find((t) => t.id === timer.taskId);
      // Keep a decision open after a network retry: the receipt makes it idempotent.
      if (!current || (current.status === 'Terminada' && timer.phase !== 'decision'))
        setTimer(null);
    }
  }, [tasks, loading, dataLoaded, timer, setTimer]);

  const activeTask = tasks.find((t) => t.id === timer?.taskId);
  const ordinaryTasks = tasks.filter((t) => t.routine_id === null);
  const todayTasks = tasks.filter((t) => t.routine_id !== null && t.routine_date === day);
  const matchesTag = (task: Task) =>
    !tagFilter ||
    (tagFilter === 'untagged'
      ? task.tags.length === 0
      : task.tags.some((tag) => tag.id === tagFilter));
  const visibleTasks = (section === 'tasks' ? ordinaryTasks : todayTasks).filter(matchesTag);
  const completed = visibleTasks.filter((t) => t.status === 'Terminada').length;
  const cycles = visibleTasks.reduce((total, task) => total + task.cycles_invested, 0);
  const filtered = ordinaryTasks.filter(matchesTag).filter(
    (t) =>
      tab === 'Todas' ||
      t.status ===
        (
          {
            Pendientes: 'Pendiente',
            'En progreso': 'En Progreso',
            Terminadas: 'Terminada',
          } as Record<string, string>
        )[tab],
  );
  const ordered = [...filtered].sort(
    (a, b) =>
      Number(a.status === 'Terminada') - Number(b.status === 'Terminada') ||
      priorities.indexOf(b.priority) - priorities.indexOf(a.priority) ||
      b.id - a.id,
  );

  function replace(task: Task) {
    setTasks((current) => current.map((t) => (t.id === task.id ? task : t)));
  }
  async function act(action: () => Promise<void>) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ha ocurrido un error.');
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function create(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await act(async () => {
      const task = await tasksApi.create(title.trim(), priority, selectedTags);
      setTasks((current) => [task, ...current]);
      setTitle('');
      setSelectedTags([]);
    });
  }
  async function start(task: Task) {
    if (timer || task.status === 'Terminada') return;
    await act(async () => {
      replace(await tasksApi.update(task.id, { action: 'start' }));
      setTimer({ ...makeTimer(task.id, 'work', settings), routineDate: task.routine_date });
    });
  }
  async function createRoutine(title: string, priority: Priority, tagIds: string[]) {
    return act(async () => {
      await routinesApi.create(title, priority, tagIds);
      await load();
    });
  }
  async function createTag(name: string, color: string) {
    setTagBusy(true);
    try {
      const tag = await tagsApi.create(name, color);
      setTags((current) =>
        [...current.filter((item) => item.id !== tag.id), tag].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      return tag;
    } finally {
      setTagBusy(false);
    }
  }
  async function saveTags(ids: string[]) {
    if (!editing) return false;
    return act(async () => {
      if (editing.kind === 'task')
        replace(await tasksApi.update(editing.item.id, { tag_ids: ids }));
      else {
        await routinesApi.update(editing.item.id, { tag_ids: ids });
        await load();
      }
    });
  }
  async function toggleRoutine(routine: Routine) {
    await act(async () => {
      await routinesApi.update(routine.id, { active: !routine.active });
      await load();
    });
  }
  async function checkRoutine(task: Task) {
    await act(async () => {
      replace(
        await tasksApi.update(task.id, {
          action: task.status === 'Terminada' ? 'uncheck' : 'check',
        }),
      );
    });
  }
  async function resolve(finished: boolean, changeTask = false) {
    if (!timer || (timer.phase !== 'decision' && !(finished && timer.phase === 'work'))) return;
    const secondsInvested = investedSeconds(timer);
    const session = {
      ...(timer.phase === 'work' && !timer.paused ? togglePause(timer, settings) : timer),
      resolvedSeconds: secondsInvested,
      resolutionAction: 'resolve' as const,
    };
    setTimer(session);
    await act(async () => {
      // Stop an early-finished block immediately; a failed save can be retried safely.
      const task = await tasksApi.update(session.taskId, {
        action: 'resolve',
        finished,
        operation_id: session.operationId,
        seconds: secondsInvested,
      });
      replace(task);
      setStatsRevision((value) => value + 1);
      const pastRoutine = task.routine_date !== null && task.routine_date !== businessDay(timeZone);
      setTimer(
        finished || pastRoutine || changeTask
          ? null
          : { ...makeTimer(session.taskId, 'rest', settings), routineDate: task.routine_date },
      );
      if (changeTask) {
        setSection(session.routineDate ? 'routines' : 'tasks');
        setTagFilter('');
        setTab('Todas');
      }
      if (finished) setTimeout(() => startButtons.current.get(session.taskId)?.focus(), 0);
    });
  }
  async function switchTask() {
    if (!timer || busy || timer.resolutionAction === 'resolve') return;
    const seconds = timer.phase === 'rest' ? 0 : investedSeconds(timer);
    const session = {
      ...(timer.phase === 'work' && !timer.paused ? togglePause(timer, settings) : timer),
      resolvedSeconds: seconds,
      resolutionAction: 'interrupt' as const,
    };
    setTimer(session);
    await act(async () => {
      replace(
        await tasksApi.update(session.taskId, {
          action: 'interrupt',
          operation_id: session.operationId,
          seconds,
        }),
      );
      setTimer(null);
      setStatsRevision((value) => value + 1);
      setSection(session.routineDate ? 'routines' : 'tasks');
    });
  }
  async function restore(task: Task) {
    await act(async () => {
      replace(await tasksApi.update(task.id, { action: 'restore' }));
    });
  }
  const remaining = timer?.remaining ?? settings.workMinutes * 60;
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  const rest = timer?.phase === 'rest';
  const duration = timer?.duration ?? (rest ? REST_SECONDS : WORK_SECONDS);
  const progress = timer ? Math.max(0, Math.min(100, (1 - remaining / duration) * 100)) : 0;
  function pauseFocus() {
    setTimer((current) =>
      current && current.phase === 'work' && !current.paused
        ? togglePause(current, settings)
        : current,
    );
    requestAnimationFrame(() => resumeButton.current?.focus());
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-xl">
            <span className="rounded-xl bg-[var(--accent-soft)] p-2 text-[var(--accent-text)]">
              <TimerIcon size={23} />
            </span>
            Step by step
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-sm text-[var(--muted)] lg:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Tu espacio de enfoque
            </span>
            <span className="hidden text-xs text-[var(--muted)] sm:inline">{user.name}</span>
            <button
              type="button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              disabled={busy}
              onClick={() => void act(onLogout)}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--secondary)]"
            >
              <LogOut size={16} />
            </button>
            <ThemeToggle />
            <TimerSettingsMenu
              settings={settings}
              disabled={!ready || busy || timer?.phase === 'decision'}
              onSave={saveSettings}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--accent-text)]">
              Te damos la bienvenida, {user.name}.
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Menos ruido. Más enfoque.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Dale espacio a lo importante y avanza a tu propio ritmo.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--muted)]">
            <Leaf size={15} className="text-[var(--accent-text)]" />
            {settings.workMinutes} min de enfoque · {settings.restMinutes} min de descanso
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]"
          >
            <span>{error}</span>
            <button className="underline" onClick={() => void load()} disabled={busy}>
              Recargar tareas
            </button>
          </div>
        )}
        <div className="activity-tabs" role="tablist" aria-label="Tipo de actividad">
          <button
            role="tab"
            aria-selected={section === 'tasks'}
            className={`activity-tab ${section === 'tasks' ? 'active' : ''}`}
            onClick={() => setSection('tasks')}
          >
            <ListTodo size={18} />
            Tareas
          </button>
          <button
            role="tab"
            aria-selected={section === 'routines'}
            className={`activity-tab ${section === 'routines' ? 'active' : ''}`}
            onClick={() => setSection('routines')}
          >
            <Repeat2 size={18} />
            Rutinas diarias
          </button>
          <button
            role="tab"
            aria-selected={section === 'statistics'}
            className={`activity-tab ${section === 'statistics' ? 'active' : ''}`}
            onClick={() => setSection('statistics')}
          >
            <BarChart3 size={18} />
            Estadísticas
          </button>
        </div>
        {section === 'statistics' ? (
          <>
            <StatisticsView tags={tags} revision={statsRevision} />
            {timer?.paused && (
              <Button
                className="mt-6 text-sm"
                onClick={() => setSection(timer.routineDate ? 'routines' : 'tasks')}
              >
                Volver al temporizador pausado
              </Button>
            )}
          </>
        ) : (
          <>
            <label className="mb-5 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
              <Tags size={16} />
              Filtrar por etiqueta
              <select
                aria-label="Filtrar actividades por etiqueta"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="max-w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              >
                <option value="">Todas las etiquetas</option>
                <option value="untagged">Sin etiqueta</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mb-7 grid grid-cols-3 gap-3 md:gap-5">
              {[
                {
                  label: section === 'tasks' ? 'Tareas totales' : 'Rutinas de hoy',
                  value: visibleTasks.length,
                  icon: ListTodo,
                },
                {
                  label: section === 'tasks' ? 'Completadas' : 'Completadas hoy',
                  value: completed,
                  icon: CheckCheck,
                },
                {
                  label: section === 'tasks' ? 'Pomodoros invertidos' : 'Pomodoros de hoy',
                  value: cycles,
                  icon: Flame,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div className="panel flex items-center gap-4 p-4 md:p-5" key={label}>
                  <span className="hidden rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent-text)] sm:block">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] text-[var(--muted)] md:text-xs">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{loading ? '—' : value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_350px]">
              {section === 'routines' ? (
                <DailyRoutines
                  tags={tags}
                  onCreateTag={createTag}
                  onEditTags={(routine) => setEditing({ kind: 'routine', item: routine })}
                  routines={routines.filter(
                    (routine) =>
                      !tagFilter ||
                      (tagFilter === 'untagged'
                        ? routine.tags.length === 0
                        : routine.tags.some((tag) => tag.id === tagFilter)),
                  )}
                  tasks={todayTasks.filter(matchesTag)}
                  day={day}
                  busy={busy || tagBusy}
                  loading={loading}
                  timerTaskId={timer?.taskId}
                  ready={ready}
                  onCreate={createRoutine}
                  onToggle={(routine) => void toggleRoutine(routine)}
                  onCheck={(task) => void checkRoutine(task)}
                  onStart={(task) => void start(task)}
                />
              ) : (
                <TaskList
                  create={create}
                  title={title}
                  setTitle={setTitle}
                  priority={priority}
                  setPriority={setPriority}
                  busy={busy}
                  tagBusy={tagBusy}
                  loading={loading}
                  tags={tags}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  createTag={createTag}
                  tab={tab}
                  setTab={setTab}
                  tasks={tasks}
                  ordinaryTasks={ordinaryTasks}
                  ordered={ordered}
                  timer={timer}
                  setEditing={setEditing}
                  restore={restore}
                  start={start}
                  startButtons={startButtons}
                  ready={ready}
                />
              )}
              <aside className="space-y-5">
                <TimerPanel
                  rest={rest}
                  timer={timer}
                  progress={progress}
                  minutes={minutes}
                  seconds={seconds}
                  activeTask={activeTask}
                  settings={settings}
                  setTimer={setTimer}
                  resumeButton={resumeButton}
                  busy={busy}
                  resolve={resolve}
                  switchTask={switchTask}
                />
                <section className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-5">
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-text)]">
                    <Leaf size={15} />
                    Pequeños pasos, grandes avances
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[var(--secondary)]">
                    No necesitas hacerlo todo de una vez. Un bloque de enfoque es suficiente para
                    acercarte a tu objetivo.
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[10px] text-[var(--secondary)]">
                    <span className="flex items-center gap-1">
                      <TimerIcon size={12} />
                      {settings.workMinutes} min
                    </span>
                    <ArrowRight size={12} />
                    <span className="flex items-center gap-1">
                      <Coffee size={12} />
                      {settings.restMinutes} min
                    </span>
                    <ArrowRight size={12} />
                    <RotateCcw size={12} />
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
        <footer className="mt-10 text-center text-[11px] text-[var(--muted)]">
          Hecho para trabajar con intención, sin prisa.
        </footer>
      </main>
      <TagEditor
        target={editing?.item ?? null}
        tags={tags}
        onCreate={createTag}
        onSave={saveTags}
        onClose={() => setEditing(null)}
        busy={busy || tagBusy}
      />
      <FocusTimer
        active={timer?.phase === 'work' && !timer.paused && !!activeTask}
        title={activeTask?.title || ''}
        minutes={minutes}
        seconds={seconds}
        busy={busy}
        onPause={pauseFocus}
        onFinish={() => void resolve(true)}
        onSwitch={() => void switchTask()}
      />
      {timer?.phase === 'decision' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-5 backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const buttons =
                e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
              const index = Array.from(buttons).indexOf(
                document.activeElement as HTMLButtonElement,
              );
              buttons[(index + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            aria-describedby="decision-description"
            className="panel max-h-[calc(100dvh-2.5rem)] w-full max-w-md overflow-y-auto p-8 text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
              <CheckCheck size={27} />
            </span>
            <p className="mt-4 text-xs uppercase tracking-widest text-[var(--accent-text)]">
              {Math.round(duration / 60)} minutos bien invertidos
            </p>
            <h2 id="decision-title" className="mt-3 text-2xl font-semibold">
              El tiempo terminó
            </h2>
            <p id="decision-description" className="mt-3 break-words text-sm text-[var(--muted)]">
              {activeTask?.title} · Se registrará un ciclo. ¿Quieres continuar, terminar o cambiar
              de tarea?
            </p>
            <OfficeGif />
            {error && (
              <p role="alert" className="mt-4 text-sm text-[var(--error-text)]">
                {error}
              </p>
            )}
            <Button
              ref={yesButton}
              className="mt-6 w-full"
              disabled={busy}
              onClick={() => void resolve(false)}
            >
              {busy ? 'Guardando…' : 'Continuar la misma tarea'}
            </Button>
            <button
              className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm"
              disabled={busy}
              onClick={() => void resolve(true)}
            >
              Terminar tarea
            </button>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              disabled={busy}
              onClick={() => void resolve(false, true)}
            >
              Cambiar de tarea
            </Button>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Si continúas, tendrás {settings.restMinutes} minutos de descanso antes del siguiente
              ciclo de la misma tarea.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
