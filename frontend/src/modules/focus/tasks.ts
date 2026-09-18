import { request } from '@/lib/http';
export const priorities = ['Baja', 'Media', 'Alta', 'Urgente'] as const;
export type Priority = (typeof priorities)[number];
export type Tag = { id: string; name: string; color: string };
export type Statistics = {
  date_from: string;
  date_to: string;
  time_zone: string;
  total_seconds: number;
  blocks: number;
  tasks: number;
  by_tag: (Tag & { seconds: number })[];
  by_day: { date: string; seconds: number }[];
  has_legacy_effort: boolean;
};
export type Task = {
  tags: Tag[];
  id: number;
  title: string;
  priority: Priority;
  status: 'Pendiente' | 'En Progreso' | 'Terminada';
  cycles_invested: number;
  created_at: string;
  updated_at: string | null;
  routine_id: number | null;
  routine_date: string | null;
};
export type Routine = {
  tags: Tag[];
  id: number;
  title: string;
  priority: Priority;
  active: boolean;
  created_at: string;
  updated_at: string | null;
};
export type RoutineDay = { date: string; time_zone: string; items: Routine[]; today_tasks: Task[] };
export const tasksApi = {
  list: () => request<Task[]>('/tasks'),
  get: (id: number) => request<Task>(`/tasks/${id}`),
  create: (title: string, priority: Priority, tag_ids: string[] = []) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify({ title, priority, tag_ids }) }),
  update: (id: number, data: object) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
export const routinesApi = {
  list: () => request<RoutineDay>('/routines'),
  create: (title: string, priority: Priority, tag_ids: string[] = []) =>
    request<Routine>('/routines', {
      method: 'POST',
      body: JSON.stringify({ title, priority, tag_ids }),
    }),
  update: (
    id: number,
    data: { active?: boolean; title?: string; priority?: Priority; tag_ids?: string[] },
  ) => request<Routine>(`/routines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  history: (id: number) => request<Task[]>(`/routines/${id}/history`),
};

export const tagsApi = {
  list: () => request<Tag[]>('/tags'),
  create: (name: string, color: string) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name, color }) }),
};
export const statisticsApi = {
  get: (from: string, to: string, tagId = '') =>
    request<Statistics>(
      `/statistics?date_from=${from}&date_to=${to}${tagId ? `&tag_id=${encodeURIComponent(tagId)}` : ''}`,
    ),
};
