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
import {
  tasksApi,
  routinesApi,
  tagsApi,
  statisticsApi,
  workspaceApi,
  type Task,
} from '@/modules/focus/tasks';
import { authApi } from '@/modules/auth/auth';
import { businessDay, makeTimer, DEFAULT_SETTINGS } from '@/modules/focus/timer';

vi.mock('@/modules/focus/tasks', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/focus/tasks')>();
  return {
    ...original,
    tasksApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    routinesApi: { list: vi.fn(), create: vi.fn(), update: vi.fn(), history: vi.fn() },
    tagsApi: { list: vi.fn(), create: vi.fn() },
    statisticsApi: { get: vi.fn() },
    workspaceApi: { clear: vi.fn() },
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
    sendCode: vi.fn(),
    verifyCode: vi.fn(),
    sendRegistrationCode: vi.fn(),
    verifyRegistrationCode: vi.fn(),
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
  vi.mocked(tasksApi.delete).mockImplementation(async (id) => {
    tasks = tasks.filter((value) => value.id !== id);
  });
  vi.mocked(workspaceApi.clear).mockImplementation(async (keepTags) => {
    tasks = [];
    if (!keepTags) vi.mocked(tagsApi.list).mockResolvedValue([]);
    vi.mocked(routinesApi.list).mockResolvedValue({
      date: businessDay(),
      time_zone: 'America/Bogota',
      items: [],
      today_tasks: [],
    });
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
    if (changes.action === 'check' || changes.action === 'complete') value.status = 'Terminada';
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
  it('selecciona varias tareas, las completa y permite restaurarlas en conjunto', async () => {
    tasks = [task(1), { ...task(2), title: 'Segunda tarea', cycles_invested: 3 }];
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Seleccionar tarea: Escribir propuesta' }),
    );
    expect(
      (
        screen.getByRole('checkbox', {
          name: 'Seleccionar todas las tareas visibles',
        }) as HTMLInputElement
      ).indeterminate,
    ).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar tarea: Segunda tarea' }));
    fireEvent.click(screen.getByRole('button', { name: 'Completar seleccionadas' }));
    await screen.findByText('2 tareas procesadas.');
    expect(tasks.map((task) => task.status)).toEqual(['Terminada', 'Terminada']);
    expect(tasks[1].cycles_invested).toBe(3);
    fireEvent.click(screen.getByRole('tab', { name: 'Terminadas' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }),
    );
    expect(
      (screen.getByRole('button', { name: 'Eliminar seleccionadas' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a pendientes' }));
    await screen.findByText('2 tareas procesadas.');
    expect(tasks.map((task) => task.status)).toEqual(['Pendiente', 'Pendiente']);
    expect(tasks[1].cycles_invested).toBe(3);
  });
  it('limpia la selección al cambiar filtros y solo selecciona tareas visibles', async () => {
    tasks = [task(1), { ...task(2, 'Terminada'), title: 'Terminada' }];
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }),
    );
    expect(screen.getByText('1 seleccionadas')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Todas' }));
    expect(screen.queryByRole('button', { name: 'Completar seleccionadas' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Pendientes' }));
    expect(
      (
        screen.getByRole('checkbox', {
          name: 'Seleccionar tarea: Escribir propuesta',
        }) as HTMLInputElement
      ).checked,
    ).toBe(false);
  });
  it('confirma el borrado múltiple y conserva solo los fallos para reintentar', async () => {
    tasks = [task(1), { ...task(2), title: 'Segunda tarea' }];
    vi.mocked(tasksApi.delete).mockRejectedValueOnce(new Error('Sin conexión'));
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar seleccionadas' }));
    expect(tasksApi.delete).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    expect(tasksApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar seleccionadas' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, borrar' }));
    await screen.findByText(/1 tareas procesadas.*1 no se pudieron procesar/);
    expect(tasks).toHaveLength(1);
    expect(screen.getByText('1 seleccionadas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar seleccionadas' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, borrar' }));
    await screen.findByText('Todo empieza con una tarea');
    expect(tasks).toHaveLength(0);
    expect(tasksApi.delete).toHaveBeenCalledTimes(3);
  });
  it('bloquea cambios masivos de estado si se selecciona el reloj activo', async () => {
    tasks = [task(1, 'En Progreso')];
    localStorage.setItem(
      `pomodoro-session-v2:${user.id}`,
      JSON.stringify({ ...makeTimer(1, 'work'), paused: true, deadline: null }),
    );
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByRole('button', { name: 'Reanudar' });
    fireEvent.click(screen.getByRole('tab', { name: 'En progreso' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Seleccionar todas las tareas visibles' }),
    );
    expect(
      (screen.getByRole('button', { name: 'Completar seleccionadas' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar seleccionadas' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, borrar' }));
    await screen.findByText('Todo empieza con una tarea');
    expect(screen.queryByRole('button', { name: 'Reanudar' })).toBeNull();
  });
  it('conserva el borrador al cerrar el modal y permite reintentar la creación', async () => {
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByText('Escribir propuesta');
    expect(screen.queryByLabelText('Título de la tarea')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    fireEvent.change(screen.getByLabelText('Título de la tarea'), {
      target: { value: 'Mi borrador' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    expect((screen.getByLabelText('Título de la tarea') as HTMLInputElement).value).toBe(
      'Mi borrador',
    );
    vi.mocked(tasksApi.create).mockRejectedValueOnce(new Error('Sin conexión'));
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));
    await within(screen.getByRole('dialog')).findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));
    await screen.findByText('Mi borrador');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('completa sin reloj ni ciclos, filtra las terminadas y permite restaurar', async () => {
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    const filters = within(screen.getByRole('tablist', { name: 'Filtrar tareas' }));
    expect(filters.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'))).toEqual([
      'Pendientes',
      'En progreso',
      'Terminadas',
      'Todas',
    ]);
    expect(filters.getByRole('tab', { name: 'Pendientes' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Completar tarea: Escribir propuesta' }),
    );
    await waitFor(() => expect(tasks[0].status).toBe('Terminada'));
    expect(tasksApi.update).toHaveBeenCalledWith(1, { action: 'complete' });
    expect(tasks[0].cycles_invested).toBe(0);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: /Completar tarea:/ })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Terminadas' }));
    expect(screen.getByText('Escribir propuesta')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Restaurar tarea:/ }));
    await waitFor(() => expect(tasks[0].status).toBe('Pendiente'));
    expect(tasks[0].cycles_invested).toBe(0);
  });
  it('conserva la tarea y permite reintentar si completar falla', async () => {
    vi.mocked(tasksApi.update).mockRejectedValueOnce(new Error('No se pudo completar.'));
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    const complete = await screen.findByRole('button', { name: /Completar tarea:/ });
    fireEvent.click(complete);
    await screen.findByText('No se pudo completar.');
    expect(tasks[0].status).toBe('Pendiente');
    fireEvent.click(complete);
    await waitFor(() => expect(tasks[0].status).toBe('Terminada'));
  });
  it('bloquea completar la tarea con reloj pausado pero permite completar otra', async () => {
    tasks = [task(1, 'En Progreso'), { ...task(2), title: 'Otra tarea' }];
    localStorage.setItem(
      `pomodoro-session-v2:${user.id}`,
      JSON.stringify({ ...makeTimer(1, 'work'), paused: true, deadline: null }),
    );
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByRole('button', { name: 'Reanudar' });
    fireEvent.click(screen.getByRole('tab', { name: 'Todas' }));
    expect(
      (
        screen.getByRole('button', {
          name: 'Completar tarea: Escribir propuesta',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Completar tarea: Otra tarea' }));
    await waitFor(() => expect(tasks[1].status).toBe('Terminada'));
    expect(tasks[0].status).toBe('En Progreso');
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeTruthy();
  });
  it('separa la portada del acceso y permite abrir directamente el registro', async () => {
    render(<Page />);
    await screen.findByRole('heading', { name: /Enfócate en lo importante/ });
    expect(screen.queryByLabelText('Correo electrónico')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Bienvenido a tu espacio' })).toBeNull();
    cleanup();
    window.history.replaceState(null, '', '/acceso#registro');
    render(<AuthShell />);
    await screen.findByRole('heading', { name: 'Crea tu cuenta' });
    expect(screen.getByRole('button', { name: 'Enviar código al correo' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /Enfócate en lo importante/ })).toBeNull();
  });
  it('crea una tarea, inicia, pausa, reanuda y registra un cierre anticipado', async () => {
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    await screen.findByText('Escribir propuesta');
    fireEvent.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    fireEvent.change(screen.getByLabelText('Título de la tarea'), {
      target: { value: 'Nueva tarea de prueba' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea' }));
    await screen.findByText('Nueva tarea de prueba');
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
    expect(screen.getByText('Un momento de The Office')).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('src')).toMatch(/\/gifs\/the-office\/.+\.gif$/);
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
    render(<AuthShell />);
    await screen.findByRole('button', { name: 'Olvidé mi contraseña' });
    fireEvent.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }));
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: user.email },
    });
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
    vi.mocked(authApi.sendRegistrationCode).mockResolvedValue({
      message: 'Enviado.',
      expires_at: new Date(Date.now() + 180000).toISOString(),
    });
    vi.mocked(authApi.verifyRegistrationCode).mockResolvedValue({ token: 'token-de-registro' });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: user.email },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'Enviar código al correo' }).closest('form')!,
    );
    await screen.findByLabelText('Código de 4 dígitos');
    fireEvent.change(screen.getByLabelText('Código de 4 dígitos'), { target: { value: '0123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Validar código' }).closest('form')!);
    await screen.findByLabelText('Nombre');
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
    fireEvent.click(screen.getByText('Personal').closest('label')!);
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
    render(
      <TimerSettingsMenu
        settings={DEFAULT_SETTINGS}
        onSave={onSave}
        onClear={vi.fn()}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByRole('radio')).toHaveLength(10);
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Rosado' }));
    expect(document.documentElement.dataset.color).toBe('pink');
    fireEvent.submit(dialog.querySelector('form')!);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    cleanup();
    render(<DesignSystem />);
    expect(screen.getByRole('heading', { name: 'Design System · Step by step' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Modo oscuro/ }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
  it('confirma antes de eliminar una tarea y retira su temporizador', async () => {
    tasks = [task(1, 'En Progreso')];
    localStorage.setItem(
      `pomodoro-session-v2:${user.id}`,
      JSON.stringify({ ...makeTimer(1, 'work'), paused: true, deadline: null }),
    );
    render(<Pomodoro user={user} onLogout={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: 'En progreso' }));
    await screen.findByRole('button', { name: 'Eliminar tarea: Escribir propuesta' });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar tarea: Escribir propuesta' }));
    const confirm = screen.getByRole('dialog', { name: 'Eliminar tarea' });
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancelar' }));
    expect(tasksApi.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar tarea: Escribir propuesta' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Eliminar tarea' })).getByRole('button', {
        name: 'Sí, borrar',
      }),
    );
    await waitFor(() => expect(tasksApi.delete).toHaveBeenCalledWith(1));
    await waitFor(() => expect(localStorage.getItem(`pomodoro-session-v2:${user.id}`)).toBeNull());
    expect(screen.queryByRole('button', { name: 'Eliminar tarea: Escribir propuesta' })).toBeNull();
  });
  it('advierte la limpieza completa y permite conservar etiquetas', async () => {
    const onClear = vi.fn().mockResolvedValue(undefined);
    render(
      <TimerSettingsMenu
        settings={DEFAULT_SETTINGS}
        onSave={vi.fn()}
        onClear={onClear}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Configuración' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar mi espacio de trabajo' }));
    const confirm = screen.getByRole('dialog', { name: 'Limpiar mi espacio de trabajo' });
    expect(
      within(confirm).getByText(
        /tareas en cualquier estado, rutinas, tiempo trabajado y estadísticas/,
      ),
    ).toBeTruthy();
    const keep = within(confirm).getByRole('checkbox', { name: 'Conservar mis etiquetas' });
    expect((keep as HTMLInputElement).checked).toBe(false);
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancelar' }));
    expect(onClear).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar mi espacio de trabajo' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Conservar mis etiquetas' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Limpiar mi espacio de trabajo' })).getByRole(
        'button',
        { name: 'Sí, borrar' },
      ),
    );
    await waitFor(() => expect(onClear).toHaveBeenCalledWith(true));
  });
  it('mantiene abierta la confirmación si falla la limpieza', async () => {
    render(
      <TimerSettingsMenu
        settings={DEFAULT_SETTINGS}
        onSave={vi.fn()}
        onClear={vi.fn().mockRejectedValue(new Error('La limpieza no se pudo completar.'))}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Configuración' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar mi espacio de trabajo' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Limpiar mi espacio de trabajo' })).getByRole(
        'button',
        { name: 'Sí, borrar' },
      ),
    );
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'La limpieza no se pudo completar.',
    );
    expect(screen.getByRole('dialog', { name: 'Limpiar mi espacio de trabajo' })).toBeTruthy();
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
