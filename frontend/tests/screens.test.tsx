import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Pomodoro from '@/modules/focus/components/pomodoro';
import AuthShell from '@/modules/auth/components/auth-shell';
import StatisticsView, { formatTime } from '@/modules/focus/components/statistics';
import TagSelector from '@/modules/focus/components/tag-selector';
import TagEditor from '@/modules/focus/components/tag-editor';
import TimerSettingsMenu from '@/modules/focus/components/timer-settings';
import DailyRoutines from '@/modules/focus/components/daily-routines';
import FocusTimer from '@/modules/focus/components/focus-timer';
import Page from '@/app/page';
import DesignSystem from '@/app/design-system/page';
import { tasksApi, routinesApi, tagsApi, statisticsApi, type Task } from '@/modules/focus/tasks';
import { authApi } from '@/modules/auth/auth';
import { businessDay, makeTimer, DEFAULT_SETTINGS } from '@/modules/focus/timer';

vi.mock('@/modules/focus/tasks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/focus/tasks')>();
  return {
    ...original,
    tasksApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn() },
    routinesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), history: vi.fn() },
    tagsApi: { list: vi.fn(), create: vi.fn() },
    statisticsApi: { get: vi.fn() },
  };
});
vi.mock('@/modules/auth/auth', () => ({
  authApi: {
    me: vi.fn(),
    status: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    forgot: vi.fn(),
    reset: vi.fn(),
  },
}));

