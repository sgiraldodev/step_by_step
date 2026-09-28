import { tasksApi, type Task } from '@/modules/focus/tasks';

export type TaskBatchAction = 'complete' | 'restore' | 'delete';
export type TaskBatchResult = {
  updated: Task[];
  deleted: number[];
  errors: string[];
};

// Cada petición conserva los permisos y validaciones de la operación individual.
export async function runTaskBatch(
  tasks: Task[],
  action: TaskBatchAction,
): Promise<TaskBatchResult> {
  const result: TaskBatchResult = { updated: [], deleted: [], errors: [] };
  for (const task of tasks) {
    try {
      if (action === 'delete') {
        await tasksApi.delete(task.id);
        result.deleted.push(task.id);
      } else {
        result.updated.push(await tasksApi.update(task.id, { action }));
      }
    } catch (reason) {
      result.errors.push(
        `${task.title}: ${reason instanceof Error ? reason.message : 'No se pudo procesar.'}`,
      );
    }
  }
  return result;
}