const user = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Santiago Giraldo',
  email: 'santi@example.test',
};
const tag = { id: 'tag-1', name: 'Personal', color: '#7c3aed' };
const routine = {
  id: 7,
  title: 'Leer a diario',
  priority: 'Media' as const,
  active: true,
  created_at: '2026-09-17T12:00:00Z',
  updated_at: null,
  tags: [tag],
};
let tasks: Task[];
function task(id = 1, status: Task['status'] = 'Pendiente'): Task {
  return {
    id,
    title: 'Escribir propuesta',
    priority: 'Alta',
    status,
    cycles_invested: 0,
    created_at: '2026-09-17T12:00:00Z',
    updated_at: null,
    routine_id: null,
    routine_date: null,
    tags: [tag],
  };
}
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.documentElement.dataset.theme = 'light';
  window.history.replaceState(null, '', '/');
  tasks = [task()];
  vi.mocked(tasksApi.list).mockImplementation(async () => tasks.map((value) => ({ ...value })));
  vi.mocked(tasksApi.get).mockImplementation(async (id) => ({
    ...tasks.find((value) => value.id === id)!,
  }));
  vi.mocked(tasksApi.create).mockImplementation(async (title, priority) => {
    const value = { ...task(2), title, priority };
    tasks.push(value);
    return value;
  });
  vi.mocked(tasksApi.update).mockImplementation(async (id, data) => {
    const changes = data as { action?: string; finished?: boolean; tag_ids?: string[] };
    const value = tasks.find((value) => value.id === id)!;
    if (changes.action === 'start') value.status = 'En Progreso';
    if (changes.action === 'resolve') {
      value.cycles_invested++;
      value.status = changes.finished ? 'Terminada' : 'En Progreso';
    }
    if (
      changes.action === 'restore' ||
      changes.action === 'interrupt' ||
      changes.action === 'uncheck'
    )
      value.status = 'Pendiente';
    if (changes.action === 'check') value.status = 'Terminada';
    return { ...value };
  });
  vi.mocked(routinesApi.list).mockResolvedValue({
    date: businessDay(),
    time_zone: 'America/Bogota',
    items: [routine],
    today_tasks: [],
  });
  vi.mocked(routinesApi.create).mockResolvedValue(routine);
  vi.mocked(routinesApi.update).mockResolvedValue(routine);
  vi.mocked(routinesApi.history).mockResolvedValue([
    { ...task(), routine_id: 7, routine_date: businessDay() },
  ]);
  vi.mocked(tagsApi.list).mockResolvedValue([tag]);
  vi.mocked(tagsApi.create).mockResolvedValue({ id: 'new', name: 'Laboral', color: '#2563eb' });
  vi.mocked(statisticsApi.get).mockResolvedValue({
    date_from: businessDay(),
    date_to: businessDay(),
    time_zone: 'America/Bogota',
    total_seconds: 120,
    blocks: 1,
    tasks: 1,
    by_tag: [{ ...tag, seconds: 120 }],
    by_day: [{ date: businessDay(), seconds: 120 }],
    has_legacy_effort: true,
  });
  vi.mocked(authApi.status).mockResolvedValue({ setup_required: true, email_recovery: true });
  vi.mocked(authApi.me).mockRejectedValue(new Error('Inicia sesión.'));
  vi.mocked(authApi.login).mockResolvedValue(user);
  vi.mocked(authApi.register).mockResolvedValue({ user, recovery_code: 'codigo-personal' });
  vi.mocked(authApi.reset).mockResolvedValue({
    message: 'Contraseña actualizada.',
    recovery_code: 'codigo-nuevo',
  });
  vi.mocked(authApi.forgot).mockResolvedValue({ message: 'Enlace enviado.' });
  vi.mocked(authApi.logout).mockResolvedValue({});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Pantallas migradas', () => {
  it('crea una tarea, inicia, pausa, reanuda y registra un cierre anticipado', async () => {
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByText('Escribir propuesta');
    fireEvent.change(screen.getByLabelText('Título de la tarea'), {
      target: { value: 'Nueva tarea' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await screen.findByText('Nueva tarea');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar.*Escribir propuesta/ }));
    await screen.findByRole('dialog');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Pausar' }));
    await screen.findByRole('button', { name: 'Reanudar' });
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar' }));
    await screen.findByRole('dialog');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Terminar' }));
    await waitFor(() => expect(tasks[0].status).toBe('Terminada'));
    fireEvent.click(screen.getByRole('tab', { name: 'Terminadas' }));
    expect(screen.getByText('Escribir propuesta')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Restaurar/ }));
    await waitFor(() => expect(tasks[0].status).toBe('Pendiente'));
    fireEvent.click(screen.getByRole('tab', { name: 'Estadísticas' }));
    await screen.findByText('Tu tiempo, en perspectiva');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  });
  it('resuelve una respuesta pendiente y permite guardar un bloque interrumpido', async () => {
    tasks = [task(1, 'En Progreso')];
    localStorage.setItem(
      `pomodoro-session-v2:${user.id}`,
      JSON.stringify({ ...makeTimer(1, 'work'), phase: 'decision', remaining: 0, deadline: null }),
    );
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByRole('button', { name: 'Continuar la misma tarea' });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar la misma tarea' }));
    await waitFor(() => expect(tasks[0].cycles_invested).toBe(1));
    await screen.findByRole('button', { name: 'Cambiar de tarea' });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar de tarea' }));
    await waitFor(() => expect(tasks[0].status).toBe('Pendiente'));
  });
  it('mantiene filtros, navegación y recuperación tras un error de carga', async () => {
    vi.mocked(tasksApi.list).mockRejectedValueOnce(new Error('Sin conexión.'));
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByText('Sin conexión.');
    fireEvent.click(screen.getByRole('button', { name: 'Recargar tareas' }));
    await screen.findByText('Escribir propuesta');
    fireEvent.change(screen.getByLabelText('Filtrar actividades por etiqueta'), {
      target: { value: 'untagged' },
    });
    fireEvent.change(screen.getByLabelText('Filtrar actividades por etiqueta'), {
      target: { value: tag.id },
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Rutinas diarias' }));
    await screen.findAllByText('Leer a diario');
    fireEvent.click(screen.getByRole('button', { name: /Desactivar/ }));
    await waitFor(() => expect(routinesApi.update).toHaveBeenCalled());
  });
  it('recupera acceso, valida confirmación y presenta un código nuevo', async () => {
    render(<Page />);
    await screen.findByRole('button', { name: 'Olvidé mi contraseña' });
    fireEvent.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }));
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: user.email },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviarme un enlace por correo' }));
    await screen.findByText('Enlace enviado.');
    fireEvent.change(screen.getByLabelText('Código de recuperación'), {
      target: { value: 'codigo' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña', { exact: true }), {
      target: { value: 'Clave-segura-2026' },
    });
    fireEvent.change(screen.getByLabelText('Repetir contraseña'), { target: { value: 'otra' } });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Restablecer contraseña' }).closest('form')!,
    );
    await screen.findByText('Las contraseñas no coinciden.');
    fireEvent.change(screen.getByLabelText('Repetir contraseña'), {
      target: { value: 'Clave-segura-2026' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Restablecer contraseña' }).closest('form')!,
    );
    await screen.findByText('codigo-nuevo');
    fireEvent.click(screen.getByRole('button', { name: /Ya lo guardé/ }));
    await screen.findByRole('button', { name: 'Iniciar sesión' });
  });
  it('registra una cuenta y entra al espacio privado', async () => {
    render(<AuthShell />);
    await screen.findByRole('button', { name: 'Crear una cuenta' });
    fireEvent.click(screen.getByRole('button', { name: 'Crear una cuenta' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: user.name } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText('Contraseña', { exact: true }), {
      target: { value: 'Clave-segura-2026' },
    });
    fireEvent.change(screen.getByLabelText('Repetir contraseña'), {
      target: { value: 'Clave-segura-2026' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear cuenta' }).closest('form')!);
    await screen.findByText('codigo-personal');
    fireEvent.click(screen.getByRole('button', { name: /Ya lo guardé/ }));
    await screen.findByText('Escribir propuesta');
    window.dispatchEvent(new Event('step-session-expired'));
    await screen.findByRole('button', { name: 'Volver al inicio de sesión' });
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio de sesión' }));
    await screen.findByRole('button', { name: 'Iniciar sesión' });
  });
  it('interpreta un enlace de recuperación y permite regresar al login', async () => {
    window.history.replaceState(null, '', '/#reset=token');
    render(<AuthShell />);
    await screen.findByText('Elige una nueva contraseña. El enlace solo puede usarse una vez.');
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio de sesión' }));
    await screen.findByRole('button', { name: 'Iniciar sesión' });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText('Contraseña', { exact: true }), {
      target: { value: 'Clave-segura-2026' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form')!);
    await screen.findByText('Escribir propuesta');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await screen.findByRole('button', { name: 'Iniciar sesión' });
  });
});

describe('Componentes conservados', () => {
  it('consulta estadísticas, valida fechas y muestra los estados vacíos y de error', async () => {
    const view = render(<StatisticsView tags={[tag]} revision={0} />);
    await screen.findByRole('table');
    fireEvent.focus(screen.getByRole('button', { name: /Personal: 2 min/ }));
    fireEvent.keyDown(screen.getByRole('button', { name: /Personal: 2 min/ }), { key: 'Enter' });
    fireEvent.change(screen.getByLabelText('Fecha desde'), { target: { value: '2020-01-01' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Ver estadísticas' }).closest('form')!);
    await screen.findByText('Selecciona un rango válido de hasta 367 días.');
    vi.mocked(statisticsApi.get).mockResolvedValue({
      ...(await statisticsApi.get('', '')),
      total_seconds: 0,
    });
    view.rerender(<StatisticsView tags={[tag]} revision={1} />);
    await screen.findByText('Todavía no hay tiempo registrado en este rango');
    vi.mocked(statisticsApi.get).mockRejectedValue(new Error('Sin reporte.'));
    view.rerender(<StatisticsView tags={[tag]} revision={2} />);
    await screen.findByText('Sin reporte.');
    expect(formatTime(3721)).toBe('1 h 2 min 1 s');
    expect(formatTime(61)).toBe('1 min 1 s');
    expect(formatTime(2)).toBe('2 s');
  });
  it('selecciona y crea etiquetas reutilizables', async () => {
    const onChange = vi.fn(),
      onCreate = vi.fn().mockResolvedValue(tag);
    render(<TagSelector tags={[tag]} selected={[]} onChange={onChange} onCreate={onCreate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar etiquetas' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Personal/ }));
    expect(onChange).toHaveBeenCalledWith([tag.id]);
    expect(screen.getByRole('checkbox', { name: /Personal/ })).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('checkbox', { name: /Personal/ })).toBeNull();
    const input = screen.getByPlaceholderText('Busca o escribe una etiqueta…');
    fireEvent.change(input, { target: { value: 'Nueva' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    fireEvent.keyDown(input, { key: 'Escape' });
  });
  it('registra el ciclo al cambiar de tarea después de terminar el tiempo', async () => {
    tasks = [task(1, 'En Progreso')];
    localStorage.setItem(
      `pomodoro-session-v2:${user.id}`,
      JSON.stringify({ ...makeTimer(1, 'work'), phase: 'decision', remaining: 0, deadline: null }),
    );
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    const dialog = await screen.findByRole('dialog', { name: 'El tiempo terminó' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cambiar de tarea' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'El tiempo terminó' })).toBeNull(),
    );
    expect(tasks[0].cycles_invested).toBe(1);
    expect(tasks[0].status).toBe('En Progreso');
    expect(localStorage.getItem(`pomodoro-session-v2:${user.id}`)).toBeNull();
  });
  it('mantiene la configuración y el catálogo del Design System', async () => {
    const onSave = vi.fn();
    render(<TimerSettingsMenu settings={DEFAULT_SETTINGS} onSave={onSave} disabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.submit(dialog.querySelector('form')!);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    cleanup();
    render(<DesignSystem />);
    expect(screen.getByRole('heading', { name: 'Design System · Step by step' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Modo oscuro/ }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
  it('conserva edición de etiquetas, historial y foco accesible', async () => {
    const onSave = vi.fn().mockResolvedValue(true),
      onClose = vi.fn();
    render(
      <TagEditor
        target={task()}
        tags={[tag]}
        onCreate={vi.fn()}
        onSave={onSave}
        onClose={onClose}
        busy={false}
      />,
    );
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    cleanup();
    render(
      <DailyRoutines
        tags={[tag]}
        onCreateTag={vi.fn()}
        onEditTags={vi.fn()}
        routines={[routine]}
        tasks={[{ ...task(), routine_id: 7, routine_date: businessDay() }]}
        day={businessDay()}
        busy={false}
        loading={false}
        ready={true}
        onCreate={vi.fn().mockResolvedValue(true)}
        onToggle={vi.fn()}
        onCheck={vi.fn()}
        onStart={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Historial/ }));
    await screen.findByRole('dialog');
    cleanup();
    const pause = vi.fn();
    render(
      <FocusTimer
        active
        title="Enfoque"
        minutes="30"
        seconds="00"
        busy={false}
        onPause={pause}
        onFinish={vi.fn()}
        onSwitch={vi.fn()}
      />,
    );
    await screen.findByRole('dialog');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Pausar' }));
    expect(pause).toHaveBeenCalled();
  });
});
